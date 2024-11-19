class DiscountCalculator {
    static calculateDiscount(doc, selectedDate, calculationType, customDiscountRate = null) {
        const originalAmount = doc.unit * doc.unitPrice;
        const daysToMaturity = this.getDaysBetween(doc.emissionDate, doc.dueDate);
        const daysToSelected = this.getDaysBetween(doc.emissionDate, selectedDate);
        const daysFromSelectedToMaturity = this.getDaysBetween(selectedDate, doc.dueDate);
        
        // Determinar la tasa de descuento
        const discountRate = doc.bankId ? doc.bankId.discountRate : customDiscountRate;

        let amountToDiscount;
        let futureValue;
        let futureValueAtSelected;

        // Cálculo del valor futuro total (hasta vencimiento)
        futureValue = originalAmount * Math.pow(1 + (doc.tcea/100), daysToMaturity/365);
        
        // Cálculo del valor futuro a la fecha seleccionada
        futureValueAtSelected = originalAmount * Math.pow(1 + (doc.tcea/100), daysToSelected/365);

        // Determinar el monto a descontar según el tipo de cálculo
        switch(calculationType) {
            case 'original':
                // Descuento sobre el monto original
                amountToDiscount = originalAmount;
                break;
            case 'futureAtSelected':
                // Descuento sobre el valor futuro a la fecha seleccionada
                amountToDiscount = futureValueAtSelected;
                break;
            case 'future':
            default:
                // Descuento sobre el valor futuro total
                amountToDiscount = futureValue;
                break;
        }

        const discountedValue = amountToDiscount / Math.pow(1 + (discountRate/100), daysFromSelectedToMaturity/365);

        return {
            documentCode: doc.code,
            bank: doc.bankId ? doc.bankId.name : 'Sin banco',
            currency: doc.currency,
            originalAmount,
            futureValue,
            futureValueAtSelected,
            discountedValue,
            amountToDiscount,
            daysToMaturity,
            daysToSelected,
            daysFromSelectedToMaturity,
            tcea: doc.tcea,
            discountRate,
            unit: doc.unit,
            unitPrice: doc.unitPrice,
            calculationType
        };
    }

    static getDaysBetween(date1, date2) {
        return Math.floor((new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24));
    }

    static getCalculationDescription(calculationType) {
        switch(calculationType) {
            case 'original':
                return 'Descuento sobre el Monto Original';
            case 'futureAtSelected':
                return 'Descuento sobre el Valor Futuro a Fecha Seleccionada';
            case 'future':
                return 'Descuento sobre el Valor Futuro al Vencimiento';
            default:
                return 'Método de descuento no especificado';
        }
    }
} 