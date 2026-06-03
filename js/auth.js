import { createRoom, joinRoom, getRoom } from './api.js';
import { login, register } from './api.js';
let isLoginMode = true;
document.getElementById('tab-login').addEventListener('click', () => switchTab('login'));
document.getElementById('tab-register').addEventListener('click', () => switchTab('register'));

function switchTab(mode) {
    isLoginMode = mode === 'login';
    document.getElementById('tab-login').classList.toggle('active', isLoginMode);
    document.getElementById('tab-register').classList.toggle('active', !isLoginMode);
    document.getElementById('submit-btn').innerText = isLoginMode ? 'Login' : 'Register';
    document.getElementById('error-message').style.display = 'none';
}

document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const handle = document.getElementById('handle').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('error-message');
    
    try {
        let response;
        if (isLoginMode) {
            response = await api.login(handle, password);
        } else {
            response = await api.register(handle, password);
        }

        if (response.error) {
            errorEl.innerText = response.error;
            errorEl.style.display = 'block';
            return;
        }

        // The most critical part: Saving the security token!
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('handle', response.handle);

        // Redirect to the new dashboard
        window.location.href = 'dashboard.html';

    } catch (error) {
        errorEl.innerText = 'Failed to connect to the server.';
        errorEl.style.display = 'block';
    }
});