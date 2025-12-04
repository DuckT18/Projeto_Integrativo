console.log(">>> MAP.JS (V2) CARREGADO <<<");

// --- CONSTANTES ---
const API_HOME_URL = '/api/v1/home'; 

let map;

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa o mapa
    initMap();

    // 2. Verifica autenticação
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '../login/login.html';
        return;
    }

    // 3. Busca dados
    fetchCasesAndPlot(token);
    
    // Logout
    const logoutBtn = document.getElementById('logout-button');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            window.location.href = '../login/login.html';
        });
    }
});

function initMap() {
    if (typeof L === 'undefined') {
        console.error("Leaflet não carregou.");
        return;
    }

    // --- LEITURA DA URL ---
    const params = new URLSearchParams(window.location.search);
    const paramLat = params.get('lat');
    const paramLng = params.get('lng');
    
    console.log("Parâmetros da URL:", window.location.search);
    console.log("Lat capturada:", paramLat, "Lng capturada:", paramLng);

    // Configuração Padrão (São Paulo Geral)
    let initialView = [-23.5505, -46.6333];
    let initialZoom = 13;

    // Se tiver coordenadas válidas na URL, substitui a visão inicial
    let hasTarget = false;
    if (paramLat && paramLng && !isNaN(paramLat) && !isNaN(paramLng)) {
        initialView = [parseFloat(paramLat), parseFloat(paramLng)];
        initialZoom = 18; // Zoom bem próximo
        hasTarget = true;
        console.log("Definindo visão inicial focada em:", initialView);
    }

    // Inicializa o mapa
    map = L.map('map', {
        zoomControl: false 
    }).setView(initialView, initialZoom);

    // Adiciona o desenho do mapa
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Reforço: Se tiver alvo, força a ida da câmera após um breve delay
    // (Ajuda se o mapa demorar para renderizar o container)
    if (hasTarget) {
        setTimeout(() => {
            map.invalidateSize(); // Garante que o mapa sabe o tamanho da tela
            map.flyTo(initialView, initialZoom, { animate: false });
        }, 500);
    }
}

async function fetchCasesAndPlot(token) {
    try {
        const response = await fetch(API_HOME_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Falha ao buscar dados');
        const data = await response.json();

        // Ícone Laranja
        const customIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        // Verifica coordenadas da URL para abrir o popup automaticamente
        const params = new URLSearchParams(window.location.search);
        const targetLat = params.get('lat') ? parseFloat(params.get('lat')) : null;
        const targetLng = params.get('lng') ? parseFloat(params.get('lng')) : null;

        if (data.secoes) {
            data.secoes.forEach(secao => {
                if (secao.itens) {
                    secao.itens.forEach(item => {
                        if (item.lat && item.lng) {
                            const marker = addMarker(item, customIcon);
                            
                            // Comparação com tolerância para float
                            if (targetLat && targetLng) {
                                const diffLat = Math.abs(item.lat - targetLat);
                                const diffLng = Math.abs(item.lng - targetLng);
                                
                                // Se a diferença for minúscula (< 0.0001), é o mesmo ponto
                                if (diffLat < 0.0001 && diffLng < 0.0001) {
                                    console.log("Encontrei o caso alvo! Abrindo popup...");
                                    setTimeout(() => marker.openPopup(), 800);
                                }
                            }
                        }
                    });
                }
            });
        }

    } catch (error) {
        console.error("Erro no mapa:", error);
    }
}

function addMarker(item, icon) {
    const popupContent = `
        <div class="text-center min-w-[160px] p-1">
            <div class="relative h-24 w-full mb-2 overflow-hidden rounded-lg">
                <img src="${item.imagem_url}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/150'">
                <div class="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FACD19" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                </div>
            </div>
            <h3 class="font-bold text-sm text-gray-900 leading-tight mb-1">${item.titulo}</h3>
            <p class="text-[10px] text-gray-500 mb-2 flex items-center justify-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                ${item.localizacao || 'Sem endereço'}
            </p>
            <button class="bg-brand-yellow text-white text-xs py-1.5 rounded-lg font-bold w-full shadow-sm hover:bg-yellow-500 transition-colors">
                Ver Caso
            </button>
        </div>
    `;

    const marker = L.marker([item.lat, item.lng], { icon: icon })
        .addTo(map)
        .bindPopup(popupContent);
    
    return marker;
}