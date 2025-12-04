console.log(">>> CHAT LIST CARREGADO <<<");

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '../login/login.html';
        return;
    }

    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            window.location.href = '../login/login.html';
        });
    }
});