class RateInput {
    static createRateInputGroup(containerId, defaultMode = 'tcea') {
        const container = document.getElementById(containerId);
        const originalContent = container.innerHTML;

        container.innerHTML = `
            <div class="rate-input-group">
                <div class="rate-mode-selector">
                    <label>
                        <input type="radio" name="rateMode_${containerId}" value="tcea" ${defaultMode === 'tcea' ? 'checked' : ''}>
                        TCEA Directa
                    </label>
                    <label>
                        <input type="radio" name="rateMode_${containerId}" value="nominal" ${defaultMode === 'nominal' ? 'checked' : ''}>
                        Tasa Nominal
                    </label>
                </div>

                <div class="tcea-input" ${defaultMode === 'nominal' ? 'style="display: none;"' : ''}>
                    ${originalContent}
                </div>

                <div class="nominal-input" ${defaultMode === 'tcea' ? 'style="display: none;"' : ''}>
                    <div class="nominal-rate-group">
                        <div class="rate-field">
                            <input type="number" class="nominal-rate" step="0.01" min="0" placeholder="Tasa Nominal (%)">
                        </div>
                        <div class="rate-field">
                            <input type="number" class="nominal-days" min="1" placeholder="Días (ej: 360, 180, 90)">
                        </div>
                    </div>
                    <div class="capitalization-group">
                        <label>Capitalización cada:</label>
                        <input type="number" class="capitalization-days" min="1" placeholder="Días (ej: 30)">
                    </div>
                    <div class="converted-rate">
                        TCEA calculada: <span class="tcea-result">-</span>
                    </div>
                </div>
            </div>
        `;

        const styles = `
            .rate-input-group {
                margin-bottom: 1rem;
            }

            .rate-mode-selector {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .rate-mode-selector label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
            }

            .nominal-rate-group {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }

            .rate-field {
                width: 100%;
            }

            .rate-field input {
                width: 100%;
            }

            .capitalization-group {
                margin-bottom: 1rem;
            }

            .capitalization-group input {
                width: 100%;
                margin-top: 0.25rem;
            }

            .converted-rate {
                font-size: 0.9rem;
                color: var(--primary-color);
                margin-top: 0.5rem;
                padding: 0.5rem;
                background: var(--accent-color);
                border-radius: 4px;
            }

            .tcea-result {
                font-weight: bold;
            }

            .nominal-input input,
            .tcea-input input {
                padding: 0.75rem;
                border: 1px solid var(--primary-color);
                border-radius: 4px;
                font-size: 1rem;
            }
        `;

        // Agregar estilos si no existen
        if (!document.getElementById('rate-input-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'rate-input-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        // Event Listeners
        const rateMode = container.querySelectorAll('input[name="rateMode_' + containerId + '"]');
        const tceaInput = container.querySelector('.tcea-input');
        const nominalInput = container.querySelector('.nominal-input');
        const originalInput = container.querySelector(containerId === 'bankRateInput' ? '#discountRate' : '#tcea');

        rateMode.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'tcea') {
                    tceaInput.style.display = 'block';
                    nominalInput.style.display = 'none';
                } else {
                    tceaInput.style.display = 'none';
                    nominalInput.style.display = 'block';
                }
            });
        });

        // Cálculo de TCEA
        const calculateTCEA = () => {
            const nominalRate = parseFloat(container.querySelector('.nominal-rate').value) / 100;
            const nominalDays = parseInt(container.querySelector('.nominal-days').value);
            const capitalizationDays = parseInt(container.querySelector('.capitalization-days').value);

            if (nominalRate && nominalDays && capitalizationDays) {
                const annualNominalRate = (nominalRate * 360) / nominalDays;
                const capitalizationsPerYear = 360 / capitalizationDays;
                const tcea = Math.pow(1 + (annualNominalRate / capitalizationsPerYear), capitalizationsPerYear) - 1;
                
                container.querySelector('.tcea-result').textContent = (tcea * 100).toFixed(4) + '%';
                originalInput.value = (tcea * 100).toFixed(4);
            }
        };

        container.querySelector('.nominal-rate').addEventListener('input', calculateTCEA);
        container.querySelector('.nominal-days').addEventListener('input', calculateTCEA);
        container.querySelector('.capitalization-days').addEventListener('input', calculateTCEA);
    }
} 