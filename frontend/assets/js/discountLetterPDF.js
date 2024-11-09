class DiscountLetterPDF {
    static async generate(results) {
        try {
            // Usar el bankId que viene en los resultados
            if (!results.bankId) {
                throw new Error('No se encontró el ID del banco');
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configuración inicial
            const bank = results.details[0].bank;
            const currency = results.details[0].currency;
            const currencySymbol = currency === 'PEN' ? 'S/. ' : '$ ';
            const totalDiscounted = results.details.reduce((sum, doc) => sum + doc.discountedValue, 0);
            
            // Encabezado
            doc.setFontSize(20);
            doc.text('LETRA DE DESCUENTO', 105, 20, { align: 'center' });
            
            // Información del banco
            doc.setFontSize(14);
            doc.text(bank, 20, 40);
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 50);
            
            // Detalles principales
            doc.setFontSize(12);
            doc.text(`Tipo de Cartera: ${results.details[0].type === 'FACTURA' ? 'Facturas' : 'Letras'}`, 20, 70);
            doc.text(`Moneda: ${currency}`, 20, 80);
            doc.text(`Valor Total Descontado: ${currencySymbol}${totalDiscounted.toFixed(2)}`, 20, 90);
            doc.text(`Fecha de Descuento: ${new Date(results.selectedDate).toLocaleDateString()}`, 20, 100);
            
            // Tabla de documentos
            doc.autoTable({
                startY: 120,
                head: [['Documento', 'Emisión', 'Vencimiento', 'Valor Original', 'Valor Descontado']],
                body: results.details.map(doc => [
                    doc.documentCode,
                    new Date(doc.emissionDate).toLocaleDateString(),
                    new Date(doc.dueDate).toLocaleDateString(),
                    `${currencySymbol}${doc.originalAmount.toFixed(2)}`,
                    `${currencySymbol}${doc.discountedValue.toFixed(2)}`
                ]),
                theme: 'grid',
                styles: { fontSize: 10 },
                headStyles: { fillColor: [44, 62, 80] }
            });
            
            // Espacios para firmas
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
            formData.append('type', results.details[0].type || 'MIXTA');
            formData.append('currency', currency);
            formData.append('totalAmount', results.details.reduce((sum, doc) => sum + doc.originalAmount, 0));
            formData.append('discountedAmount', totalDiscounted);
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
            alert(error.message || 'Error al generar y guardar la cartera');
        }
    }
} 