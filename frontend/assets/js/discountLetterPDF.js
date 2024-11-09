class DiscountLetterPDF {
    static generate(portfolioResults) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configuración inicial
        const bank = portfolioResults.details[0].bank;
        const currency = portfolioResults.details[0].currency;
        const currencySymbol = currency === 'PEN' ? 'S/. ' : '$ ';
        const totalDiscounted = portfolioResults.details.reduce((sum, doc) => sum + doc.discountedValue, 0);
        
        // Encabezado
        doc.setFontSize(20);
        doc.text('LETRA DE DESCUENTO', 105, 20, { align: 'center' });
        
        // Información del banco
        doc.setFontSize(14);
        doc.text(bank, 20, 40);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 50);
        
        // Detalles principales
        doc.setFontSize(12);
        doc.text(`Tipo de Cartera: ${portfolioResults.details[0].type === 'FACTURA' ? 'Facturas' : 'Letras'}`, 20, 70);
        doc.text(`Moneda: ${currency}`, 20, 80);
        doc.text(`Valor Total Descontado: ${currencySymbol}${totalDiscounted.toFixed(2)}`, 20, 90);
        doc.text(`Fecha de Descuento: ${new Date(portfolioResults.selectedDate).toLocaleDateString()}`, 20, 100);
        
        // Tabla de documentos
        doc.autoTable({
            startY: 120,
            head: [['Documento', 'Emisión', 'Vencimiento', 'Valor Original', 'Valor Descontado']],
            body: portfolioResults.details.map(doc => [
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
        
        // Guardar PDF
        doc.save('letra-de-descuento.pdf');
    }
} 