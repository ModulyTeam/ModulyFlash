class PortfolioValidations {
    static validateDiscountDate(selectedDate, documents) {
        const errors = [];
        const selectedDateObj = new Date(selectedDate);

        documents.forEach(doc => {
            const emissionDate = new Date(doc.emissionDate);
            const dueDate = new Date(doc.dueDate);

            if (selectedDateObj < emissionDate) {
                errors.push(`La fecha de descuento (${selectedDate}) es anterior a la fecha de emisión (${doc.emissionDate}) del documento ${doc.code}`);
            }

            if (selectedDateObj > dueDate) {
                errors.push(`La fecha de descuento (${selectedDate}) es posterior a la fecha de vencimiento (${doc.dueDate}) del documento ${doc.code}`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static showValidationErrors(errors) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'validation-errors';
        errorContainer.innerHTML = `
            <div class="error-message">
                <h4>⚠️ Errores de validación:</h4>
                <ul>
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            </div>
        `;

        // Insertar antes del botón de continuar
        const continueButton = document.querySelector('.continue-button');
        if (continueButton) {
            continueButton.parentNode.insertBefore(errorContainer, continueButton);
        }
    }

    static clearValidationErrors() {
        const errorContainer = document.querySelector('.validation-errors');
        if (errorContainer) {
            errorContainer.remove();
        }
    }
} 