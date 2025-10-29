const API_LOGIN_URL = '/login'; 

// --- ELEMENTOS DO DOM ---
const loginForm = document.getElementById('login-form');
const loginButtonText = document.getElementById('login-button-text');
const loginButtonSpinner = document.getElementById('login-button-spinner');
const loginError = document.getElementById('login-error');
const loginErrorMessage = document.getElementById('login-error-message');

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const token = localStorage.getItem('authToken');
    if (token) {
        window.location.href = '../home/home.html';
        return;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// --- FUNÇÕES DE CONTROLE DE UI ---

function setLoginLoading(isLoading) {
    if (isLoading) {
        loginButtonText.classList.add('hidden');
        loginButtonSpinner.classList.remove('hidden');
        if (loginForm) {
            loginForm.querySelector('button[type="submit"]').disabled = true;
        }
    } else {
        loginButtonText.classList.remove('hidden');
        loginButtonSpinner.classList.add('hidden');
        if (loginForm) {
            loginForm.querySelector('button[type="submit"]').disabled = false;
        }
    }
}

function showLoginError(message) {
    if (loginErrorMessage) {
        loginErrorMessage.textContent = message || "E-mail ou senha incorretos.";
    }
    if (loginError) {
        loginError.classList.remove('hidden');
    }
}

// --- LÓGICA DE AUTENTICAÇÃO ---

async function handleLogin(event) {
    event.preventDefault();
    setLoginLoading(true);
    if (loginError) {
        loginError.classList.add('hidden');
    }

    const formData = new FormData(loginForm);
    
    try {
        const response = await fetch(API_LOGIN_URL, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || `Erro ${response.status}`);
        }

        const token = data.access_token;
        localStorage.setItem('authToken', token);
        
        window.location.href = '../home/home.html';

    } catch (error) {
        console.error('Erro no login:', error);
        showLoginError(error.message);
    } finally {
        setLoginLoading(false);
    }
}
