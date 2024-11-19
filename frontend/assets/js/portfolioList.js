class PortfolioList {
    constructor() {
        if (window.portfolioList) {
            return window.portfolioList;
        }
        this.portfolios = [];
        this.setupEventListeners();
        window.portfolioList = this;
    }

    setupEventListeners() {
        document.querySelector('nav a[data-section="portfolios"]')?.addEventListener('click', (e) => {
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
            const portfolios = await response.json();
            this.renderPortfolios(portfolios);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    renderPortfolios(portfolios) {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="portfolios-section">
                <h2>Carteras de Descuento</h2>
                <div class="portfolios-grid">
                    ${portfolios.map(portfolio => `
                        <div class="portfolio-card">
                            <div class="portfolio-header">
                                <h3>${portfolio.bankId.name}</h3>
                                <span class="status-badge ${portfolio.status.toLowerCase()}">${portfolio.status}</span>
                            </div>
                            <div class="portfolio-details">
                                <p><strong>Tipo:</strong> ${portfolio.type}</p>
                                <p><strong>Moneda:</strong> ${portfolio.currency}</p>
                                <p><strong>Monto Total:</strong> ${portfolio.currency === 'PEN' ? 'S/. ' : '$ '}${portfolio.totalAmount.toFixed(2)}</p>
                                <p><strong>Monto Descontado:</strong> ${portfolio.currency === 'PEN' ? 'S/. ' : '$ '}${portfolio.discountedAmount.toFixed(2)}</p>
                                <p><strong>Fecha de Descuento:</strong> ${new Date(portfolio.discountDate).toLocaleDateString()}</p>
                            </div>
                            <div class="portfolio-actions">
                                ${this.renderStatusSelect(portfolio)}
                                <button class="download-button" onclick="portfolioList.downloadPdf('${portfolio._id}')">
                                    Descargar PDF
                                </button>
                                ${['APROBADA', 'COMPLETADA'].includes(portfolio.status) ? `
                                    <div class="upload-container">
                                        <input type="file" id="pdf-${portfolio._id}" accept=".pdf" style="display: none;"
                                            onchange="portfolioList.handlePdfUpload('${portfolio._id}', this.files[0])">
                                        <button class="upload-button" onclick="document.getElementById('pdf-${portfolio._id}').click()">
                                            Actualizar PDF
                                        </button>
                                    </div>
                                ` : ''}
                                <button class="info-button" onclick="portfolioList.showDetails('${portfolio._id}')">
                                    Más Información
                                </button>
                                <button class="delete-button" onclick="portfolioList.deletePortfolio('${portfolio._id}')">
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Agregar event listeners para los selects de estado
        portfolios.forEach(portfolio => {
            const select = document.getElementById(`status-${portfolio._id}`);
            if (select) {
                select.addEventListener('change', (e) => this.updateStatus(portfolio._id, e.target.value));
            }
        });
    }

    async updateStatus(portfolioId, status) {
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

    async showDetails(portfolioId) {
        try {
            const response = await fetch(`${API_URL}/portfolios/${portfolioId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const portfolio = await response.json();
            
            const modal = document.createElement('div');
            modal.className = 'portfolio-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="portfolio-summary">
                        <h3>Detalles de la Cartera</h3>
                        <div class="summary-info">
                            <p><strong>Banco:</strong> ${portfolio.bankId.name}</p>
                            <p><strong>Tipo:</strong> ${portfolio.type}</p>
                            <p><strong>Moneda:</strong> ${portfolio.currency}</p>
                            <p><strong>Estado:</strong> <span class="status-badge ${portfolio.status.toLowerCase()}">${portfolio.status}</span></p>
                            <p><strong>Monto Total:</strong> ${portfolio.currency === 'PEN' ? 'S/. ' : '$ '}${portfolio.totalAmount.toFixed(2)}</p>
                            <p><strong>Monto Descontado:</strong> ${portfolio.currency === 'PEN' ? 'S/. ' : '$ '}${portfolio.discountedAmount.toFixed(2)}</p>
                            <p><strong>Interés Total:</strong> ${portfolio.currency === 'PEN' ? 'S/. ' : '$ '}${portfolio.interestAmount.toFixed(2)}</p>
                            <p><strong>Fecha de Descuento:</strong> ${new Date(portfolio.discountDate).toLocaleDateString()}</p>
                            <p><strong>Fecha de Creación:</strong> ${new Date(portfolio.createdAt).toLocaleDateString()}</p>
                            <p><strong>Última Actualización:</strong> ${new Date(portfolio.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div class="documents-section">
                        <h4>Documentos en la Cartera</h4>
                        <div class="documents-list">
                            ${portfolio.documents.map((doc, index) => `
                                <div class="document-item">
                                    <div class="document-header">
                                        <span class="document-number">Documento #${index + 1}</span>
                                    </div>
                                    <div class="document-details">
                                        <div class="detail-row">
                                            <span class="detail-label">Monto Original:</span>
                                            <span class="detail-value">${portfolio.currency === 'PEN' ? 'S/. ' : '$ '}${doc.originalAmount.toFixed(2)}</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="detail-label">Monto Descontado:</span>
                                            <span class="detail-value">${portfolio.currency === 'PEN' ? 'S/. ' : '$ '}${doc.discountedAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <button class="close-button" onclick="this.closest('.portfolio-modal').remove()">Cerrar</button>
                </div>
            `;
            document.body.appendChild(modal);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar los detalles de la cartera');
        }
    }

    renderStatusSelect(portfolio) {
        const options = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'EN_PROCESO', 'COMPLETADA'];
        return `
            <select id="status-${portfolio._id}" class="status-select">
                ${options.map(option => `
                    <option value="${option}" ${portfolio.status === option ? 'selected' : ''}>
                        ${option}
                    </option>
                `).join('')}
            </select>
        `;
    }
}

// Estilos adicionales para el modal y el botón de información
const styles = `
    .info-button {
        background-color: #ff9800;
        color: white;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .info-button:hover {
        background-color: #f57c00;
    }

    .portfolio-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
    }

    .documents-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
        margin: 1rem 0;
    }

    .document-item {
        background: var(--accent-color);
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid var(--primary-color);
    }

    .close-button {
        background: var(--primary-color);
        color: white;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 1rem;
    }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Crear la instancia global
window.portfolioList = new PortfolioList(); 