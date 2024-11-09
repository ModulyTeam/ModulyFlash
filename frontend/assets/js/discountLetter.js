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
                    <button onclick="DiscountLetterPDF.generate(window.tempPortfolioResults)" class="create-button">
                        Crear Letra de Descuento
                    </button>
                </div>
            </div>
        `;
    }
} 