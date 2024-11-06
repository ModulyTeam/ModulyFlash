class CalculationConfig {
    static YEAR_DAYS = {
        COMMERCIAL: 360,
        ABSOLUTE: 365
    };

    static renderDaysConfig() {
        return `
            <div class="days-config-section">
                <h3>Configuración de Días</h3>
                <div class="days-options">
                    <div class="days-option">
                        <input type="radio" 
                            id="commercial" 
                            name="daysConfig" 
                            value="${this.YEAR_DAYS.COMMERCIAL}" 
                            checked>
                        <label for="commercial">
                            <h4>Año Comercial (360 días)</h4>
                            <p>Utiliza el estándar bancario de 360 días por año</p>
                        </label>
                    </div>
                    
                    <div class="days-option">
                        <input type="radio" 
                            id="absolute" 
                            name="daysConfig" 
                            value="${this.YEAR_DAYS.ABSOLUTE}">
                        <label for="absolute">
                            <h4>Año Calendario (365 días)</h4>
                            <p>Utiliza el año calendario exacto de 365 días</p>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    static getDaysInYear() {
        const selectedConfig = document.querySelector('input[name="daysConfig"]:checked');
        return selectedConfig ? parseInt(selectedConfig.value) : this.YEAR_DAYS.COMMERCIAL;
    }

    static getConfigDescription() {
        const daysInYear = this.getDaysInYear();
        return daysInYear === this.YEAR_DAYS.COMMERCIAL ? 
            'Cálculos realizados con año comercial (360 días)' : 
            'Cálculos realizados con año calendario (365 días)';
    }
} 