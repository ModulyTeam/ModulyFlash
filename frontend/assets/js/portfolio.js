class PortfolioManager {
    constructor() {
        this.documents = [];
        this.banks = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const portfolioLink = e.target.closest('nav a[data-section="portfolio"]');
            if (portfolioLink) {
                e.preventDefault();
                console.log('Clic en Cartera de Descuento'); // Debug
                this.loadPortfolio();
            }
        });

        if (window.location.pathname === '/portfolio') {
            console.log('Carga inicial de portfolio'); // Debug
            this.loadPortfolio();
        }
    }

    async loadPortfolio() {
        console.log('Ejecutando loadPortfolio'); // Debug
        try {
            const content = document.getElementById('content');
            if (!content) {
                console.error('No se encontró el elemento content');
                return;
            }

            content.innerHTML = '<div class="loading">Cargando configuración...</div>';

            const banksResponse = await fetch(`${API_URL}/banks`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.banks = await banksResponse.json();

            content.innerHTML = `
                <div class="portfolio-section">
                    <h2>Cartera de Descuento</h2>
                    
                    <button class="tutorial-button" onclick="PortfolioTutorial.startTutorial()">
                        ¿Cómo funciona?
                    </button>

                    <div class="portfolio-config">
                        <div class="validation-steps">
                            <h3>Configuración Inicial de la Cartera</h3>
                            <p class="validation-info">
                                Antes de mostrar los documentos disponibles, es necesario definir las características de la cartera:
                            </p>
                            
                            <div class="validation-grid">
                                <div class="validation-item">
                                    <h4>1. Moneda de la Cartera</h4>
                                    <p>Una cartera solo puede contener documentos de una misma moneda</p>
                                    <select id="portfolioCurrency" required>
                                        <option value="">Seleccione la moneda</option>
                                        <option value="PEN">Soles (PEN)</option>
                                        <option value="USD">Dólares (USD)</option>
                                    </select>
                                </div>
                                
                                <div class="validation-item">
                                    <h4>2. Banco para Descuento</h4>
                                    <p>Seleccione el banco que financiará la cartera</p>
                                    <select id="portfolioBank" required disabled>
                                        <option value="">Primero seleccione una moneda</option>
                                    </select>
                                </div>
                                
                                <div class="validation-item">
                                    <h4>3. Tipo de Documentos</h4>
                                    <p>Defina qué tipo de documentos incluirá la cartera</p>
                                    <select id="portfolioDocType" required>
                                        <option value="">Seleccione el tipo</option>
                                        <option value="ALL">Ambos tipos</option>
                                        <option value="FACTURA">Solo Facturas</option>
                                        <option value="LETRA">Solo Letras</option>
                                    </select>
                                </div>
                            </div>

                            <div class="validation-summary">
                                <p><strong>Nota:</strong> Solo se mostrarán los documentos que cumplan con estos criterios.</p>
                            </div>
                            
                            <button type="button" id="continueToDocuments" class="continue-button">
                                Continuar a Selección de Documentos
                            </button>
                        </div>
                    </div>

                    <div id="documentSelectionSection" style="display: none;">
                        <!-- La sección de documentos se cargará aquí -->
                    </div>
                </div>
            `;

            console.log('Contenido renderizado'); // Debug
            this.setupConfigListeners();
        } catch (error) {
            console.error('Error cargando cartera:', error);
            const content = document.getElementById('content');
            content.innerHTML = '<div class="error">Error al cargar la cartera. Por favor, intente nuevamente.</div>';
        }
    }

    setupConfigListeners() {
        const currencySelect = document.getElementById('portfolioCurrency');
        const bankSelect = document.getElementById('portfolioBank');
        const continueButton = document.getElementById('continueToDocuments');

        if (currencySelect) {
            currencySelect.addEventListener('change', () => {
                const selectedCurrency = currencySelect.value;
                this.updateBankOptions(selectedCurrency);
            });
        }

        if (continueButton) {
            continueButton.addEventListener('click', () => {
                const currency = currencySelect.value;
                const bank = bankSelect.value;
                const docType = document.getElementById('portfolioDocType').value;

                if (!currency || !bank || !docType) {
                    alert('Por favor complete todos los campos de configuración');
                    return;
                }

                this.loadFilteredDocuments(currency, bank, docType);
            });
        }
    }

    updateBankOptions(currency) {
        const bankSelect = document.getElementById('portfolioBank');
        if (!bankSelect) return;

        bankSelect.innerHTML = '<option value="">Seleccione el banco</option>';
        bankSelect.disabled = !currency;

        if (!currency) return;

        const compatibleBanks = this.banks.filter(bank => 
            bank.acceptedCurrencies.includes(currency) || bank.acceptedCurrencies.includes('BOTH')
        );

        compatibleBanks.forEach(bank => {
            bankSelect.innerHTML += `
                <option value="${bank._id}">${bank.name} (Tasa: ${bank.discountRate}%)</option>
            `;
        });
    }

    async loadFilteredDocuments(currency, bankId, docType) {
        try {
            let url = `${API_URL}/documents?currency=${currency}`;
            if (docType !== 'ALL') {
                url += `&type=${docType}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const documents = await response.json();
            const selectedBank = this.banks.find(b => b._id === bankId);

            // Filtrar documentos por banco seleccionado
            this.documents = documents.filter(doc => 
                !doc.bankId || doc.bankId._id === bankId
            );

            this.renderDocumentSelection(selectedBank);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar los documentos');
        }
    }

    async renderDocumentSelection(selectedBank) {
        const documentSection = document.getElementById('documentSelectionSection');
        documentSection.style.display = 'block';
        
        documentSection.innerHTML = `
            <div class="selected-config-summary">
                <h3>Documentos Disponibles</h3>
                <p>Banco seleccionado: ${selectedBank.name} (Tasa: ${selectedBank.discountRate}%)</p>
            </div>

            <div class="date-selection">
                <h4>Fecha de Descuento</h4>
                <input type="date" id="selectedDate" required>
            </div>

            ${CalculationConfig.renderDaysConfig()}

            <div class="documents-table">
                <table>
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" id="selectAll" 
                                    onchange="portfolioManager.handleSelectAll(this)">
                                Seleccionar
                            </th>
                            <th>Código</th>
                            <th>Tipo</th>
                            <th>Emisión</th>
                            <th>Vencimiento</th>
                            <th>Monto</th>
                            <th>TCEA</th>
                            <th>Tasa Descuento</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.documents.map(doc => {
                            const currencySymbol = doc.currency === 'PEN' ? 'S/. ' : '$ ';
                            return `
                                <tr>
                                    <td>
                                        <input type="checkbox" name="selectedDocs" value="${doc._id}">
                                    </td>
                                    <td>${doc.code}</td>
                                    <td>${doc.type}</td>
                                    <td>${new Date(doc.emissionDate).toLocaleDateString()}</td>
                                    <td>${new Date(doc.dueDate).toLocaleDateString()}</td>
                                    <td>${currencySymbol}${(doc.unit * doc.unitPrice).toFixed(2)}</td>
                                    <td>${doc.tcea}%</td>
                                    <td>${selectedBank.discountRate}%</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            ${CalculationMethods.renderMethodSelector()}

            <button type="button" class="calculate-button" id="calculateButton">
                Calcular Descuento
            </button>
        `;

        // Crear el contenedor de resultados después de la tabla y el botón
        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'calculationResults';
        resultsContainer.className = 'results-container';
        resultsContainer.style.display = 'none';
        documentSection.appendChild(resultsContainer);

        // Agregar el event listener después de crear el botón
        document.getElementById('calculateButton').addEventListener('click', () => {
            this.calculatePortfolio();
        });

        // Ocultar la configuración inicial
        document.querySelector('.portfolio-config').style.display = 'none';
    }

    handleSelectAll(checkbox) {
        const checkboxes = document.querySelectorAll('input[name="selectedDocs"]');
        checkboxes.forEach(cb => {
            cb.checked = checkbox.checked;
        });
    }

    async calculatePortfolio() {
        const selectedDate = document.getElementById('selectedDate').value;
        const selectedDocs = Array.from(document.querySelectorAll('input[name="selectedDocs"]:checked'));
        const calculationMethod = document.querySelector('input[name="calculationMethod"]:checked');
        const daysInYear = CalculationConfig.getDaysInYear();

        if (!selectedDate) {
            alert('Por favor seleccione una fecha de descuento');
            return;
        }

        if (selectedDocs.length === 0) {
            alert('Por favor seleccione al menos un documento');
            return;
        }

        if (!calculationMethod) {
            alert('Por favor seleccione un método de cálculo');
            return;
        }

        try {
            const bankId = document.getElementById('portfolioBank').value;
            const documentData = selectedDocs.map(checkbox => ({
                documentId: checkbox.value,
                customDiscountRate: null
            }));

            const response = await fetch(`${API_URL}/documents/calculate-portfolio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    selectedDate,
                    documents: documentData,
                    calculationType: calculationMethod.value,
                    daysInYear,
                    bankId
                })
            });

            if (!response.ok) {
                throw new Error('Error al calcular la cartera');
            }

            const results = await response.json();
            results.bankId = bankId;
            this.displayResults(results);
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Error al calcular la cartera');
        }
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('calculationResults');
        if (!resultsContainer) return;

        const daysInYear = CalculationConfig.getDaysInYear();
        const penDocs = results.details.filter(doc => doc.currency === 'PEN');
        const usdDocs = results.details.filter(doc => doc.currency === 'USD');

        let resultsHTML = `
            <div class="results-section">
                <button type="button" class="generate-letter-buttonmain" id="generateLetterBtn">
                    Generar Letra de Descuento
                </button>
                <h3>Resultados del Cálculo</h3>
                <p class="calculation-date">Fecha de descuento: ${new Date(results.selectedDate).toLocaleDateString()}</p>
                
                <!-- Tablas de resultados por moneda -->
                ${penDocs.length > 0 ? PortfolioCalculations.renderCurrencyResults('PEN', penDocs, 
                    PortfolioCalculations.calculateTotals(penDocs)) : ''}
                
                ${usdDocs.length > 0 ? PortfolioCalculations.renderCurrencyResults('USD', usdDocs, 
                    PortfolioCalculations.calculateTotals(usdDocs)) : ''}

                <!-- Detalle de cálculos aplicados -->
                <div class="calculations-detail">
                    <h4>Detalle de Cálculos Aplicados</h4>
                    ${results.details.map(detail => {
                        const currencySymbol = detail.currency === 'PEN' ? 'S/. ' : '$ ';
                        const tceaDecimal = detail.tcea / 100;
                        const discountRateDecimal = detail.discountRate / 100;
                        
                        // Calcular los valores intermedios
                        const tceaPower = Math.pow(1 + tceaDecimal, detail.daysToMaturity/daysInYear);
                        const discountPower = Math.pow(1 + discountRateDecimal, detail.daysFromSelectedToMaturity/daysInYear);
                        
                        return `
                            <div class="calculation-item">
                                <h5>Documento: ${detail.documentCode}</h5>
                                <div class="calculation-steps">
                                    <div class="step">
                                        <h6>1. Cálculo del Monto Original:</h6>
                                        <p class="formula">Monto = Unidades × Precio Unitario</p>
                                        <p class="formula">${detail.unit} × ${currencySymbol}${detail.unitPrice} = ${currencySymbol}${detail.originalAmount.toFixed(2)}</p>
                                    </div>
                                    
                                    <div class="step">
                                        <h6>2. Cálculo del Valor Futuro al Vencimiento:</h6>
                                        <p class="formula">VF = Monto × (1 + TCEA)^(días/360)</p>
                                        <p class="formula">${currencySymbol}${detail.originalAmount.toFixed(2)} × (1 + ${detail.tcea}%)^(${detail.daysToMaturity}/${daysInYear})</p>
                                        <p class="formula">${currencySymbol}${detail.originalAmount.toFixed(2)} × ${tceaPower.toFixed(6)}</p>
                                        <p class="result">= ${currencySymbol}${detail.futureValue.toFixed(2)}</p>
                                    </div>

                                    <div class="step">
                                        <h6>3. Cálculo del Valor Descontado:</h6>
                                        <p class="formula">VD = Monto Base ÷ (1 + Tasa)^(días/360)</p>
                                        <p class="formula">${currencySymbol}${detail.amountToDiscount.toFixed(2)} ÷ (1 + ${detail.discountRate}%)^(${detail.daysFromSelectedToMaturity}/${daysInYear})</p>
                                        <p class="formula">${currencySymbol}${detail.amountToDiscount.toFixed(2)} ÷ ${discountPower.toFixed(6)}</p>
                                        <p class="result">= ${currencySymbol}${detail.discountedValue.toFixed(2)}</p>
                                    </div>

                                    <div class="summary">
                                        <p><strong>Días hasta el vencimiento:</strong> ${detail.daysToMaturity}</p>
                                        <p><strong>Días desde emisión hasta fecha seleccionada:</strong> ${detail.daysToSelected}</p>
                                        <p><strong>Días desde fecha seleccionada hasta vencimiento:</strong> ${detail.daysFromSelectedToMaturity}</p>
                                        <p><strong>Tasa TCEA:</strong> ${detail.tcea}%</p>
                                        <p><strong>Tasa de Descuento:</strong> ${detail.discountRate}%</p>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Solo el botón de generar letra de descuento -->
                <button type="button" class="generate-letter-button" id="generateLetterBtn">
                    Generar Letra de Descuento
                </button>
            </div>
        `;

        resultsContainer.innerHTML = resultsHTML;
        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });

        // Agregar el event listener después de crear el botón
        document.getElementById('generateLetterBtn').addEventListener('click', () => {
            if (typeof DiscountLetter === 'undefined') {
                console.error('DiscountLetter no está definido. Asegúrese de que discountLetter.js está cargado.');
                alert('Error al cargar el componente de letra de descuento. Por favor, recargue la página.');
                return;
            }
            
            try {
                window.tempPortfolioResults = results;
                DiscountLetter.generatePreview(results);
            } catch (error) {
                console.error('Error al generar la letra de descuento:', error);
                alert('Error al generar la letra de descuento. Por favor, intente nuevamente.');
            }
        });
    }
}

// Asegurarnos de que la instancia se cree después de que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioManager = new PortfolioManager();
}); 