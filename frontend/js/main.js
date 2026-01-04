import { Auth } from './auth.js';
import { UI } from './ui.js';
import { Dashboard } from './dashboard.js';
import { Pets } from './pets.js';
import { Settings } from './settings.js';

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

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Ensure we're on the landing view
                UI.showView('landing');
                
                // Smooth scroll to the section
                setTimeout(() => {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        });
    });

    // Address blur listener to update map
    document.getElementById('setting-address')?.addEventListener('blur', async (e) => {
        const addr = e.target.value;
        if (addr) {
            const coords = await Pets.geocode(addr);
            if (coords) {
                Settings.setCoords(coords.lat, coords.lon);
            }
        }
    });
});

// Global helpers
window.UI = UI;
window.showSection = (id) => {
    UI.showSection(id);
    if (id === 'settings') {
        Settings.initMap();
    }
};
window.showView = UI.showView;

window.saveProfile = async function () {
    const phone = document.getElementById('setting-phone').value;
    const address = document.getElementById('setting-address').value;
    const btn = document.getElementById('btn-save-profile');

    try {
        btn.disabled = true;
        btn.textContent = 'Guardando...';

        const updates = {
            phone,
            address,
            latitude: Settings.coords.lat,
            longitude: Settings.coords.lng
        };

        await Auth.updateProfile(updates);
        UI.toast('Perfil actualizado correctamente');
    } catch (error) {
        console.error('Error saving profile:', error);
        UI.toast('Error al guardar el perfil', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Guardar Cambios';
    }
};
