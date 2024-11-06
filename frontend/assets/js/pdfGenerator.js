class PDFGenerator {
    static async generatePortfolioPDF(results, selectedDate, methodName, daysConfig) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Estilo del encabezado
            this.addHeader(doc, selectedDate, methodName, daysConfig);
            
            let yPos = 60;

            // Agregar resumen ejecutivo
            yPos = this.addExecutiveSummary(doc, results, yPos);
            
            // Agregar tablas por moneda
            yPos = this.addCurrencyTables(doc, results, yPos);
            
            // Agregar detalles de cálculo
            yPos = this.addCalculationDetails(doc, results, yPos);
            
            // Agregar conclusiones
            this.addConclusions(doc, results);

            doc.save('cartera-descuento.pdf');
        } catch (error) {
            console.error('Error al exportar PDF:', error);
            alert('Error al exportar PDF. Por favor, intente nuevamente.');
        }
    }

    static addHeader(doc, selectedDate, methodName, daysConfig) {
        doc.setFillColor(44, 62, 80);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.text('Reporte de Cartera de Descuento', 15, 20);
        
        doc.setFontSize(12);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 15, 30);
        doc.text(`Fecha de Descuento: ${new Date(selectedDate).toLocaleDateString()}`, 90, 30);
        doc.text(`Método: ${methodName}`, 15, 37);
        doc.text(`Config: ${daysConfig}`, 90, 37);
    }

    static addExecutiveSummary(doc, results, startY) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text('Resumen Ejecutivo', 15, startY);
        
        const penDocs = results.details.filter(d => d.currency === 'PEN');
        const usdDocs = results.details.filter(d => d.currency === 'USD');
        
        let y = startY + 10;
        
        if (penDocs.length > 0) {
            const penTotals = this.calculateTotals(penDocs);
            doc.setFontSize(12);
            doc.text(`Total en Soles: S/. ${penTotals.discountedValue.toFixed(2)}`, 20, y);
            y += 7;
        }
        
        if (usdDocs.length > 0) {
            const usdTotals = this.calculateTotals(usdDocs);
            doc.setFontSize(12);
            doc.text(`Total en Dólares: $ ${usdTotals.discountedValue.toFixed(2)}`, 20, y);
            y += 7;
        }
        
        return y + 10;
    }

    static addCurrencyTables(doc, results, startY) {
        const penDocs = results.details.filter(d => d.currency === 'PEN');
        const usdDocs = results.details.filter(d => d.currency === 'USD');
        
        let y = startY;
        
        if (penDocs.length > 0) {
            doc.setFontSize(14);
            doc.text('Documentos en Soles (PEN)', 15, y);
            y += 10;
            
            y = this.addDocumentsTable(doc, penDocs, 'S/. ', y);
            y += 15;
        }
        
        if (usdDocs.length > 0) {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFontSize(14);
            doc.text('Documentos en Dólares (USD)', 15, y);
            y += 10;
            
            y = this.addDocumentsTable(doc, usdDocs, '$ ', y);
            y += 15;
        }
        
        return y;
    }

    static addDocumentsTable(doc, docs, symbol, y) {
        const headers = [
            'Documento',
            'Banco',
            'Monto Original',
            'Valor Futuro',
            'Valor Descontado'
        ];
        
        const data = docs.map(doc => [
            doc.documentCode,
            doc.bank,
            `${symbol}${doc.originalAmount.toFixed(2)}`,
            `${symbol}${doc.futureValue.toFixed(2)}`,
            `${symbol}${doc.discountedValue.toFixed(2)}`
        ]);
        
        const totals = this.calculateTotals(docs);
        data.push([
            'TOTALES',
            '',
            `${symbol}${totals.originalAmount.toFixed(2)}`,
            `${symbol}${totals.futureValue.toFixed(2)}`,
            `${symbol}${totals.discountedValue.toFixed(2)}`
        ]);
        
        doc.autoTable({
            startY: y,
            head: [headers],
            body: data,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            headStyles: {
                fillColor: [44, 62, 80],
                textColor: [255, 255, 255]
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240]
            }
        });
        
        return doc.lastAutoTable.finalY;
    }

    static addCalculationDetails(doc, results, startY) {
        if (startY > 200) {
            doc.addPage();
            startY = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Detalle de Cálculos', 15, startY);
        
        let y = startY + 10;
        
        results.details.forEach(detail => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFontSize(12);
            doc.text(`Documento: ${detail.documentCode}`, 20, y);
            y += 7;
            
            doc.setFontSize(10);
            doc.text(`• Días hasta vencimiento: ${detail.daysToMaturity}`, 25, y);
            y += 5;
            doc.text(`• TCEA: ${detail.tcea}%`, 25, y);
            y += 5;
            doc.text(`• Tasa de descuento: ${detail.discountRate}%`, 25, y);
            y += 10;
        });
        
        return y;
    }

    static addConclusions(doc, results) {
        doc.addPage();
        
        doc.setFontSize(14);
        doc.text('Conclusiones', 15, 20);
        
        let y = 30;
        
        // Agrupar por banco
        const bankGroups = this.groupByBank(results.details);
        
        Object.entries(bankGroups).forEach(([bank, docs]) => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            const totals = this.calculateTotals(docs);
            const currencySymbol = docs[0].currency === 'PEN' ? 'S/. ' : '$ ';
            
            doc.setFontSize(12);
            doc.text(`${bank}:`, 20, y);
            y += 7;
            
            doc.setFontSize(10);
            doc.text(`Total a financiar: ${currencySymbol}${totals.discountedValue.toFixed(2)}`, 25, y);
            y += 5;
            
            doc.text(`Documentos: ${docs.map(d => d.documentCode).join(', ')}`, 25, y);
            y += 10;
        });
    }

    static calculateTotals(docs) {
        return docs.reduce((acc, curr) => ({
            originalAmount: acc.originalAmount + curr.originalAmount,
            futureValue: acc.futureValue + curr.futureValue,
            discountedValue: acc.discountedValue + curr.discountedValue
        }), { originalAmount: 0, futureValue: 0, discountedValue: 0 });
    }

    static groupByBank(docs) {
        return docs.reduce((groups, doc) => {
            const key = `${doc.bank} (${doc.currency})`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(doc);
            return groups;
        }, {});
    }
} 