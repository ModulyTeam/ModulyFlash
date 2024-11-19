class PortfolioCalculations {
    static renderCurrencyResults(currency, documents, totals) {
        const currencySymbol = currency === 'PEN' ? 'S/. ' : '$ ';
        return `
            <div class="currency-results">
                <h4>Resultados en ${currency === 'PEN' ? 'Soles' : 'Dólares'}</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Documento</th>
                            <th>Valor Nominal</th>
                            <th>Valor Futuro</th>
                            <th>Valor Presente Neto</th>
                            <th>Tasa Efectiva</th>
                            <th>Plazo (días)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${documents.map(doc => `
                            <tr>
                                <td>${doc.documentCode}</td>
                                <td>${currencySymbol}${doc.originalAmount.toFixed(2)}</td>
                                <td>${currencySymbol}${doc.futureValue.toFixed(2)}</td>
                                <td>${currencySymbol}${doc.discountedValue.toFixed(2)}</td>
                                <td>${doc.tcea}%</td>
                                <td>${doc.daysToMaturity}</td>
                            </tr>
                        `).join('')}
                        <tr class="totals-row">
                            <td>Totales</td>
                            <td>${currencySymbol}${totals.originalAmount.toFixed(2)}</td>
                            <td>${currencySymbol}${totals.futureValue.toFixed(2)}</td>
                            <td>${currencySymbol}${totals.discountedValue.toFixed(2)}</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                    </tbody>
                </table>
                <div class="results-summary">
                    <p><strong>Valor Nominal Total:</strong> ${currencySymbol}${totals.originalAmount.toFixed(2)}</p>
                    <p><strong>Valor Presente Neto Total:</strong> ${currencySymbol}${totals.discountedValue.toFixed(2)}</p>
                    <p><strong>Interés por Devengar:</strong> ${currencySymbol}${(totals.futureValue - totals.originalAmount).toFixed(2)}</p>
                    <p><strong>Descuento Aplicado:</strong> ${currencySymbol}${(totals.futureValue - totals.discountedValue).toFixed(2)}</p>
                </div>
            </div>
        `;
    }

    static calculateTotals(docs) {
        return docs.reduce((acc, curr) => ({
            originalAmount: acc.originalAmount + curr.originalAmount,
            futureValue: acc.futureValue + curr.futureValue,
            discountedValue: acc.discountedValue + curr.discountedValue
        }), { originalAmount: 0, futureValue: 0, discountedValue: 0 });
    }
} 