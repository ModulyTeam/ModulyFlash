const authToken = localStorage.getItem('token');

async function showWelcome() {
    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const userData = await response.json();
        
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="welcome-section">
                <h2>Bienvenido al Sistema de Gestión Financiera</h2>
                <p>Utiliza la barra de navegación para acceder a las diferentes funcionalidades.</p>
                
                <div class="user-profile-section">
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
            </div>
        `;

        setupProfileFormListeners();
    } catch (error) {
        console.error('Error:', error);
    }
}

function setupProfileFormListeners() {
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
                showWelcome();
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
                const data = await response.json();
                alert(data.message || 'Error al actualizar contraseña');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar contraseña');
        }
    });
}

if (authToken) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-section').style.display = 'block';
    showWelcome();
}

document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
});

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            window.location.reload();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error al iniciar sesión');
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            window.location.reload();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error al registrar usuario');
    }
});

document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.reload();
});

// Manejo de rutas
window.addEventListener('hashchange', handleRoute);
window.addEventListener('load', handleRoute);

function handleRoute() {
    console.log('Manejando ruta:', window.location.pathname);
    const content = document.getElementById('content');
    const path = window.location.pathname;

    if (!content) {
        console.error('No se encontró el elemento content');
        return;
    }

    // Asegurarnos de que portfolioManager exista
    if (path === '/portfolio' && !window.portfolioManager) {
        window.portfolioManager = new PortfolioManager();
    }

    // Manejar rutas
    switch(path) {
        case '/portfolio':
            if (window.portfolioManager) {
                window.portfolioManager.loadPortfolio();
            } else {
                console.error('No se pudo inicializar portfolioManager');
            }
            break;
        case '/documents':
            documentManager.loadDocuments();
            break;
        case '/banks':
            bankManager.loadBanks();
            break;
        case '/':
        default:
            showWelcome();
    }
}

// Asegurarse de que el evento DOMContentLoaded maneje la ruta inicial
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('token')) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('main-section').style.display = 'block';
        handleRoute();
    }
}); 