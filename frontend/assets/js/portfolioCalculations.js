class PortfolioCalculations {
    static renderCurrencyResults(currency, docs, totals) {
        const currencySymbol = currency === 'PEN' ? 'S/. ' : '$ ';
        const currencyName = currency === 'PEN' ? 'Soles' : 'Dólares';

        if (docs.length === 0) return '';

        return `
            <div class="currency-results">
                <h4>Documentos en ${currencyName} (${currency})</h4>
                <div class="results-summary">
                    <p><strong>Monto Original Total:</strong> ${currencySymbol}${totals.originalAmount.toFixed(2)}</p>
                    <p><strong>Valor Futuro Total:</strong> ${currencySymbol}${totals.futureValue.toFixed(2)}</p>
                    <p><strong>Valor Descontado Total:</strong> ${currencySymbol}${totals.discountedValue.toFixed(2)}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Banco</th>
                            <th>Monto Original</th>
                            <th>Valor Futuro</th>
                            <th>Valor Descontado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${docs.map(detail => `
                            <tr>
                                <td>${detail.documentCode}</td>
                                <td>${detail.bank}</td>
                                <td>${currencySymbol}${detail.originalAmount.toFixed(2)}</td>
                                <td>${currencySymbol}${detail.futureValue.toFixed(2)}</td>
                                <td>${currencySymbol}${detail.discountedValue.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr class="totals-row">
                            <td colspan="2"><strong>Totales</strong></td>
                            <td><strong>${currencySymbol}${totals.originalAmount.toFixed(2)}</strong></td>
                            <td><strong>${currencySymbol}${totals.futureValue.toFixed(2)}</strong></td>
                            <td><strong>${currencySymbol}${totals.discountedValue.toFixed(2)}</strong></td>
                        </tr>
                    </tbody>
                </table>
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