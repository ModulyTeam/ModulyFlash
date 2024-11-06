class HomeManager {
    constructor() {
        this.setupEventListeners();
    }

    async loadHome() {
        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const userData = await response.json();
            this.renderHome(userData);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    renderHome(userData) {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="home-section" data-intro="¡Bienvenido a tu panel principal!" data-step="1">
                <h2>Bienvenido, ${userData.username}</h2>
                
                <div class="profile-section" data-intro="Aquí puedes gestionar tu perfil" data-step="2">
                    <h3>Tu Perfil</h3>
                    <form id="profileForm">
                        <div class="form-group">
                            <label>Nombre de Usuario</label>
                            <input type="text" id="username" value="${userData.username}" required>
                        </div>
                        <button type="submit">Actualizar Usuario</button>
                    </form>

                    <form id="passwordForm" class="mt-4">
                        <h4>Cambiar Contraseña</h4>
                        <div class="form-group">
                            <label>Contraseña Actual</label>
                            <input type="password" id="currentPassword" required>
                        </div>
                        <div class="form-group">
                            <label>Nueva Contraseña</label>
                            <input type="password" id="newPassword" required>
                        </div>
                        <div class="form-group">
                            <label>Confirmar Nueva Contraseña</label>
                            <input type="password" id="confirmPassword" required>
                        </div>
                        <button type="submit">Cambiar Contraseña</button>
                    </form>
                </div>

                <div class="quick-actions" data-intro="Acciones rápidas para comenzar" data-step="3">
                    <h3>Acciones Rápidas</h3>
                    <div class="actions-grid">
                        <div class="action-card" data-intro="Gestiona tus documentos financieros" data-step="4">
                            <h4>Documentos Financieros</h4>
                            <p>Crea y administra tus facturas y letras</p>
                            <button onclick="location.hash = '#documents'">Ir a Documentos</button>
                        </div>
                        <div class="action-card" data-intro="Configura tus bancos" data-step="5">
                            <h4>Bancos</h4>
                            <p>Gestiona tus bancos y tasas de descuento</p>
                            <button onclick="location.hash = '#banks'">Ir a Bancos</button>
                        </div>
                        <div class="action-card" data-intro="Calcula tus carteras de descuento" data-step="6">
                            <h4>Cartera de Descuento</h4>
                            <p>Calcula el valor de tus documentos</p>
                            <button onclick="location.hash = '#portfolio'">Ir a Cartera</button>
                        </div>
                    </div>
                </div>

                <button id="startTutorial" class="tutorial-button" data-intro="¡Inicia el tutorial cuando quieras!" data-step="7">
                    Iniciar Tutorial
                </button>
            </div>
        `;

        this.setupFormListeners();
        document.getElementById('startTutorial').addEventListener('click', () => tutorialManager.startTutorial());
    }

    setupFormListeners() {
        document.getElementById('profileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;

            try {
                const response = await fetch(`${API_URL}/users/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ username })
                });

                if (response.ok) {
                    alert('Usuario actualizado exitosamente');
                    this.loadHome();
                } else {
                    alert('Error al actualizar usuario');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al actualizar usuario');
            }
        });

        document.getElementById('passwordForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (newPassword !== confirmPassword) {
                alert('Las contraseñas no coinciden');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/users/password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ currentPassword, newPassword })
                });

                if (response.ok) {
                    alert('Contraseña actualizada exitosamente');
                    e.target.reset();
                } else {
                    alert('Error al actualizar contraseña');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al actualizar contraseña');
            }
        });
    }

    setupEventListeners() {
        window.addEventListener('hashchange', () => {
            if (location.hash === '#home' || location.hash === '') {
                this.loadHome();
            }
        });
    }
}

const homeManager = new HomeManager();