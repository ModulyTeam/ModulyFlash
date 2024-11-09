class PortfolioList {
    constructor() {
        this.portfolios = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelector('nav a[data-section="portfolios"]').addEventListener('click', (e) => {
            e.preventDefault();
            this.loadPortfolios();
        });
    }

    async loadPortfolios() {
        try {
            const response = await fetch(`${API_URL}/portfolios`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.portfolios = await response.json();
            this.renderPortfolios();
        } catch (error) {
            console.error('Error cargando carteras:', error);
        }
    }

    renderPortfolios() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="portfolios-section">
                <h2>Carteras de Descuento</h2>
                
                <div class="portfolios-grid">
                    ${this.portfolios.map(portfolio => `
                        <div class="portfolio-card">
                            <div class="portfolio-header">
                                <h3>Cartera de ${portfolio.type === 'FACTURA' ? 'Facturas' : 
                                             portfolio.type === 'LETRA' ? 'Letras' : 
                                             'Documentos Mixtos'}</h3>
                                <span class="status-badge ${portfolio.status.toLowerCase()}">
                                    ${portfolio.status}
                                </span>
                            </div>
                            
                            <div class="portfolio-details">
                                <p><strong>Banco:</strong> ${portfolio.bankId.name}</p>
                                <p><strong>Moneda:</strong> ${portfolio.currency}</p>
                                <p><strong>Monto Total:</strong> ${portfolio.currency === 'PEN' ? 'S/. ' : '$ '}${portfolio.totalAmount.toFixed(2)}</p>
                                <p><strong>Valor Descontado:</strong> ${portfolio.currency === 'PEN' ? 'S/. ' : '$ '}${portfolio.discountedAmount.toFixed(2)}</p>
                                <p><strong>Fecha de Descuento:</strong> ${new Date(portfolio.discountDate).toLocaleDateString()}</p>
                            </div>
                            
                            <div class="portfolio-actions">
                                <select class="status-select" data-portfolio-id="${portfolio._id}">
                                    <option value="PENDIENTE" ${portfolio.status === 'PENDIENTE' ? 'selected' : ''}>Pendiente</option>
                                    <option value="APROBADA" ${portfolio.status === 'APROBADA' ? 'selected' : ''}>Aprobada</option>
                                    <option value="RECHAZADA" ${portfolio.status === 'RECHAZADA' ? 'selected' : ''}>Rechazada</option>
                                    <option value="EN_PROCESO" ${portfolio.status === 'EN_PROCESO' ? 'selected' : ''}>En Proceso</option>
                                    <option value="COMPLETADA" ${portfolio.status === 'COMPLETADA' ? 'selected' : ''}>Completada</option>
                                </select>
                                <button onclick="portfolioList.downloadPdf('${portfolio._id}')" class="download-button">
                                    Descargar PDF
                                </button>
                                ${(portfolio.status === 'APROBADA' || portfolio.status === 'COMPLETADA') ? `
                                    <div class="pdf-upload">
                                        <input type="file" 
                                            id="pdfUpload_${portfolio._id}" 
                                            accept=".pdf" 
                                            style="display: none;"
                                            onchange="portfolioList.handlePdfUpload('${portfolio._id}', this.files[0])"
                                        >
                                        <button onclick="document.getElementById('pdfUpload_${portfolio._id}').click()" class="upload-button">
                                            Reemplazar PDF
                                        </button>
                                    </div>
                                ` : ''}
                                <button onclick="portfolioList.deletePortfolio('${portfolio._id}')" class="delete-button">
                                    Eliminar Cartera
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Agregar listeners para los selectores de estado
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', (e) => {
                this.updatePortfolioStatus(e.target.dataset.portfolioId, e.target.value);
            });
        });
    }

    async updatePortfolioStatus(portfolioId, status) {
        try {
            const response = await fetch(`${API_URL}/portfolios/${portfolioId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el estado');
            }

            // Recargar la lista para mostrar los cambios
            this.loadPortfolios();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar el estado de la cartera');
        }
    }

    async downloadPdf(portfolioId) {
        try {
            const response = await fetch(`${API_URL}/portfolios/${portfolioId}/download`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al descargar el PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cartera-${portfolioId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al descargar el PDF');
        }
    }

    async deletePortfolio(portfolioId) {
        if (!confirm('¿Está seguro de que desea eliminar esta cartera? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/portfolios/${portfolioId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar la cartera');
            }

            // Recargar la lista
            this.loadPortfolios();
            alert('Cartera eliminada exitosamente');
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar la cartera');
        }
    }

    async handlePdfUpload(portfolioId, file) {
        if (!file) return;
        
        try {
            const formData = new FormData();
            formData.append('pdf', file);

            const response = await fetch(`${API_URL}/portfolios/${portfolioId}/updatePdf`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el PDF');
            }

            alert('PDF actualizado exitosamente');
            this.loadPortfolios(); // Recargar la lista
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar el PDF. Por favor, intente nuevamente.');
        }
    }
}

// Crear la instancia
const portfolioList = new PortfolioList(); 