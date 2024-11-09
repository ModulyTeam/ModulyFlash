class DiscountLetter {
    static generatePreview(results) {
        if (!results || !results.details || !results.details.length) {
            console.error('No hay resultados para mostrar');
            return;
        }

        const content = document.getElementById('content');
        const bank = results.details[0].bank;
        const currency = results.details[0].currency;
        const totalDiscounted = results.details.reduce((sum, doc) => sum + doc.discountedValue, 0);
        const documentType = results.details[0].type || 'MIXTO';

        content.innerHTML = `
            <div class="discount-letter-preview">
                <div class="letter-header">
                    <h2>Vista Previa - Letra de Descuento</h2>
                    <div class="bank-info">
                        <h3>${bank}</h3>
                        <p>Fecha: ${new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div class="letter-body">
                    <div class="letter-details">
                        <p><strong>Tipo de Cartera:</strong> ${documentType === 'FACTURA' ? 'Facturas' : documentType === 'LETRA' ? 'Letras' : 'Mixta'}</p>
                        <p><strong>Moneda:</strong> ${currency}</p>
                        <p><strong>Valor Total Descontado:</strong> ${currency === 'PEN' ? 'S/. ' : '$ '}${totalDiscounted.toFixed(2)}</p>
                        <p><strong>Fecha de Descuento:</strong> ${new Date(results.selectedDate).toLocaleDateString()}</p>
                        
                        <div class="payment-description">
                            <pre>${results.paymentDescription}</pre>
                        </div>
                    </div>

                    <div class="documents-summary">
                        <h4>Documentos en Cartera</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Documento</th>
                                    <th>Emisión</th>
                                    <th>Vencimiento</th>
                                    <th>Valor Original</th>
                                    <th>Valor Descontado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${results.details.map(doc => `
                                    <tr>
                                        <td>${doc.documentCode}</td>
                                        <td>${new Date(doc.emissionDate).toLocaleDateString()}</td>
                                        <td>${new Date(doc.dueDate).toLocaleDateString()}</td>
                                        <td>${currency === 'PEN' ? 'S/. ' : '$ '}${doc.originalAmount.toFixed(2)}</td>
                                        <td>${currency === 'PEN' ? 'S/. ' : '$ '}${doc.discountedValue.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="letter-footer">
                        <div class="signatures">
                            <div class="signature-line">
                                <p>____________________</p>
                                <p>Firma del Cliente</p>
                            </div>
                            <div class="signature-line">
                                <p>____________________</p>
                                <p>Firma del Banco</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="action-buttons">
                    <button onclick="history.back()" class="back-button">Volver</button>
                    <button onclick="DiscountLetter.savePortfolio(window.tempPortfolioResults)" class="save-button">
                        Guardar Cartera
                    </button>
                </div>
            </div>
        `;
    }

    static async savePortfolio(results) {
        try {
            // Determinar el tipo de cartera basado en los documentos
            const types = [...new Set(results.details.map(doc => doc.type))];
            const portfolioType = types.length > 1 ? 'MIXTA' : types[0];

            // Generar el PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configuración inicial
            doc.setFontSize(20);
            doc.text(`CARTERA DE ${portfolioType === 'FACTURA' ? 'FACTURAS' : portfolioType === 'LETRA' ? 'LETRAS' : 'MIXTA'}`, 105, 20, { align: 'center' });
            
            // Información del banco y fecha
            doc.setFontSize(14);
            doc.text(results.details[0].bank, 20, 40);
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 50);
            
            // Agregar el acuerdo
            doc.setFontSize(12);
            const paymentDescription = results.paymentDescription;
            const splitDescription = doc.splitTextToSize(paymentDescription, 170);
            doc.text(splitDescription, 20, 70);

            // Agregar tabla de documentos
            const tableY = doc.getTextDimensions(splitDescription).h + 90;
            doc.autoTable({
                startY: tableY,
                head: [['Documento', 'Emisión', 'Vencimiento', 'Valor Original', 'Valor Descontado']],
                body: results.details.map(doc => [
                    doc.documentCode,
                    new Date(doc.emissionDate).toLocaleDateString(),
                    new Date(doc.dueDate).toLocaleDateString(),
                    `${doc.currency === 'PEN' ? 'S/. ' : '$ '}${doc.originalAmount.toFixed(2)}`,
                    `${doc.currency === 'PEN' ? 'S/. ' : '$ '}${doc.discountedValue.toFixed(2)}`
                ]),
                theme: 'grid',
                styles: { fontSize: 10 },
                headStyles: { fillColor: [44, 62, 80] }
            });

            // Agregar firmas
            const finalY = doc.lastAutoTable.finalY + 50;
            doc.line(20, finalY, 90, finalY);
            doc.line(120, finalY, 190, finalY);
            doc.text('Firma del Cliente', 40, finalY + 10);
            doc.text('Firma del Banco', 140, finalY + 10);
            
            // Convertir el PDF a blob
            const pdfBlob = doc.output('blob');

            // Crear FormData para enviar el archivo
            const formData = new FormData();
            formData.append('pdf', pdfBlob, 'cartera.pdf');
            formData.append('bankId', results.bankId);
            formData.append('type', portfolioType);
            formData.append('currency', results.details[0].currency);
            formData.append('totalAmount', results.details.reduce((sum, doc) => sum + doc.originalAmount, 0));
            formData.append('discountedAmount', results.details.reduce((sum, doc) => sum + doc.discountedValue, 0));
            formData.append('interestAmount', results.details.reduce((sum, doc) => sum + (doc.amountToDiscount - doc.discountedValue), 0));
            formData.append('discountDate', results.selectedDate);
            formData.append('documents', JSON.stringify(results.details.map(doc => ({
                documentId: doc.documentId,
                originalAmount: doc.originalAmount,
                discountedAmount: doc.discountedValue
            }))));

            // Guardar en la base de datos
            const response = await fetch(`${API_URL}/portfolios`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar la cartera');
            }

            const savedPortfolio = await response.json();
            alert('Cartera guardada exitosamente');

            // Redirigir a la vista de carteras
            window.location.href = '/portfolios';
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Error al guardar la cartera. Por favor, intente nuevamente.');
        }
    }
} 