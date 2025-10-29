const API_HOME_URL = '/api/v1/home'; 

// --- ELEMENTOS DO DOM ---
const loadingSpinner = document.getElementById('loading-spinner');
const dynamicContent = document.getElementById('dynamic-content');
const welcomeName = document.getElementById('welcome-name');
const userAvatarNav = document.getElementById('user-avatar-nav');
const userGamification = document.getElementById('user-gamification');
const logoutButton = document.getElementById('logout-button');

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '../login/login.html';
        return;
    }
    
    fetchHomeData(token);
});

// --- LÓGICA DE AUTENTICAÇÃO (LOGOUT) ---

function handleLogout() {
    localStorage.removeItem('authToken');
    window.location.href = '../login/login.html';
}

// --- LÓGICA DE DADOS DA HOME ---

async function fetchHomeData(token) {
    if (loadingSpinner) loadingSpinner.classList.remove('hidden');
    if (dynamicContent) {
        dynamicContent.classList.add('hidden');
        dynamicContent.innerHTML = ''; 
    }

    try {
        const response = await fetch(API_HOME_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            handleLogout(); 
            return;
        }

        if (!response.ok) {
            throw new Error(`Erro ao buscar dados: ${response.statusText}`);
        }

        const data = await response.json();
        renderHomePage(data);

    } catch (error) {
        console.error('Erro ao carregar dados da home:', error);
        if (loadingSpinner) {
            loadingSpinner.innerHTML = `<p class="text-red-600">Não foi possível carregar os dados. Tente recarregar a página.</p>`;
        }
    } finally {
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
        if (dynamicContent) dynamicContent.classList.remove('hidden');
    }
}

// --- FUNÇÕES DE RENDERIZAÇÃO ---

function renderHomePage(data) {
    const user = data.usuario;
    if (welcomeName) {
        welcomeName.textContent = `Boas-vindas, ${user.nome}!`;
    }
    if (userAvatarNav) {
        userAvatarNav.src = user.avatar_url;
        userAvatarNav.onerror = () => { userAvatarNav.src = 'https://placehold.co/40x40/f97316/white?text=A' }; // Fallback
    }
    
    if (userGamification) {
        userGamification.innerHTML = `
            <div class="mt-2 flex items-center text-sm text-gray-500">
                <svg class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15.4-3.4 3.9 3.9c.1.1.1.1 0 .2l-6.1 6.1c-.1.1-.1.2-.2.2l-3.9 1.4c-.1.0-.2.0-.2-.1l-1.4-3.9c-.1-.1-.1-.1 0-.2l6.1-6.1c.1-.1.2-.1.2 0Z"/><path d="m21.4 2.6-7.9 7.9-1.4 1.4-1.4 1.4L2.6 21.4c-1.7-1.7-1.7-4.6 0-6.3l11.1-11.1c1.8-1.7 4.6-1.7 6.3 0Z"/></svg>
                ${user.nivel}
            </div>
            <div class="mt-2 flex items-center text-sm text-gray-500">
                <svg class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v4h10v-4M8 14v7h8v-7"/><path d="M12 22v-3.13"/><path d="m10 14 1 3"/><path d="m14 14-1 3"/><path d="M12 14v-3.13"/><path d="m10 11 1 3"/><path d="m14 11-1 3"/><path d="M12 2v3.13"/><path d="m10 5 1-3"/><path d="m14 5-1-3"/><path d="m12 8 1.4-4 1.4 4"/><path d="m12 8-1.4-4-1.4 4"/></svg>
                ${user.pontos_gamificacao} pontos
            </div>
        `;
    }

    if (dynamicContent) {
        data.secoes.forEach(secao => {
            let secaoHtml = `<section id="${secao.id_secao}">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">${secao.titulo}</h2>
                <div class="content-wrapper">`;
            
            switch(secao.tipo_visualizacao) {
                case 'lista_mapa':
                    secaoHtml += renderLista(secao.itens);
                    break;
                case 'carrossel':
                    secaoHtml += renderCarrossel(secao.itens);
                    break;
                case 'avatar_lista_horizontal':
                    secaoHtml += renderAvatarLista(secao.itens);
                    break;
                default:
                    secaoHtml += `<p>Tipo de visualização '${secao.tipo_visualizacao}' não implementado.</p>`;
            }

            secaoHtml += `</div></section>`;
            dynamicContent.insertAdjacentHTML('beforeend', secaoHtml);
        });
    }
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}


function renderLista(itens) {
    if (itens.length === 0) return '<p class="text-gray-500">Nenhum chamado urgente na sua área.</p>';

    let html = '<ul role="list" class="divide-y divide-gray-200 bg-white shadow overflow-hidden rounded-md">';
    itens.forEach(item => {
        const prioridadeClasses = item.prioridade === 'alta' 
            ? 'bg-red-100 text-red-800' 
            : 'bg-yellow-100 text-yellow-800';
        
        html += `
            <li class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
                <div class="flex min-w-0 gap-x-4">
                    <img class="h-12 w-12 flex-none rounded-lg bg-gray-50 object-cover" src="${item.imagem_url}" 
                         onerror="this.src='https://placehold.co/48x48/f97316/white?text=${item.especie.charAt(0)}'" alt="">
                    <div class="min-w-0 flex-auto">
                        <p class="text-sm font-semibold leading-6 text-gray-900">
                            <a href="#" class="hover:underline">${item.titulo}</a>
                        </p>
                        <p class="mt-1 flex text-xs leading-5 text-gray-500">
                            <svg class="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            ${item.localizacao_aprox} (${item.distancia_km}km)
                        </p>
                    </div>
                </div>
                <div class="flex shrink-0 items-center gap-x-4">
                    <div class="hidden sm:flex sm:flex-col sm:items-end">
                        <p class="text-sm leading-6 text-gray-900">${item.especie}</p>
                        <span class="${prioridadeClasses} inline-flex items-center rounded-md px-2 py-1 text-xs font-medium">
                            Prioridade ${item.prioridade}
                        </span>
                    </div>
                    <svg class="h-5 w-5 flex-none text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
            </li>
        `;
    });
    html += '</ul>';
    return html;
}

function renderCarrossel(itens) {
    if (itens.length === 0) return '<p class="text-gray-500">Você não possui resgates em andamento.</p>';
    
    let html = '<div class="flex overflow-x-auto gap-6 pb-4 no-scrollbar">';
    itens.forEach(item => {
        html += `
            <div class="w-80 flex-shrink-0 bg-white rounded-lg shadow overflow-hidden">
                <img class="h-40 w-full object-cover" src="${item.imagem_url}" 
                     onerror="this.src='https://placehold.co/320x160/f97316/white?text=Resgate'">
                <div class="p-4">
                    <h3 class="text-base font-semibold text-gray-900">${item.titulo}</h3>
                    <p class="text-sm text-gray-500 mt-1">${item.proxima_acao}</p>
                    <div class="mt-4">
                        <div class="flex justify-between text-sm font-medium text-gray-600 mb-1">
                            <span>Status: ${item.status.replace(/_/g, ' ')}</span>
                            <span>${item.progresso_percentual}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div class="bg-orange-600 h-2.5 rounded-full" style="width: ${item.progresso_percentual}%"></div>
                        </div>
                    </div>
                </div>
                <div class="border-t border-gray-200 px-4 py-3">
                    <a href="#" class="text-sm font-semibold text-orange-600 hover:text-orange-500">Ver detalhes do caso</a>
                </div>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

function renderAvatarLista(itens) {
    if (itens.length === 0) return '<p class="text-gray-500">Nenhum destaque esta semana.</p>';

    let html = '<div class="flex overflow-x-auto gap-8 pb-4 no-scrollbar">';
    itens.forEach(item => {
        html += `
            <div class="flex flex-col items-center w-32 flex-shrink-0">
                <img class="h-20 w-20 rounded-full object-cover ring-2 ring-orange-200" src="${item.avatar_url}" 
                     onerror="this.src='https://placehold.co/80x80/f97316/white?text=${item.nome.charAt(0)}'">
                <h4 class="mt-2 text-sm font-semibold text-gray-900 truncate w-full text-center">${item.nome}</h4>
                <p class="text-xs text-gray-500 text-center">${item.descricao}</p>
            </div>
        `;
    });
    html += '</div>';
    return html;
}
