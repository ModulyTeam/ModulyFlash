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
            <div class="welcome-section">
                <h2>Bienvenido, ${userData.username}</h2>
                
                <div class="user-profile-section">
                    <form id="profileForm">
                        <h3>Tu Perfil</h3>
                        <div class="form-group">
                            <label>Nombre de Usuario</label>
                            <input type="text" id="username" value="${userData.username}" required>
                        </div>
                        <button type="submit">Actualizar Usuario</button>
                    </form>

                    <form id="passwordForm">
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