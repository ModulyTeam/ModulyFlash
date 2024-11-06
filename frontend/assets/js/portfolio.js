class PortfolioManager {
    constructor() {
        this.documents = [];
        this.banks = [];
        this.setupEventListeners();
    }

    async loadPortfolio() {
        try {
            const [documentsResponse, banksResponse] = await Promise.all([
                fetch(`${API_URL}/documents`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }),
                fetch(`${API_URL}/banks`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
            ]);

            this.documents = await documentsResponse.json();
            this.banks = await banksResponse.json();
            this.renderPortfolio();
        } catch (error) {
            console.error('Error cargando cartera:', error);
        }
    }

    renderPortfolio() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="portfolio-section">
                <h2>Cartera de Descuento</h2>
                
                <button class="tutorial-button" onclick="PortfolioTutorial.startTutorial()">
                    ¿Cómo funciona?
                </button>

                <div class="portfolio-calculator">
                    <form id="portfolioForm">
                        <div class="date-selection">
                            <h3>Fecha de Descuento</h3>
                            <input type="date" id="selectedDate" required>
                        </div>

                        ${CalculationConfig.renderDaysConfig()}

                        <div class="documents-selection">
                            <h3>Documentos Disponibles</h3>
                            <div class="table-container">
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
                                            <th>Banco</th>
                                            <th>Moneda</th>
                                            <th>Monto</th>
                                            <th>TCEA</th>
                                            <th>Tasa Descuento</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.documents.map(doc => {
                                            const hasBank = doc.bankId && doc.bankId.name;
                                            const bankName = hasBank ? doc.bankId.name : 'Sin banco';
                                            const discountRate = hasBank ? doc.bankId.discountRate : null;
                                            const currencySymbol = doc.currency === 'PEN' ? 'S/. ' : '$ ';
                                            
                                            return `
                                                <tr>
                                                    <td>
                                                        <input type="checkbox" name="selectedDocs" value="${doc._id}" 
                                                            data-has-bank="${hasBank}" 
                                                            onchange="portfolioManager.handleDocumentSelection(this, '${doc._id}')">
                                                    </td>
                                                    <td>${doc.code}</td>
                                                    <td>${doc.type}</td>
                                                    <td>${new Date(doc.emissionDate).toLocaleDateString()}</td>
                                                    <td>${new Date(doc.dueDate).toLocaleDateString()}</td>
                                                    <td>${bankName}</td>
                                                    <td>${doc.currency}</td>
                                                    <td>${currencySymbol}${(doc.unit * doc.unitPrice).toFixed(2)}</td>
                                                    <td>${doc.tcea}%</td>
                                                    <td id="discount-rate-cell-${doc._id}">
                                                        ${hasBank ? 
                                                            `${discountRate}%` : 
                                                            `<input type="number" 
                                                                class="custom-discount-rate" 
                                                                data-doc-id="${doc._id}" 
                                                                step="0.01" 
                                                                min="0"
                                                                max="100"
                                                                placeholder="Tasa %" 
                                                                style="display: none;">`
                                                        }
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="calculation-method-section">
                            <h3>Seleccione el Método de Cálculo</h3>
                            <div class="method-options">
                                <div class="method-option">
                                    <input type="radio" id="methodFuture" name="calculationMethod" value="future" required>
                                    <label for="methodFuture">
                                        <h4>Valor Futuro al Vencimiento</h4>
                                        <p>Calcula el descuento sobre el valor futuro total del documento al vencimiento</p>
                                    </label>
                                </div>
                                
                                <div class="method-option">
                                    <input type="radio" id="methodOriginal" name="calculationMethod" value="original">
                                    <label for="methodOriginal">
                                        <h4>Monto Original</h4>
                                        <p>Calcula el descuento sobre el monto original sin intereses</p>
                                    </label>
                                </div>
                                
                                <div class="method-option">
                                    <input type="radio" id="methodFutureSelected" name="calculationMethod" value="futureAtSelected">
                                    <label for="methodFutureSelected">
                                        <h4>Valor Futuro a Fecha Seleccionada</h4>
                                        <p>Calcula el descuento sobre el valor futuro hasta la fecha de descuento</p>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button type="submit" class="calculate-button">Calcular Descuento</button>
                    </form>

                    <div id="calculationResults" class="results-container" style="display: none;">
                        <!-- Los resultados se mostrarán aquí -->
                    </div>
                </div>
            </div>
        `;

        // Agregar estilos específicos para los métodos de cálculo
        const styles = `
            .calculation-method-section {
                margin: 2rem 0;
                padding: 1.5rem;
                background: #f8f9fa;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }

            .method-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
                margin-top: 1rem;
            }

            .method-option {
                position: relative;
                padding: 1.5rem;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                transition: all 0.3s ease;
                cursor: pointer;
            }

            .method-option:hover {
                border-color: var(--secondary-color);
                background: white;
            }

            .method-option input[type="radio"] {
                position: absolute;
                top: 1.5rem;
                right: 1.5rem;
            }

            .method-option label {
                display: block;
                cursor: pointer;
                padding-right: 2.5rem;
            }

            .method-option h4 {
                margin-bottom: 0.75rem;
                color: var(--primary-color);
            }

            .method-option p {
                font-size: 0.9rem;
                color: #666;
                margin: 0;
            }

            .method-option input[type="radio"]:checked + label {
                font-weight: 500;
            }

            .method-option input[type="radio"]:checked + label h4 {
                color: var(--secondary-color);
            }

            .method-option input[type="radio"]:checked ~ .method-option {
                border-color: var(--secondary-color);
                background: #f8f9fa;
            }

            .calculate-button {
                margin-top: 2rem;
                width: 100%;
                padding: 1rem;
                font-size: 1.1rem;
                background-color: var(--primary-color);
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        this.setupFormListener();
    }

    handleSelectAll(checkbox) {
        const allCheckboxes = document.querySelectorAll('input[name="selectedDocs"]');
        allCheckboxes.forEach(cb => {
            cb.checked = checkbox.checked;
            this.handleDocumentSelection(cb, cb.value);
        });
    }

    handleDocumentSelection(checkbox, docId) {
        const customRateInput = document.querySelector(`#discount-rate-cell-${docId} input`);
        if (customRateInput) {
            customRateInput.style.display = checkbox.checked ? 'block' : 'none';
            customRateInput.required = checkbox.checked;
        }
    }

    setupFormListener() {
        document.getElementById('portfolioForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const selectedDate = document.getElementById('selectedDate').value;
            const calculationMethod = document.querySelector('input[name="calculationMethod"]:checked');
            const daysInYear = CalculationConfig.getDaysInYear();

            if (!calculationMethod) {
                alert('Por favor seleccione un método de cálculo');
                return;
            }

            const selectedDocs = Array.from(document.querySelectorAll('input[name="selectedDocs"]:checked'));

            if (selectedDocs.length === 0) {
                alert('Por favor seleccione al menos un documento');
                return;
            }

            // Verificar fechas y recopilar advertencias
            const warnings = selectedDocs.map(checkbox => {
                const doc = this.documents.find(d => d._id === checkbox.value);
                const selectedDateObj = new Date(selectedDate);
                const emissionDateObj = new Date(doc.emissionDate);
                const dueDateObj = new Date(doc.dueDate);
                
                const daysToMaturity = Math.floor((dueDateObj - emissionDateObj) / (1000 * 60 * 60 * 24));
                const daysFromEmissionToSelected = Math.floor((selectedDateObj - emissionDateObj) / (1000 * 60 * 60 * 24));
                const daysFromSelectedToMaturity = Math.floor((dueDateObj - selectedDateObj) / (1000 * 60 * 60 * 24));

                let warning = null;
                if (daysFromSelectedToMaturity < 0) {
                    warning = {
                        code: doc.code,
                        message: 'La fecha seleccionada es posterior a la fecha de vencimiento. Este documento ya debería estar pagado.'
                    };
                } else if (daysFromEmissionToSelected < 0) {
                    warning = {
                        code: doc.code,
                        message: 'La fecha seleccionada es anterior a la fecha de emisión. No es posible calcular un descuento antes de que exista el documento.'
                    };
                }
                return warning;
            }).filter(warning => warning !== null);

            if (warnings.length > 0) {
                const warningMessage = warnings.map(w => 
                    `Documento ${w.code}: ${w.message}`
                ).join('\n\n');

                const continuar = confirm(
                    `ADVERTENCIA:\n\n${warningMessage}\n\n` +
                    `Incluir estos documentos en el cálculo sería incoherente ya que:\n` +
                    `- Si la fecha es posterior al vencimiento, el documento ya debería estar pagado y no necesitaría financiamiento.\n` +
                    `- Si la fecha es anterior a la emisión, el documento aún no existía.\n\n` +
                    `¿Desea continuar de todos modos con fines experimentales?`
                );

                if (!continuar) {
                    return;
                }
            }

            try {
                const documentData = selectedDocs.map(checkbox => {
                    const docId = checkbox.value;
                    const doc = this.documents.find(d => d._id === docId);
                    
                    if (doc.bankId && doc.bankId.discountRate) {
                        return {
                            documentId: docId,
                            customDiscountRate: null
                        };
                    }

                    const customRateInput = document.querySelector(`#discount-rate-cell-${docId} input`);
                    if (!customRateInput || !customRateInput.value) {
                        throw new Error(`Por favor ingrese una tasa de descuento para el documento ${doc.code}`);
                    }
                    return {
                        documentId: docId,
                        customDiscountRate: parseFloat(customRateInput.value)
                    };
                });

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
                        daysInYear
                    })
                });

                if (!response.ok) {
                    throw new Error('Error al calcular la cartera');
                }

                const results = await response.json();
                this.displayResults(results);
            } catch (error) {
                console.error('Error:', error);
                alert(error.message || 'Error al calcular la cartera');
            }
        });
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('calculationResults');
        if (!resultsContainer) return;
        resultsContainer.style.display = 'block';

        const daysInYear = CalculationConfig.getDaysInYear();
        const penDocs = results.details.filter(doc => doc.currency === 'PEN');
        const usdDocs = results.details.filter(doc => doc.currency === 'USD');

        let resultsHTML = `
            <h3>Resultados del Cálculo</h3>
            <p class="calculation-date">Fecha de descuento: ${new Date(results.selectedDate).toLocaleDateString()}</p>
        `;

        // Primero mostrar las tablas de resultados
        if (penDocs.length > 0) {
            resultsHTML += this.renderCurrencySection('PEN', penDocs);
        }
        if (usdDocs.length > 0) {
            resultsHTML += this.renderCurrencySection('USD', usdDocs);
        }

        // Agregar sección de conclusiones
        resultsHTML += `
            <div class="portfolio-conclusions">
                <h3>Conclusiones del Análisis</h3>
                ${this.generateConclusions(results)}
            </div>
        `;

        // Agregar botón de exportación
        resultsHTML += `
            <button onclick="portfolioManager.exportToPDF()" class="export-button">
                Exportar a PDF
            </button>
        `;

        // Al final, mostrar el detalle de cálculos
        resultsHTML += `
            <div class="calculations-detail">
                <h4>Detalle de Cálculos Aplicados</h4>
                ${results.details.map(detail => {
                    const currencySymbol = detail.currency === 'PEN' ? 'S/. ' : '$ ';
                    
                    return `
                        <div class="calculation-item">
                            <h5>Documento: ${detail.documentCode}</h5>
                            <div class="calculation-steps">
                                <div class="step">
                                    <h6>1. Cálculo del Monto Original:</h6>
                                    <p class="formula">${detail.unit} × ${detail.unitPrice} = ${currencySymbol}${detail.originalAmount.toFixed(2)}</p>
                                </div>
                                
                                <div class="step">
                                    <h6>2. Cálculo del Valor Futuro al Vencimiento:</h6>
                                    <p class="formula">${currencySymbol}${detail.originalAmount.toFixed(2)} × (1 + ${detail.tcea}%)^(${detail.daysToMaturity}/${daysInYear})</p>
                                    <p class="result">= ${currencySymbol}${detail.futureValue.toFixed(2)}</p>
                                </div>

                                <div class="step">
                                    <h6>3. Cálculo del Valor Descontado:</h6>
                                    <p class="formula">${currencySymbol}${detail.amountToDiscount.toFixed(2)} ÷ (1 + ${detail.discountRate}%)^(${detail.daysFromSelectedToMaturity}/${daysInYear})</p>
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
        `;

        resultsContainer.innerHTML = resultsHTML;
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    renderCurrencySection(currency, docs) {
        if (docs.length === 0) return '';

        const symbol = currency === 'PEN' ? 'S/. ' : '$ ';
        const totals = docs.reduce((acc, curr) => ({
            originalAmount: acc.originalAmount + curr.originalAmount,
            futureValue: acc.futureValue + curr.futureValue,
            futureValueAtSelected: acc.futureValueAtSelected + curr.futureValueAtSelected,
            discountedValue: acc.discountedValue + curr.discountedValue
        }), { originalAmount: 0, futureValue: 0, futureValueAtSelected: 0, discountedValue: 0 });

        return `
            <div class="currency-section">
                <h4>Resumen en ${currency === 'PEN' ? 'Soles' : 'Dólares'}</h4>
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Documento</th>
                            <th>Banco</th>
                            <th>Monto Original</th>
                            <th>Valor Futuro al Vencimiento</th>
                            <th>Valor Futuro a Fecha Seleccionada</th>
                            <th>Valor Descontado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${docs.map(doc => `
                            <tr>
                                <td>${doc.documentCode}</td>
                                <td>${doc.bank}</td>
                                <td>${symbol}${doc.originalAmount.toFixed(2)}</td>
                                <td>${symbol}${doc.futureValue.toFixed(2)}</td>
                                <td>${symbol}${doc.futureValueAtSelected.toFixed(2)}</td>
                                <td>${symbol}${doc.discountedValue.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr class="totals">
                            <td colspan="2"><strong>Totales</strong></td>
                            <td><strong>${symbol}${totals.originalAmount.toFixed(2)}</strong></td>
                            <td><strong>${symbol}${totals.futureValue.toFixed(2)}</strong></td>
                            <td><strong>${symbol}${totals.futureValueAtSelected.toFixed(2)}</strong></td>
                            <td><strong>${symbol}${totals.discountedValue.toFixed(2)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    async exportToPDF() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Título
            doc.setFontSize(16);
            doc.text('Reporte de Cartera de Descuento', 20, 20);

            // Fecha y método
            doc.setFontSize(12);
            const selectedDate = document.getElementById('selectedDate').value;
            const methodName = document.querySelector('input[name="calculationMethod"]:checked').parentElement.querySelector('h4').textContent;
            doc.text(`Fecha de Descuento: ${new Date(selectedDate).toLocaleDateString()}`, 20, 30);
            doc.text(`Método de Cálculo: ${methodName}`, 20, 40);

            let yPos = 50;

            // Función helper para agregar tablas
            const addCurrencyTable = (title, docs, symbol) => {
                if (docs.length === 0) return yPos;

                doc.setFontSize(14);
                doc.text(title, 20, yPos);
                yPos += 10;

                const tableData = docs.map(doc => [
                    doc.documentCode,
                    doc.bank,
                    `${symbol}${doc.originalAmount.toFixed(2)}`,
                    `${symbol}${doc.futureValue.toFixed(2)}`,
                    `${symbol}${doc.futureValueAtSelected.toFixed(2)}`,
                    `${symbol}${doc.discountedValue.toFixed(2)}`
                ]);

                const totals = docs.reduce((acc, curr) => ({
                    originalAmount: acc.originalAmount + curr.originalAmount,
                    futureValue: acc.futureValue + curr.futureValue,
                    futureValueAtSelected: acc.futureValueAtSelected + curr.futureValueAtSelected,
                    discountedValue: acc.discountedValue + curr.discountedValue
                }), { originalAmount: 0, futureValue: 0, futureValueAtSelected: 0, discountedValue: 0 });

                tableData.push([
                    'TOTALES',
                    '',
                    `${symbol}${totals.originalAmount.toFixed(2)}`,
                    `${symbol}${totals.futureValue.toFixed(2)}`,
                    `${symbol}${totals.futureValueAtSelected.toFixed(2)}`,
                    `${symbol}${totals.discountedValue.toFixed(2)}`
                ]);

                doc.autoTable({
                    startY: yPos,
                    head: [['Documento', 'Banco', 'Monto Original', 'Valor Futuro', 'Valor Futuro a Fecha', 'Valor Descontado']],
                    body: tableData,
                    theme: 'grid',
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [44, 62, 80] }
                });

                yPos = doc.lastAutoTable.finalY + 15;
                return yPos;
            };

            // Agregar tablas por moneda
            const resultsContainer = document.getElementById('calculationResults');
            const penDocs = Array.from(resultsContainer.querySelectorAll('.currency-section')).find(section => section.textContent.includes('Soles'));
            const usdDocs = Array.from(resultsContainer.querySelectorAll('.currency-section')).find(section => section.textContent.includes('Dólares'));

            if (penDocs) {
                yPos = addCurrencyTable('Documentos en Soles (PEN)', this.extractTableData(penDocs), 'S/. ');
            }

            if (usdDocs) {
                yPos = addCurrencyTable('Documentos en Dólares (USD)', this.extractTableData(usdDocs), '$ ');
            }

            // Agregar detalles de cálculo
            doc.addPage();
            doc.setFontSize(14);
            doc.text('Detalle de Cálculos', 20, 20);

            const calculations = document.querySelectorAll('.calculation-item');
            let calcYPos = 30;

            calculations.forEach(calc => {
                const title = calc.querySelector('h5').textContent;
                const steps = Array.from(calc.querySelectorAll('.step'));
                
                doc.setFontSize(12);
                doc.text(title, 20, calcYPos);
                calcYPos += 10;

                steps.forEach(step => {
                    const stepTitle = step.querySelector('h6').textContent;
                    const formula = step.querySelector('.formula').textContent;
                    const result = step.querySelector('.result')?.textContent || '';

                    doc.setFontSize(10);
                    doc.text(stepTitle, 25, calcYPos);
                    calcYPos += 5;
                    doc.text(formula + ' ' + result, 30, calcYPos);
                    calcYPos += 10;
                });

                const summary = calc.querySelector('.summary');
                if (summary) {
                    const summaryText = Array.from(summary.querySelectorAll('p'))
                        .map(p => p.textContent)
                        .join('\n');
                    
                    doc.setFontSize(10);
                    doc.text(summaryText, 25, calcYPos);
                    calcYPos += 20;
                }

                if (calcYPos > 250) {
                    doc.addPage();
                    calcYPos = 20;
                }
            });

            doc.save('cartera-descuento.pdf');
        } catch (error) {
            console.error('Error al exportar PDF:', error);
            alert('Error al exportar PDF. Por favor, intente nuevamente.');
        }
    }

    extractTableData(section) {
        const rows = Array.from(section.querySelectorAll('tbody tr:not(.totals)'));
        return rows.map(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            return {
                documentCode: cells[0].textContent,
                bank: cells[1].textContent,
                originalAmount: parseFloat(cells[2].textContent.replace(/[^0-9.-]+/g, '')),
                futureValue: parseFloat(cells[3].textContent.replace(/[^0-9.-]+/g, '')),
                futureValueAtSelected: parseFloat(cells[4].textContent.replace(/[^0-9.-]+/g, '')),
                discountedValue: parseFloat(cells[5].textContent.replace(/[^0-9.-]+/g, ''))
            };
        });
    }

    setupFilterListeners() {
        ['filterCurrency', 'filterBank'].forEach(filterId => {
            document.getElementById(filterId).addEventListener('change', () => this.applyFilters());
        });
    }

    async applyFilters() {
        const currency = document.getElementById('filterCurrency').value;
        const bankId = document.getElementById('filterBank').value;
        
        let url = `${API_URL}/documents?`;
        if (currency) url += `currency=${currency}&`;
        if (bankId) url += `bankId=${bankId}&`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.documents = await response.json();
            this.renderPortfolio();
        } catch (error) {
            console.error('Error aplicando filtros:', error);
        }
    }

    setupEventListeners() {
        document.querySelector('nav a[data-section="portfolio"]').addEventListener('click', (e) => {
            e.preventDefault();
            this.loadPortfolio();
        });
    }

    generateConclusions(results) {
        // Agrupar documentos por banco y moneda
        const bankGroups = results.details.reduce((groups, doc) => {
            const key = `${doc.bank}_${doc.currency}`;
            if (!groups[key]) {
                groups[key] = {
                    bank: doc.bank,
                    currency: doc.currency,
                    total: 0,
                    documents: []
                };
            }
            groups[key].total += doc.discountedValue;
            groups[key].documents.push(doc);
            return groups;
        }, {});

        let html = `<div class="conclusions-container">`;

        // Generar conclusiones por banco
        Object.values(bankGroups).forEach(group => {
            const currencySymbol = group.currency === 'PEN' ? 'S/. ' : '$ ';
            
            if (group.bank === 'Sin banco') {
                const compatibleBanks = this.banks.filter(bank => 
                    bank.acceptedCurrencies.includes(group.currency) || bank.acceptedCurrencies.includes('BOTH')
                );

                html += `
                    <div class="conclusion-item no-bank">
                        <h4>Documentos sin Banco Asignado (${group.currency})</h4>
                        <p>Total a financiar: ${currencySymbol}${group.total.toFixed(2)}</p>
                        <p>Documentos incluidos: ${group.documents.map(d => d.documentCode).join(', ')}</p>
                        ${compatibleBanks.length > 0 ? `
                            <div class="bank-recommendations">
                                <p>Bancos recomendados que aceptan ${group.currency}:</p>
                                <ul>
                                    ${compatibleBanks.map(bank => `
                                        <li>
                                            <strong>${bank.name}</strong> (Tasa: ${bank.discountRate}%)
                                            <br>
                                            <small>Si eliges este banco, te pagaría aproximadamente: 
                                            ${currencySymbol}${(group.total * (1 - bank.discountRate/100)).toFixed(2)}</small>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : `
                            <p class="warning">No se encontraron bancos que acepten ${group.currency}</p>
                        `}
                    </div>
                `;
            } else {
                html += `
                    <div class="conclusion-item">
                        <h4>${group.bank} (${group.currency})</h4>
                        <p>Total a financiar: ${currencySymbol}${group.total.toFixed(2)}</p>
                        <p>Documentos incluidos: ${group.documents.map(d => d.documentCode).join(', ')}</p>
                    </div>
                `;
            }
        });

        // Agregar explicación del método seleccionado
        const methodName = document.querySelector('input[name="calculationMethod"]:checked').parentElement.querySelector('h4').textContent;
        html += `
            <div class="method-explanation">
                <h4>Sobre el Método de Cálculo</h4>
                <p>Se utilizó el método "${methodName}" para el cálculo del descuento.</p>
                ${this.getMethodExplanation(results.calculationType)}
            </div>

            <div class="final-summary">
                <h4>Resumen Final de Financiamiento</h4>
                ${Object.values(bankGroups).map(group => {
                    const currencySymbol = group.currency === 'PEN' ? 'S/. ' : '$ ';
                    return `
                        <div class="summary-item">
                            <p><strong>${group.bank}</strong> te debería pagar: ${currencySymbol}${group.total.toFixed(2)}</p>
                            <small>Por los documentos: ${group.documents.map(d => d.documentCode).join(', ')}</small>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>`;

        return html;
    }

    getMethodExplanation(calculationType) {
        const daysConfig = CalculationConfig.getConfigDescription();
        const daysInYear = CalculationConfig.getDaysInYear();
        
        let explanation;
        switch(calculationType) {
            case 'futureAtSelected':
                explanation = `
                    <div class="method-detail">
                        <p>Este método calcula el valor futuro hasta la fecha seleccionada, lo que significa:</p>
                        <ol>
                            <li>Se calcula el valor futuro del documento hasta la fecha seleccionada usando la TCEA</li>
                            <li>Este valor intermedio se usa como base para el descuento</li>
                            <li>Se aplica la tasa de descuento por el período restante hasta el vencimiento</li>
                        </ol>
                        <div class="formula-box">
                            <h5>Fórmulas Aplicadas:</h5>
                            <div class="formula">
                                <p>1. Valor Futuro a Fecha Seleccionada:</p>
                                <code>VF_selected = Monto_Original × (1 + TCEA)^(días_hasta_fecha_seleccionada/${daysInYear})</code>
                            </div>
                            <div class="formula">
                                <p>2. Valor Descontado:</p>
                                <code>VD = VF_selected ÷ (1 + Tasa_Descuento)^(días_restantes/${daysInYear})</code>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'original':
                explanation = `
                    <div class="method-detail">
                        <p>Este método usa directamente el monto original para el descuento:</p>
                        <div class="formula-box">
                            <h5>Fórmula Aplicada:</h5>
                            <code>VD = Monto_Original ÷ (1 + Tasa_Descuento)^(días_totales/${daysInYear})</code>
                        </div>
                    </div>
                `;
                break;
            case 'future':
            default:
                explanation = `
                    <div class="method-detail">
                        <p>Este método calcula primero el valor futuro total y luego aplica el descuento:</p>
                        <div class="formula-box">
                            <h5>Fórmulas Aplicadas:</h5>
                            <div class="formula">
                                <p>1. Valor Futuro Total:</p>
                                <code>VF = Monto_Original × (1 + TCEA)^(días_totales/${daysInYear})</code>
                            </div>
                            <div class="formula">
                                <p>2. Valor Descontado:</p>
                                <code>VD = VF ÷ (1 + Tasa_Descuento)^(días_desde_selección/${daysInYear})</code>
                            </div>
                        </div>
                    </div>
                `;
        }

        return `
            <div class="calculation-config">
                <p><strong>Configuración:</strong> ${daysConfig}</p>
            </div>
            ${explanation}
        `;
    }

    findCompatibleBanks(currency) {
        return this.banks.filter(bank => 
            bank.acceptedCurrencies === 'BOTH' || bank.acceptedCurrencies === currency
        );
    }
}

const portfolioManager = new PortfolioManager(); 