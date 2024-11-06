class FinancialCalculations {
    static calculateOriginalAmount(unit, unitPrice) {
        return unit * unitPrice;
    }

    static calculateFutureValue(originalAmount, tcea, days) {
        return originalAmount * Math.pow(1 + (tcea/100), days/365);
    }

    static calculateDiscountedValue(amount, discountRate, days) {
        return amount / Math.pow(1 + (discountRate/100), days/365);
    }

    static getDaysBetweenDates(date1, date2) {
        return Math.floor((new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24));
    }

    static formatCurrency(amount, currency) {
        const symbol = currency === 'PEN' ? 'S/. ' : '$ ';
        return `${symbol}${amount.toFixed(2)}`;
    }

    static calculatePortfolioValues(doc, selectedDate, calculationType) {
        const originalAmount = this.calculateOriginalAmount(doc.unit, doc.unitPrice);
        const daysToMaturity = this.getDaysBetweenDates(doc.emissionDate, doc.dueDate);
        const daysToSelected = this.getDaysBetweenDates(doc.emissionDate, selectedDate);
        const daysFromSelectedToMaturity = this.getDaysBetweenDates(selectedDate, doc.dueDate);

        const futureValue = this.calculateFutureValue(originalAmount, doc.tcea, daysToMaturity);
        const futureValueAtSelectedDate = this.calculateFutureValue(originalAmount, doc.tcea, daysToSelected);

        let amountToDiscount;
        switch(calculationType) {
            case 'original':
                amountToDiscount = originalAmount;
                break;
            case 'future':
                amountToDiscount = futureValue;
                break;
            case 'futureAtSelected':
                amountToDiscount = futureValueAtSelectedDate;
                break;
            default:
                amountToDiscount = futureValue;
        }

        const discountRate = doc.bankId ? doc.bankId.discountRate : doc.customDiscountRate;
        const discountedValue = this.calculateDiscountedValue(amountToDiscount, discountRate, daysFromSelectedToMaturity);

        return {
            originalAmount,
            futureValue,
            futureValueAtSelectedDate,
            discountedValue,
            daysToMaturity,
            daysToSelected,
            daysFromSelectedToMaturity
        };
    }
} 