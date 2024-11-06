class CalculationMethods {
    static METHODS = {
        FUTURE: {
            id: 'future',
            name: 'Valor Futuro al Vencimiento',
            description: 'Calcula el descuento sobre el valor futuro total del documento al vencimiento'
        },
        ORIGINAL: {
            id: 'original',
            name: 'Monto Original',
            description: 'Calcula el descuento sobre el monto original sin intereses'
        },
        FUTURE_AT_DATE: {
            id: 'futureAtSelected',
            name: 'Valor Futuro a Fecha Seleccionada',
            description: 'Calcula el descuento sobre el valor futuro hasta la fecha de descuento'
        }
    };

    static renderMethodSelector() {
        return `
            <div class="calculation-method-section">
                <h3>Seleccione el Método de Cálculo</h3>
                <div class="method-options">
                    ${Object.values(this.METHODS).map(method => `
                        <div class="method-option">
                            <input type="radio" 
                                id="method${method.id}" 
                                name="calculationMethod" 
                                value="${method.id}" 
                                required>
                            <label for="method${method.id}">
                                <h4>${method.name}</h4>
                                <p>${method.description}</p>
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    static getMethodDescription(methodId) {
        const method = Object.values(this.METHODS).find(m => m.id === methodId);
        return method ? method.name : 'Método no especificado';
    }
} 