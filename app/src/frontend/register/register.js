// --- CONSTANTES GLOBAIS ---
const API_REGISTER_URL = '/register'; // Ajuste se seu prefixo mudou (ex: /api/v1/register)

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

// --- FUNÇÕES DE UI ---
function setRegisterLoading(isLoading) {
    if (isLoading) {
        registerButtonText.classList.add('hidden');
        registerButtonSpinner.classList.remove('hidden');
        if (registerForm) registerForm.querySelector('button[type="submit"]').disabled = true;
    } else {
        registerButtonText.classList.remove('hidden');
        registerButtonSpinner.classList.add('hidden');
        if (registerForm) registerForm.querySelector('button[type="submit"]').disabled = false;
    }
}

function showRegisterError(message) {
    if (registerSuccess) registerSuccess.classList.add('hidden');
    if (registerErrorMessage) registerErrorMessage.textContent = message || "Ocorreu um erro.";
    if (registerError) registerError.classList.remove('hidden');
}

function showRegisterSuccess() {
    if (registerError) registerError.classList.add('hidden');
    if (registerSuccess) registerSuccess.classList.remove('hidden');
}

// --- LÓGICA DE REGISTRO ---
async function handleRegister(event) {
    event.preventDefault();
    setRegisterLoading(true);
    if (registerError) registerError.classList.add('hidden');
    
    const formData = new FormData(registerForm);
    const password = formData.get('password');
    const passwordConfirm = formData.get('password-confirm');
    const username = formData.get('username');

    // 1. Validação de Senha
    if (password !== passwordConfirm) {
        showRegisterError("As senhas não conferem.");
        setRegisterLoading(false);
        return;
    }

    // 2. Geração de Avatar (Mock)
    // Usamos o username para gerar sempre a mesma imagem "aleatória" para aquele usuário
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    // 3. Montagem do Payload (Exatamente como o Schema UserCreate pede)
    const payload = {
        nome: formData.get('nome'),           // Novo campo
        username: username,                   // Novo campo
        email: formData.get('email'),
        password: password,
        tipo_perfil: formData.get('tipo_perfil'), // Novo campo
        avatar_url: avatarUrl                 // Gerado automaticamente
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

        // Sucesso
        showRegisterSuccess();
        
        // Redireciona
        setTimeout(() => {
            window.location.href = '../login/login.html';
        }, 2000);

    } catch (error) {
        console.error('Erro no registro:', error);
        // Tratamento para erro de validação do Pydantic (lista de erros)
        if (Array.isArray(error.detail)) {
            const msg = error.detail.map(e => e.msg).join(', ');
            showRegisterError(msg);
        } else {
            showRegisterError(error.message);
        }
    } finally {
        setRegisterLoading(false);
    }
}