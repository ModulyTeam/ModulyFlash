class DocumentManager {
    constructor() {
        this.documents = [];
        this.banks = [];
        this.setupEventListeners();
    }

    async loadDocuments() {
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
            this.renderDocuments();
        } catch (error) {
            console.error('Error cargando documentos:', error);
        }
    }

    renderDocuments() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="documents-section">
                <h2>Gestión de Documentos Financieros</h2>
                <form id="documentForm">
                    <input type="text" id="documentCode" placeholder="Código del Documento" required>
                    <select id="documentType" required>
                        <option value="FACTURA">Factura</option>
                        <option value="LETRA">Letra</option>
                    </select>
                    <textarea id="description" placeholder="Descripción"></textarea>
                    <input type="date" id="emissionDate" required>
                    <input type="date" id="dueDate" required>
                    <select id="bankId">
                        <option value="">Seleccione un Banco (Opcional)</option>
                        ${this.banks.map(bank => `<option value="${bank._id}">${bank.name}</option>`).join('')}
                    </select>
                    <select id="currency" required>
                        <option value="PEN">Soles (PEN)</option>
                        <option value="USD">Dólares (USD)</option>
                    </select>
                    <div id="documentRateInput">
                        <input type="number" id="tcea" placeholder="TCEA (%)" step="0.01" required>
                    </div>
                    <input type="number" id="unit" placeholder="Cantidad" required>
                    <input type="number" id="unitPrice" placeholder="Precio por Unidad" step="0.01" required>
                    <input type="text" id="status" placeholder="Estado" required>
                    <button type="submit">Crear Documento</button>
                </form>

                <div class="document-filters">
                    <select id="filterType">
                        <option value="">Todos los tipos</option>
                        <option value="FACTURA">Facturas</option>
                        <option value="LETRA">Letras</option>
                    </select>
                    <select id="filterCurrency">
                        <option value="">Todas las monedas</option>
                        <option value="PEN">Soles (PEN)</option>
                        <option value="USD">Dólares (USD)</option>
                    </select>
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Tipo</th>
                                <th>Emisión</th>
                                <th>Vencimiento</th>
                                <th>Banco</th>
                                <th>Moneda</th>
                                <th>TCEA</th>
                                <th>Cantidad</th>
                                <th>Precio Unit.</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.documents.map(doc => {
                                const bankName = doc.bankId && doc.bankId.name ? doc.bankId.name : '-';
                                return `
                                    <tr>
                                        <td>${doc.code}</td>
                                        <td>${doc.type}</td>
                                        <td>${new Date(doc.emissionDate).toLocaleDateString()}</td>
                                        <td>${new Date(doc.dueDate).toLocaleDateString()}</td>
                                        <td>${bankName}</td>
                                        <td>${doc.currency}</td>
                                        <td>${doc.tcea}%</td>
                                        <td>${doc.unit}</td>
                                        <td>${doc.unitPrice}</td>
                                        <td>${doc.currency === 'PEN' ? 'S/. ' : '$ '}${(doc.unit * doc.unitPrice).toFixed(2)}</td>
                                        <td>${doc.status}</td>
                                        <td>
                                            <button onclick="documentManager.deleteDocument('${doc._id}')">Eliminar</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.setupFormListener();
        this.setupFilterListeners();

        // Inicializar el input de tasa
        RateInput.createRateInputGroup('documentRateInput');
    }

    setupFormListener() {
        const form = document.getElementById('documentForm');
        const currencySelect = document.getElementById('currency');
        const bankSelect = document.getElementById('bankId');

        currencySelect.addEventListener('change', () => {
            const selectedCurrency = currencySelect.value;
            const compatibleBanks = this.banks.filter(bank => 
                bank.acceptedCurrencies[0] === 'BOTH' || bank.acceptedCurrencies[0] === selectedCurrency
            );

            bankSelect.innerHTML = `
                <option value="">Seleccione un Banco (Opcional)</option>
                ${compatibleBanks.map(bank => {
                    const currencyText = bank.acceptedCurrencies[0] === 'BOTH' ? 
                        'PEN y USD' : 
                        bank.acceptedCurrencies[0] === 'PEN' ? 'PEN' : 'USD';
                    return `<option value="${bank._id}">${bank.name} (${currencyText})</option>`;
                }).join('')}
            `;
        });

        bankSelect.addEventListener('change', () => {
            const selectedBank = this.banks.find(b => b._id === bankSelect.value);
            if (selectedBank && selectedBank.acceptedCurrencies[0] !== 'BOTH') {
                currencySelect.value = selectedBank.acceptedCurrencies[0];
                currencySelect.disabled = true;
            } else {
                currencySelect.disabled = false;
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const documentData = {
                code: document.getElementById('documentCode').value,
                type: document.getElementById('documentType').value,
                description: document.getElementById('description').value,
                emissionDate: document.getElementById('emissionDate').value,
                dueDate: document.getElementById('dueDate').value,
                bankId: document.getElementById('bankId').value || null,
                currency: document.getElementById('currency').value,
                tcea: parseFloat(document.getElementById('tcea').value),
                unit: parseInt(document.getElementById('unit').value),
                unitPrice: parseFloat(document.getElementById('unitPrice').value),
                status: document.getElementById('status').value
            };

            try {
                const response = await fetch(`${API_URL}/documents`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(documentData)
                });

                if (response.ok) {
                    await this.loadDocuments();
                    e.target.reset();
                } else {
                    alert('Error al crear documento');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

    setupFilterListeners() {
        ['filterType', 'filterCurrency'].forEach(filterId => {
            document.getElementById(filterId).addEventListener('change', () => this.applyFilters());
        });
    }

    async applyFilters() {
        const type = document.getElementById('filterType').value;
        const currency = document.getElementById('filterCurrency').value;
        
        let url = `${API_URL}/documents?`;
        if (type) url += `type=${type}&`;
        if (currency) url += `currency=${currency}&`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.documents = await response.json();
            this.renderDocuments();
        } catch (error) {
            console.error('Error aplicando filtros:', error);
        }
    }

    async deleteDocument(documentId) {
        if (confirm('¿Está seguro de eliminar este documento?')) {
            try {
                const response = await fetch(`${API_URL}/documents/${documentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    await this.loadDocuments();
                } else {
                    alert('Error al eliminar documento');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }

    setupEventListeners() {
        document.querySelector('nav a[data-section="documents"]').addEventListener('click', (e) => {
            e.preventDefault();
            this.loadDocuments();
        });
    }
}

const documentManager = new DocumentManager(); 