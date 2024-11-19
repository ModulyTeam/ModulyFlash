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
        const currencySymbol = currency === 'PEN' ? 'S/. ' : '$ ';

        content.innerHTML = `
            <div class="discount-letter-preview">
                <div class="letter-header">
                    <h2>Acuerdo de Operación de Descuento</h2>
                    <div class="bank-info">
                        <h3>${bank}</h3>
                        <p>Fecha de Emisión: ${new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div class="letter-body">
                    <div class="letter-details">
                        <p><strong>Modalidad de Cartera:</strong> ${documentType === 'FACTURA' ? 'Facturas Negociables' : documentType === 'LETRA' ? 'Letras de Cambio' : 'Instrumentos Mixtos'}</p>
                        <p><strong>Moneda de Operación:</strong> ${currency === 'PEN' ? 'Soles (PEN)' : 'Dólares Americanos (USD)'}</p>
                        <p><strong>Valor Presente Descontado Neto Total:</strong> ${currencySymbol}${totalDiscounted.toFixed(2)}</p>
                        <p><strong>Fecha de Operación:</strong> ${new Date(results.selectedDate).toLocaleDateString()}</p>
                        
                        <div class="payment-description">
                            <pre>${results.paymentDescription}</pre>
                        </div>
                    </div>

                    <div class="documents-summary">
                        <h4>Detalle de Instrumentos Financieros</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Instrumento</th>
                                    <th>Fecha de Emisión</th>
                                    <th>Fecha de Vencimiento</th>
                                    <th>Valor Nominal</th>
                                    <th>Valor Presente Neto</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${results.details.map(doc => `
                                    <tr>
                                        <td>${doc.documentCode}</td>
                                        <td>${new Date(doc.emissionDate).toLocaleDateString()}</td>
                                        <td>${new Date(doc.dueDate).toLocaleDateString()}</td>
                                        <td>${currencySymbol}${doc.originalAmount.toFixed(2)}</td>
                                        <td>${currencySymbol}${doc.discountedValue.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="letter-footer">
                        <div class="signatures">
                            <div class="signature-line">
                                <p>____________________</p>
                                <p>El Cliente</p>
                                <p class="signature-subtitle">Cedente</p>
                            </div>
                            <div class="signature-line">
                                <p>____________________</p>
                                <p>La Entidad Financiera</p>
                                <p class="signature-subtitle">Cesionario</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="action-buttons">
                    <button onclick="history.back()" class="back-button">Volver</button>
                    <button onclick="DiscountLetter.savePortfolio(window.tempPortfolioResults)" class="save-button">
                        Formalizar Operación
                    </button>
                </div>
            </div>
        `;
    }

    static async savePortfolio(results) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(20);
            doc.text('ACUERDO DE OPERACIÓN DE DESCUENTO', 105, 20, { align: 'center' });
            
            doc.setFontSize(14);
            doc.text(results.details[0].bank, 20, 40);
            doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 20, 50);
            
            doc.setFontSize(12);
            doc.text(`Modalidad de Cartera: ${results.details[0].type === 'FACTURA' ? 'Facturas Negociables' : 'Letras de Cambio'}`, 20, 70);
            doc.text(`Moneda de Operación: ${results.details[0].currency === 'PEN' ? 'Soles (PEN)' : 'Dólares Americanos (USD)'}`, 20, 80);
            doc.text(`Valor Presente Descontado Neto Total: ${results.details[0].currency === 'PEN' ? 'S/. ' : '$ '}${results.details.reduce((sum, doc) => sum + doc.discountedValue, 0).toFixed(2)}`, 20, 90);
            doc.text(`Fecha de Operación: ${new Date(results.selectedDate).toLocaleDateString()}`, 20, 100);
            
            doc.autoTable({
                startY: 120,
                head: [['Instrumento', 'Emisión', 'Vencimiento', 'Valor Nominal', 'Valor Presente']],
                body: results.details.map(doc => [
                    doc.documentCode,
                    new Date(doc.emissionDate).toLocaleDateString(),
                    new Date(doc.dueDate).toLocaleDateString(),
                    `${doc.currency === 'PEN' ? 'S/. ' : '$ '}${doc.originalAmount.toFixed(2)}`,
                    `${doc.currency === 'PEN' ? 'S/. ' : '$ '}${doc.discountedValue.toFixed(2)}`
                ]),
                theme: 'grid',
                styles: { fontSize: 10 },
                headStyles: { fillColor: [24, 71, 140] }
            });
            
            const finalY = doc.lastAutoTable.finalY + 50;
            doc.line(20, finalY, 90, finalY);
            doc.line(120, finalY, 190, finalY);
            doc.text('El Cliente (Cedente)', 35, finalY + 10);
            doc.text('La Entidad Financiera (Cesionario)', 125, finalY + 10);

            const pdfBlob = doc.output('blob');

            const formData = new FormData();
            formData.append('pdf', pdfBlob, 'cartera.pdf');
            formData.append('bankId', results.bankId);
            formData.append('type', results.details[0].type);
            formData.append('currency', results.details[0].currency);
            formData.append('totalAmount', results.details.reduce((sum, doc) => sum + doc.originalAmount, 0));
            formData.append('discountedAmount', results.details.reduce((sum, doc) => sum + doc.discountedValue, 0));
            formData.append('interestAmount', results.details.reduce((sum, doc) => sum + (doc.amountToDiscount - doc.discountedValue), 0));
            formData.append('discountDate', results.selectedDate);

            const documentsData = results.details.map(doc => ({
                documentId: doc.documentId,  
                originalAmount: doc.originalAmount,
                discountedAmount: doc.discountedValue
            }));

            console.log('Documentos a enviar:', documentsData); 

            formData.append('documents', JSON.stringify(documentsData));

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

            window.location.href = '#portfolios';
        } catch (error) {
            console.error('Error:', error);
            alert('Error al generar y guardar la cartera');
        }
    }
} 