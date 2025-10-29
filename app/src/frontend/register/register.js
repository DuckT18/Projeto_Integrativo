const API_REGISTER_URL = '/register'; 

// --- ELEMENTOS DO DOM ---
const registerForm = document.getElementById('register-form');
const registerButtonText = document.getElementById('register-button-text');
const registerButtonSpinner = document.getElementById('register-button-spinner');
const registerError = document.getElementById('register-error');
const registerErrorMessage = document.getElementById('register-error-message');
const registerSuccess = document.getElementById('register-success');

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

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// --- FUNÇÕES DE CONTROLE DE UI ---
function setRegisterLoading(isLoading) {
    if (isLoading) {
        registerButtonText.classList.add('hidden');
        registerButtonSpinner.classList.remove('hidden');
        if (registerForm) {
            registerForm.querySelector('button[type="submit"]').disabled = true;
        }
    } else {
        registerButtonText.classList.remove('hidden');
        registerButtonSpinner.classList.add('hidden');
        if (registerForm) {
            registerForm.querySelector('button[type="submit"]').disabled = false;
        }
    }
}

function showRegisterError(message) {
    if (registerSuccess) registerSuccess.classList.add('hidden');
    if (registerErrorMessage) {
        registerErrorMessage.textContent = message || "Ocorreu um erro.";
    }
    if (registerError) {
        registerError.classList.remove('hidden');
    }
}

function showRegisterSuccess(message) {
    if (registerError) registerError.classList.add('hidden');
    if (registerSuccess) {
        registerSuccess.classList.remove('hidden');
    }
}

// --- LÓGICA DE REGISTRO ---
async function handleRegister(event) {
    event.preventDefault();
    setRegisterLoading(true);
    if (registerError) registerError.classList.add('hidden');
    if (registerSuccess) registerSuccess.classList.add('hidden');

    const formData = new FormData(registerForm);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const passwordConfirm = formData.get('password-confirm');

    if (password !== passwordConfirm) {
        showRegisterError("As senhas não conferem.");
        setRegisterLoading(false);
        return;
    }

    const payload = {
        email: email,
        username: username,
        password: password
    };

    try {
        const response = await fetch(API_REGISTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || `Erro ${response.status}`);
        }

        showRegisterSuccess();
        
        setTimeout(() => {
            window.location.href = '../login/login.html';
        }, 2000);

    } catch (error) {
        console.error('Erro no registro:', error);
        showRegisterError(error.message);
    } finally {
        setRegisterLoading(false);
    }
}
