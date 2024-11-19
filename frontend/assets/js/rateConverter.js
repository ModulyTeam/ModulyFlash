class RateConverter {
    constructor() {
        if (window.rateConverter) {
            return window.rateConverter;
        }
        this.setupEventListeners();
        window.rateConverter = this;
    }

    loadConverter() {
        this.addStyles();
        
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="rate-converter-section">
                <h2>Convertidor de Tasas de Interés</h2>
                
                <form id="converterForm" class="converter-form">
                    <div class="input-group">
                        <label>Tasa Nominal</label>
                        <div class="input-field">
                            <input type="number" id="nominalRate" step="0.01" required min="0" placeholder="Ejemplo: 5 (para 5%)">
                        </div>
                        <div class="input-field">
                            <input type="number" id="nominalDays" required min="1" placeholder="Ejemplo: 360 para tasa anual">
                        </div>
                    </div>

                    <div class="input-group">
                        <label>Capitalización</label>
                        <div class="input-field">
                            <input type="number" id="capitalizationDays" required min="1" placeholder="Ejemplo: 30 para capitalización mensual">
                        </div>
                    </div>

                    <button type="submit" class="submit-button">Calcular TCEA</button>
                </form>

                <div id="results" class="results-section">
                    <!-- Los resultados se mostrarán aquí -->
                </div>
            </div>
        `;

        this.setupFormListeners();
    }

    addStyles() {
        const existingStyles = document.getElementById('rateConverterStyles');
        if (existingStyles) {
            existingStyles.remove();
        }

        const styles = `
            .rate-converter-section {
                max-width: 800px;
                margin: 2rem auto;
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                min-height: calc(100vh - 150px);
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .rate-converter-section h2 {
                text-align: center;
                color: var(--primary-color);
                margin-bottom: 2rem;
                font-size: 1.8rem;
            }

            .converter-form {
                width: 100%;
                max-width: 600px;
                display: grid;
                gap: 2rem;
                margin: 2rem auto;
                padding: 2rem;
                background: var(--accent-color);
                border-radius: 8px;
                border: 1px solid var(--primary-color);
            }

            .input-group {
                display: flex;
                flex-direction: column;
                gap: 0.8rem;
            }

            .input-group label {
                font-weight: bold;
                color: var(--primary-color);
                font-size: 1.1rem;
            }

            .input-field {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                width: 100%;
            }

            .input-field input {
                padding: 0.8rem;
                border: 1px solid var(--primary-color);
                border-radius: 4px;
                font-size: 1rem;
                transition: all 0.3s ease;
            }

            .input-field input:focus {
                border-color: var(--secondary-color);
                box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
            }

            .submit-button {
                background: var(--primary-color);
                color: white;
                padding: 1rem;
                border: none;
                border-radius: 4px;
                font-size: 1.1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 1rem;
            }

            .submit-button:hover {
                background: var(--secondary-color);
                transform: translateY(-2px);
            }

            .results-section {
                width: 100%;
                max-width: 600px;
                margin: 2rem auto;
                padding: 2rem;
                background-color: white;
                border-radius: 8px;
                border: 1px solid var(--primary-color);
                display: none;
            }

            .results-section.visible {
                display: block;
                animation: fadeIn 0.5s ease-in-out;
            }

            .result-item {
                margin: 1.5rem 0;
                padding: 1.5rem;
                background: var(--accent-color);
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .result-item h4 {
                color: var(--primary-color);
                margin-bottom: 1rem;
                font-size: 1.2rem;
            }

            .result-value {
                font-size: 2rem;
                color: var(--secondary-color);
                text-align: center;
                margin: 1rem 0;
                font-weight: bold;
            }

            .formula-display {
                font-family: monospace;
                padding: 1.5rem;
                background: #f8f9fa;
                border-radius: 8px;
                margin: 1rem 0;
                white-space: pre-wrap;
                line-height: 1.6;
                border: 1px solid #dee2e6;
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @media (max-width: 768px) {
                .rate-converter-section {
                    margin: 1rem;
                    padding: 1rem;
                    min-height: calc(100vh - 100px);
                }
                
                .converter-form,
                .results-section {
                    padding: 1rem;
                    width: calc(100% - 2rem);
                }
                
                .formula-display {
                    font-size: 0.9rem;
                    padding: 1rem;
                }
                
                .result-value {
                    font-size: 1.5rem;
                }
            }

            @media (max-width: 480px) {
                .rate-converter-section {
                    padding: 0.5rem;
                }
                
                .converter-form,
                .results-section {
                    padding: 0.8rem;
                }
                
                .input-field input {
                    padding: 0.6rem;
                }
                
                .submit-button {
                    padding: 0.8rem;
                    font-size: 1rem;
                }
            }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.id = "rateConverterStyles";
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    unloadConverter() {
        const styleSheet = document.getElementById('rateConverterStyles');
        if (styleSheet) {
            styleSheet.remove();
        }
    }

    setupFormListeners() {
        const form = document.getElementById('converterForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculateRates();
            });
        }
    }

    calculateRates() {
        const nominalRate = parseFloat(document.getElementById('nominalRate').value) / 100;
        const nominalDays = parseInt(document.getElementById('nominalDays').value);
        const capitalizationDays = parseInt(document.getElementById('capitalizationDays').value);

        const annualNominalRate = (nominalRate * 360) / nominalDays;
        const capitalizationsPerYear = 360 / capitalizationDays;
        const tcea = Math.pow(1 + (annualNominalRate / capitalizationsPerYear), capitalizationsPerYear) - 1;

        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <div class="result-item">
                    <h4>Tasa de Costo Efectivo Anual (TCEA)</h4>
                    <div class="result-value">${(tcea * 100).toFixed(4)}%</div>
                </div>
                
                <div class="result-item">
                    <h4>Detalles del Cálculo</h4>
                    <div class="formula-display">
1. Tasa nominal ingresada: ${(nominalRate * 100).toFixed(4)}% cada ${nominalDays} días
2. Tasa nominal anualizada: ${(annualNominalRate * 100).toFixed(4)}%
3. Frecuencia de capitalización: Cada ${capitalizationDays} días (${capitalizationsPerYear} veces al año)

Fórmula aplicada:
TCEA = (1 + TNA/${capitalizationsPerYear})^${capitalizationsPerYear} - 1

Donde:
- TNA = Tasa Nominal Anual = ${(annualNominalRate * 100).toFixed(4)}%
- n = Capitalizaciones por año = ${capitalizationsPerYear}

Resultado:
TCEA = ${(tcea * 100).toFixed(4)}%</div>
                </div>
            `;
            resultsDiv.classList.add('visible');
        }
    }

    setupEventListeners() {
        if (this.listenersInitialized) return;
        
        document.querySelector('nav a[data-section="rate-converter"]')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.loadConverter();
        });

        this.listenersInitialized = true;
    }
}

if (window.location.pathname === '/rate-converter') {
    window.rateConverter = new RateConverter();
} 