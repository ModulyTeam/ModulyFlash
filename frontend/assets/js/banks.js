class BankManager {
    constructor() {
        this.banks = [];
        this.loadBanks();
        this.setupEventListeners();
    }

    async loadBanks() {
        try {
            const response = await fetch(`${API_URL}/banks`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.banks = await response.json();
            this.renderBanks();
        } catch (error) {
            console.error('Error cargando bancos:', error);
        }
    }

    renderBanks() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="banks-section">
                <h2>Gestión de Bancos</h2>
                <form id="bankForm">
                    <input type="text" id="bankName" placeholder="Nombre del Banco" required>
                    <input type="number" id="discountRate" placeholder="Tasa de Descuento (%)" step="0.01" required>
                    <select id="acceptedCurrencies" required>
                        <option value="PEN">Solo Soles (PEN)</option>
                        <option value="USD">Solo Dólares (USD)</option>
                        <option value="BOTH">Ambas Monedas (PEN y USD)</option>
                    </select>
                    <input type="text" id="accountNumber" placeholder="Número de Cuenta" required>
                    <button type="submit">Agregar Banco</button>
                </form>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tasa de Descuento</th>
                                <th>Monedas Aceptadas</th>
                                <th>Número de Cuenta</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.banks.map(bank => `
                                <tr>
                                    <td>${bank.name}</td>
                                    <td>${bank.discountRate}%</td>
                                    <td>${this.formatAcceptedCurrencies(bank.acceptedCurrencies)}</td>
                                    <td>${bank.accountNumber}</td>
                                    <td>
                                        <button onclick="bankManager.editBank('${bank._id}')">Editar</button>
                                        <button onclick="bankManager.deleteBank('${bank._id}')">Eliminar</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.setupFormListener();
    }

    formatAcceptedCurrencies(currencies) {
        switch(currencies) {
            case 'PEN':
                return 'Solo Soles';
            case 'USD':
                return 'Solo Dólares';
            case 'BOTH':
                return 'Soles y Dólares';
            default:
                return currencies;
        }
    }

    setupFormListener() {
        const form = document.getElementById('bankForm');
        form.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        const bankData = {
            name: document.getElementById('bankName').value,
            discountRate: parseFloat(document.getElementById('discountRate').value),
            acceptedCurrencies: document.getElementById('acceptedCurrencies').value,
            accountNumber: document.getElementById('accountNumber').value
        };

        try {
            const submitButton = e.target.querySelector('button[type="submit"]');
            const isEditing = submitButton.textContent === 'Actualizar Banco';
            const bankId = e.target.dataset.editingBankId;

            const url = isEditing ? `${API_URL}/banks/${bankId}` : `${API_URL}/banks`;
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(bankData)
            });

            if (response.ok) {
                await this.loadBanks();
                this.resetForm(e.target);
            } else {
                alert(`Error al ${isEditing ? 'actualizar' : 'crear'} banco`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    resetForm(form) {
        form.reset();
        form.dataset.editingBankId = '';
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.textContent = 'Agregar Banco';
    }

    async deleteBank(bankId) {
        if (confirm('¿Está seguro de eliminar este banco?')) {
            try {
                const response = await fetch(`${API_URL}/banks/${bankId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    await this.loadBanks();
                } else {
                    alert('Error al eliminar banco');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }

    setupEventListeners() {
        document.querySelector('nav a[data-section="banks"]').addEventListener('click', (e) => {
            e.preventDefault();
            this.loadBanks();
        });
    }

    async editBank(bankId) {
        const bank = this.banks.find(b => b._id === bankId);
        if (!bank) return;

        const form = document.getElementById('bankForm');
        form.dataset.editingBankId = bankId;
        
        document.getElementById('bankName').value = bank.name;
        document.getElementById('discountRate').value = bank.discountRate;
        document.getElementById('acceptedCurrencies').value = bank.acceptedCurrencies;
        document.getElementById('accountNumber').value = bank.accountNumber;

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.textContent = 'Actualizar Banco';
    }
}

const bankManager = new BankManager(); 