// --- VERSÃO ATUALIZADA (Botão "Ver no mapa" corrigido) ---
console.log(">>> HOME.JS CARREGADO <<<");

// --- CONSTANTES ---
const API_HOME_URL = '/api/v1/home'; 

// --- ELEMENTOS DO DOM ---
const loadingSpinner = document.getElementById('loading-spinner');
const dynamicContent = document.getElementById('dynamic-content');
const welcomeName = document.getElementById('welcome-name');
const userAvatarHeader = document.getElementById('user-avatar-header');
const logoutButton = document.getElementById('logout-button');

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);

    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '../login/login.html';
        return;
    }
    
    fetchHomeData(token);
});

function handleLogout() {
    localStorage.removeItem('authToken');
    window.location.href = '../login/login.html';
}

// --- BUSCA DE DADOS ---
async function fetchHomeData(token) {
    if (loadingSpinner) loadingSpinner.classList.remove('hidden');
    if (dynamicContent) dynamicContent.classList.add('hidden');

    try {
        const response = await fetch(API_HOME_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
            handleLogout();
            return;
        }

        if (!response.ok) throw new Error('Falha na API');

        const data = await response.json();
        console.log("Dados recebidos:", data); 
        renderHomePage(data);

    } catch (error) {
        console.error('Erro na busca:', error);
        if (loadingSpinner) {
            loadingSpinner.innerHTML = `
                <div class="text-center text-red-500 flex flex-col items-center gap-2">
                    <i data-lucide="wifi-off" class="h-8 w-8"></i>
                    <p>Erro ao carregar dados.</p>
                    <button onclick="location.reload()" class="mt-2 underline font-bold">Tentar novamente</button>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
        }
    } finally {
        if (loadingSpinner && !loadingSpinner.innerHTML.includes('Erro')) {
            loadingSpinner.classList.add('hidden');
        }
        if (dynamicContent && !loadingSpinner.innerHTML.includes('Erro')) {
            dynamicContent.classList.remove('hidden');
        }
    }
}

// --- RENDERIZAÇÃO PRINCIPAL ---
function renderHomePage(data) {
    if (data.usuario) {
        const primeiroNome = data.usuario.nome ? data.usuario.nome.split(' ')[0] : 'Usuário';
        if (welcomeName) welcomeName.textContent = primeiroNome; 
        
        let avatarUrl = data.usuario.avatar_url;
        if (!avatarUrl || avatarUrl.includes("dicebear")) {
            avatarUrl = `https://ui-avatars.com/api/?name=${primeiroNome}&background=FACD19&color=fff&size=128`;
        }
        if (userAvatarHeader) userAvatarHeader.src = avatarUrl;
    }

    if (dynamicContent && data.secoes) {
        dynamicContent.innerHTML = '';
        
        data.secoes.forEach(secao => {
            let html = '';
            if (secao.tipo_visualizacao === 'carrossel') {
                html = renderSectionCarrossel(secao);
            } else if (secao.tipo_visualizacao === 'lista_mapa') {
                html = renderSectionLista(secao);
            }
            dynamicContent.insertAdjacentHTML('beforeend', html);
        });
    }

    if (window.lucide) {
        lucide.createIcons();
    }
}

function getTagsFromItem(item) {
    if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) {
        return item.tags;
    }
    const tagsGeradas = [];
    if (item.urgencia) {
        let tipo = 'info';
        if (['Alta', 'Muito Urgente'].includes(item.urgencia)) tipo = 'urgente';
        else if (item.urgencia === 'Média') tipo = 'alerta';
        tagsGeradas.push({ texto: item.urgencia, tipo: tipo });
    }
    if (item.status && item.status !== 'Aberto') {
        tagsGeradas.push({ texto: item.status, tipo: 'info' });
    }
    return tagsGeradas;
}

function renderTagsHTML(tags) {
    if (!tags || tags.length === 0) return '';
    return tags.map(tag => {
        let classes = 'bg-gray-100 text-gray-600';
        let icon = '';
        if (tag.tipo === 'urgente') {
            classes = 'bg-red-100 text-red-600';
            icon = '<i data-lucide="triangle-alert" class="h-3 w-3"></i>';
        } else if (tag.tipo === 'info') {
            classes = 'bg-blue-100 text-blue-600';
            icon = '<i data-lucide="paw-print" class="h-3 w-3"></i>';
        } else if (tag.tipo === 'alerta') {
            classes = 'bg-orange-100 text-orange-600';
            icon = '<i data-lucide="info" class="h-3 w-3"></i>';
        }
        return `
            <span class="${classes} text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                ${icon} ${tag.texto}
            </span>
        `;
    }).join('');
}

function renderSectionCarrossel(secao) {
    if (!secao.itens || secao.itens.length === 0) return '';

    const cardsHtml = secao.itens.map(item => {
        const tags = getTagsFromItem(item);
        // Link para o mapa também no carrossel, se tiver coordenadas
        let linkMapa = '';
        if (item.lat && item.lng) {
            linkMapa = `
                <a href="../map/map.html?lat=${item.lat}&lng=${item.lng}" class="flex items-center text-gray-500 text-xs mt-2 font-medium hover:text-brand-yellow transition-colors">
                    <i data-lucide="map-pin" class="h-3 w-3 mr-1 text-brand-yellow"></i>
                    <span class="truncate underline">${item.localizacao || 'Ver no mapa'}</span>
                </a>
            `;
        } else {
            linkMapa = `
                <div class="flex items-center text-gray-500 text-xs mt-2 font-medium">
                    <i data-lucide="map-pin" class="h-3 w-3 mr-1"></i>
                    <span class="truncate">${item.localizacao || 'Local desconhecido'}</span>
                </div>
            `;
        }

        return `
        <div class="flex-shrink-0 w-64 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm snap-center">
            <div class="relative h-48">
                <img src="${item.imagem_url}" class="w-full h-full object-cover" alt="${item.titulo}" onerror="this.src='https://placehold.co/400x300?text=Sem+Foto'">
                <button class="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:scale-110 transition-transform">
                    <i data-lucide="bookmark" class="h-5 w-5 ${item.is_favorito ? 'text-brand-yellow fill-current' : 'text-gray-400'}"></i>
                </button>
            </div>
            <div class="p-3">
                <h3 class="text-lg font-bold text-red-600 truncate">${item.titulo}</h3>
                <div class="flex gap-2 mt-2 mb-2 flex-wrap">
                    ${renderTagsHTML(tags)}
                </div>
                ${linkMapa}
            </div>
        </div>
    `}).join('');

    return `
        <section class="px-6">
            <div class="flex items-center gap-2 mb-4">
                <i data-lucide="${secao.icone || 'alert-circle'}" class="h-6 w-6 text-black fill-current"></i>
                <h2 class="text-xl font-bold text-black">${secao.titulo}</h2>
            </div>
            <div class="flex overflow-x-auto gap-4 scrollbar-hide pb-4 -mx-6 px-6 snap-x snap-mandatory">
                ${cardsHtml}
            </div>
        </section>
    `;
}

// --- CORREÇÃO PRINCIPAL AQUI (Lista Vertical) ---
function renderSectionLista(secao) {
    if (!secao.itens || secao.itens.length === 0) return '';

    const cardsHtml = secao.itens.map(item => {
        const tags = getTagsFromItem(item);
        
        let locationHtml = '';
        
        // Prioridade 1: Mostrar distância se disponível
        if (item.distancia_km !== undefined && item.distancia_km > 0) {
            locationHtml = `${item.distancia_km} km de você`;
        } 
        // Prioridade 2: Se tiver coordenadas, mostra link "Ver no mapa"
        else if (item.lat && item.lng) {
            locationHtml = `<a href="../map/map.html?lat=${item.lat}&lng=${item.lng}" class="text-brand-yellow hover:underline cursor-pointer font-bold relative z-10">Ver no mapa</a>`;
        } 
        // Prioridade 3: Fallback
        else {
            locationHtml = 'Distância desconhecida';
        }

        return `
        <div class="flex bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm h-32 hover:border-brand-yellow/50 transition-colors relative">
            <div class="w-32 flex-shrink-0 relative">
                <img src="${item.imagem_url}" class="w-full h-full object-cover" alt="${item.titulo}" onerror="this.src='https://placehold.co/300x300?text=Sem+Foto'">
                <div class="absolute top-1 right-1">
                     ${item.is_favorito ? '<i data-lucide="bookmark" class="h-4 w-4 text-white fill-current drop-shadow-md"></i>' : ''}
                </div>
            </div>
            <div class="flex-grow p-3 flex flex-col justify-between">
                <div>
                    <h3 class="text-base font-bold text-black leading-tight line-clamp-1">${item.titulo}</h3>
                    <div class="flex flex-wrap gap-1 mt-1">
                        ${renderTagsHTML(tags)}
                    </div>
                    <p class="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        ${item.descricao || item.localizacao || ''}
                    </p>
                </div>
                <div class="flex items-center text-gray-900 text-xs font-bold">
                    <i data-lucide="map-pin" class="h-3 w-3 mr-1 text-brand-yellow"></i>
                    ${locationHtml}
                </div>
            </div>
        </div>
    `}).join('');

    return `
        <section class="px-6">
            <div class="flex items-center gap-2 mb-4">
                <i data-lucide="${secao.icone || 'target'}" class="h-6 w-6 text-black"></i>
                <h2 class="text-xl font-bold text-black">${secao.titulo}</h2>
            </div>
            <div class="flex flex-col gap-4">
                ${cardsHtml}
            </div>
        </section>
    `;
}