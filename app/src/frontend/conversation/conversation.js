console.log(">>> CONVERSATION.JS (WebSocket) CARREGADO <<<");

// --- CONSTANTES ---
// Use ws:// para http local e wss:// para https (produção)
const WS_URL = 'ws://127.0.0.1:8000/ws'; 

// --- ELEMENTOS DO DOM ---
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesArea = document.getElementById('messages-area');
const chatName = document.getElementById('chat-name');
const chatAvatar = document.getElementById('chat-avatar');

// --- ESTADO ---
let socket = null;
let currentReceiverId = null;
let currentUserToken = null;

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Check
    currentUserToken = localStorage.getItem('authToken');
    if (!currentUserToken) {
        window.location.href = '../login/login.html';
        return;
    }

    // 2. Identificar com quem estamos falando (ID da URL)
    const params = new URLSearchParams(window.location.search);
    currentReceiverId = params.get('id');

    if (!currentReceiverId) {
        alert("Conversa inválida.");
        window.location.href = 'chat.html';
        return;
    }

    // 3. Configurar UI Inicial (Simulação de dados do usuário alvo)
    setupHeader(currentReceiverId);

    // 4. Conectar ao WebSocket
    connectWebSocket();

    // 5. Listeners de Envio
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Scroll inicial
    scrollToBottom();
});

// --- LÓGICA WEBSOCKET ---
function connectWebSocket() {
    // Passamos o token na URL porque WebSockets JS não suportam headers customizados no handshake
    const wsUrlWithToken = `${WS_URL}?token=${currentUserToken}`;
    
    socket = new WebSocket(wsUrlWithToken);

    socket.onopen = () => {
        console.log("✅ WebSocket Conectado!");
        // Opcional: Mudar status visual para online
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleIncomingMessage(data);
        } catch (e) {
            console.error("Erro ao processar mensagem recebida:", event.data);
        }
    };

    socket.onclose = (event) => {
        console.warn("⚠️ WebSocket Desconectado.", event.reason);
        // Tentar reconectar em 3 segundos
        setTimeout(connectWebSocket, 3000);
    };

    socket.onerror = (error) => {
        console.error("❌ Erro no WebSocket:", error);
    };
}

// --- ENVIAR MENSAGEM ---
function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
        alert("Sem conexão com o servidor. Tente novamente.");
        return;
    }

    // 1. Montar Payload (Protocolo que definimos)
    const payload = {
        receiver_id: parseInt(currentReceiverId),
        content: text
    };

    // 2. Enviar pelo Tubo
    socket.send(JSON.stringify(payload));

    // 3. Renderizar Otamisticamente (Minha mensagem)
    renderMessage(text, 'me');

    // 4. Limpar input
    messageInput.value = '';
    scrollToBottom();
}

// --- RECEBER MENSAGEM ---
function handleIncomingMessage(data) {
    // data espera ter: { sender_id, content, ... }
    
    // Verifica se a mensagem veio da pessoa com quem estou falando agora
    if (data.sender_id == currentReceiverId) {
        renderMessage(data.content, 'other');
        scrollToBottom();
    } else {
        // Se veio de outra pessoa, poderia mostrar uma notificação toast
        console.log(`Nova mensagem de ${data.sender_id}: ${data.content}`);
    }
}

// --- RENDERIZAÇÃO VISUAL ---
function renderMessage(text, type) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let html = '';

    if (type === 'me') {
        // Minha mensagem (Amarela / Direita)
        html = `
            <div class="flex gap-3 max-w-[85%] self-end flex-row-reverse animate-in">
                <div class="bg-brand-yellow p-3 rounded-2xl rounded-br-none shadow-sm">
                    <p class="text-sm text-black font-medium text-left">${text}</p>
                    <div class="flex items-center justify-end gap-1 mt-1">
                        <span class="text-[10px] text-yellow-900/60">${time}</span>
                        <i data-lucide="check" class="h-3 w-3 text-black/60"></i>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Mensagem do Outro (Branca / Esquerda)
        // Usa o src do avatar do header como referência
        const avatarSrc = document.getElementById('chat-avatar').src;
        
        html = `
            <div class="flex gap-3 max-w-[85%] animate-in">
                <img src="${avatarSrc}" class="w-8 h-8 rounded-full object-cover self-end mb-1">
                <div class="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-sm">
                    <p class="text-sm text-gray-700 text-left">${text}</p>
                    <span class="text-[10px] text-gray-400 block text-right mt-1">${time}</span>
                </div>
            </div>
        `;
    }

    messagesArea.insertAdjacentHTML('beforeend', html);
    if(window.lucide) lucide.createIcons();
}

// --- UTILITÁRIOS ---
function scrollToBottom() {
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function setupHeader(userId) {
    // Mock: Define nome/avatar baseado no ID apenas para demonstração
    // No futuro, faria um fetch(`/api/v1/users/${userId}`)
    
    // IDs simulados para teste
    const mockUsers = {
        '10': { name: 'Ana Resgatista', avatar: 'https://i.pravatar.cc/150?img=12' },
        '20': { name: 'Bruno Veterinário', avatar: 'https://i.pravatar.cc/150?img=59' }
    };

    const user = mockUsers[userId] || { name: `Usuário ${userId}`, avatar: `https://ui-avatars.com/api/?name=User+${userId}` };

    chatName.textContent = user.name;
    chatAvatar.src = user.avatar;
}

// CSS Inline para animação de entrada
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: fadeIn 0.3s ease-out forwards;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);