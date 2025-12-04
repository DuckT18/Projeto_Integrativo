console.log(">>> CREATE-CASE.JS CARREGADO <<<");

const API_CREATE_CASE_URL = '/v1/casos'; 

// --- ELEMENTOS ---
const form = document.getElementById('create-case-form');
const btnGps = document.getElementById('btn-gps');
const btnOpenMap = document.getElementById('btn-open-map');
const gpsStatus = document.getElementById('gps-status');
const inputLat = document.getElementById('lat');
const inputLng = document.getElementById('lng');
const inputLocalizacao = document.getElementById('localizacao');
const uploadArea = document.getElementById('image-upload-area');
const previewImage = document.getElementById('preview-image');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const logoutBtn = document.getElementById('logout-button');

// Modal
const mapModal = document.getElementById('map-modal');
const closeMapModal = document.getElementById('close-map-modal');
const confirmLocationBtn = document.getElementById('confirm-location-btn');
let pickerMap = null;

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '../login/login.html';
        return;
    }

    if(btnGps) btnGps.addEventListener('click', getUserLocation);
    if(btnOpenMap) btnOpenMap.addEventListener('click', openMapModal);
    if(closeMapModal) closeMapModal.addEventListener('click', closeMapModalFn);
    if(confirmLocationBtn) confirmLocationBtn.addEventListener('click', confirmMapLocation);
    
    if(form) form.addEventListener('submit', handleCreateCase);
    if(uploadArea) uploadArea.addEventListener('click', handleMockImageUpload);
    
    if(logoutBtn) logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = '../login/login.html';
    });
});

// --- LÓGICA DO MAPA (Mantida) ---
function openMapModal() {
    mapModal.classList.remove('hidden');
    setTimeout(() => initPickerMap(), 100);
}

function closeMapModalFn() {
    mapModal.classList.add('hidden');
}

function initPickerMap() {
    if (pickerMap) {
        pickerMap.invalidateSize(); 
        return;
    }
    let initialLat = parseFloat(inputLat.value) || -23.5505;
    let initialLng = parseFloat(inputLng.value) || -46.6333;

    pickerMap = L.map('picker-map', { zoomControl: false }).setView([initialLat, initialLng], 15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(pickerMap);
}

// --- CONFIRMAR LOCALIZAÇÃO DO MAPA ---
function confirmMapLocation() {
    if (!pickerMap) return;
    const center = pickerMap.getCenter();
    const lat = center.lat.toFixed(6);
    const lng = center.lng.toFixed(6);

    inputLat.value = lat;
    inputLng.value = lng;
    updateGpsStatus(`Selecionado no mapa (${lat}, ${lng})`);
    
    // Busca o endereço real baseado no pino do mapa
    fetchAddress(lat, lng);

    closeMapModalFn();
}

// --- GEOLOCALIZAÇÃO AUTOMÁTICA ---
function getUserLocation() {
    if (!navigator.geolocation) {
        alert("Geolocalização não suportada.");
        return;
    }
    btnGps.innerHTML = '<div class="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>';
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            inputLat.value = lat;
            inputLng.value = lng;
            updateGpsStatus("Localização atual capturada");
            
            // Busca o endereço real baseado no GPS
            fetchAddress(lat, lng);

            btnGps.innerHTML = '<i data-lucide="crosshair" class="h-5 w-5"></i>';
            btnGps.classList.add('text-green-600', 'bg-green-100', 'border-green-200');
            lucide.createIcons();
        },
        (error) => {
            console.error("Erro GPS:", error);
            alert("Erro ao obter localização.");
            btnGps.innerHTML = '<i data-lucide="crosshair" class="h-5 w-5"></i>';
            lucide.createIcons();
        }
    );
}

// --- FUNÇÃO DE GEOCODIFICAÇÃO REVERSA (NOVA) ---
// Transforma Lat/Lng em "Rua X, Bairro Y"
async function fetchAddress(lat, lng) {
    // Feedback visual enquanto busca
    const originalPlaceholder = inputLocalizacao.placeholder;
    inputLocalizacao.value = "";
    inputLocalizacao.placeholder = "Buscando endereço...";
    
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        
        if (!response.ok) throw new Error("Falha na busca de endereço");
        
        const data = await response.json();
        
        // Tenta montar um endereço curto e legível
        const addr = data.address;
        let formatted = "";
        
        // Prioriza rua, número e bairro
        if (addr.road || addr.pedestrian) formatted += (addr.road || addr.pedestrian);
        if (addr.house_number) formatted += `, ${addr.house_number}`;
        if (addr.suburb || addr.neighbourhood) formatted += ` - ${addr.suburb || addr.neighbourhood}`;
        
        // Se ficar vazio, usa a cidade
        if (!formatted && (addr.city || addr.town)) formatted = addr.city || addr.town;
        
        // Se ainda vazio, usa o nome completo do Nominatim (pode ser longo)
        if (!formatted) formatted = data.display_name.split(',')[0];

        // Preenche o input
        inputLocalizacao.value = formatted;

    } catch (error) {
        console.error("Erro ao converter endereço:", error);
        // Fallback se a API falhar: preenche com as coordenadas
        inputLocalizacao.value = `Localização (${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)})`;
    } finally {
        inputLocalizacao.placeholder = originalPlaceholder;
    }
}

function updateGpsStatus(msg) {
    gpsStatus.classList.remove('hidden');
    gpsStatus.classList.add('text-green-600');
    gpsStatus.innerHTML = `<i data-lucide="check" class="h-3 w-3 mr-1"></i> ${msg}`;
    if(window.lucide) lucide.createIcons();
}

function handleMockImageUpload() {
    const randomId = Math.floor(Math.random() * 100);
    const mockUrl = `https://loremflickr.com/640/480/animal?lock=${randomId}`;
    previewImage.src = mockUrl;
    previewImage.classList.remove('hidden');
    uploadPlaceholder.classList.add('hidden');
    document.getElementById('imagem_url').value = mockUrl;
}

// --- ENVIO DO FORMULÁRIO ---
async function handleCreateCase(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submit-btn');
    const originalBtnText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> Enviando...';

    const formData = new FormData(form);
    
    // Fallback de coordenadas
    let lat = formData.get('lat');
    let lng = formData.get('lng');

    if (!lat || lat === "") lat = -23.5505;
    if (!lng || lng === "") lng = -46.6333;

    const payload = {
        titulo: formData.get('titulo'),
        descricao: formData.get('descricao'), 
        imagem_url: formData.get('imagem_url'),
        localizacao: formData.get('localizacao'), // Agora vai com o endereço real
        urgencia: formData.get('urgencia'),
        status: "Aberto",
        lat: parseFloat(lat),
        lng: parseFloat(lng)
    };

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(API_CREATE_CASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error("Erro da API:", errData); 

            if (errData.detail) {
                if (Array.isArray(errData.detail)) {
                    const msg = errData.detail.map(e => {
                        const campo = e.loc[e.loc.length - 1]; 
                        return `Campo '${campo}': ${e.msg}`;
                    }).join('\n');
                    throw new Error("Erro nos dados:\n" + msg);
                } else {
                    throw new Error(errData.detail);
                }
            }
            throw new Error(`Erro ${response.status}: Falha ao criar caso`);
        }

        alert('Caso criado com sucesso! Obrigado por ajudar.');
        window.location.href = '../home/home.html';

    } catch (error) {
        console.error(error);
        alert(error.message);
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        if(window.lucide) lucide.createIcons();
    }
}