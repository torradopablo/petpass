
import { Auth } from './auth.js';
import { UI } from './ui.js';
import { Dashboard } from './dashboard.js';
import { Pets } from './pets.js';

// Init App
document.addEventListener('DOMContentLoaded', async () => {

    // Initialize Auth
    await Auth.init();

    // Login Form Handler
    const loginForm = document.getElementById('login-form');
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const btnSubmit = loginForm.querySelector('button[type="submit"]');

        try {
            const btnOriginal = btnSubmit.innerHTML;
            btnSubmit.innerHTML = 'Enviando...';
            btnSubmit.disabled = true;

            await Auth.loginWithEmail(email);

            UI.toast('¡Revisa tu email! Te enviamos el link de acceso.');
            UI.closeModal('modal-login');
        } catch (error) {
            UI.toast(error.message, 'error');
        } finally {
            btnSubmit.innerHTML = btnOriginal;
            btnSubmit.disabled = false;
        }
    });

    // Google Login
    document.getElementById('btn-google')?.addEventListener('click', async () => {
        try {
            await Auth.loginWithGoogle();
        } catch (error) {
            UI.toast('Error iniciando con Google', 'error');
        }
    });

    // Logout
    document.getElementById('btn-logout')?.addEventListener('click', async () => {
        await Auth.signOut();
        UI.toast('Sesión cerrada correctamente');
    });

    // Dashboard Init if user is logged in
    if (Auth.user) {
        Dashboard.init();
        Pets.init();
    }
});
