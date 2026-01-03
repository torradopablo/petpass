
// UI Utilities

export const UI = {
    // Sections
    showSection(id) {
        ['pets', 'orders', 'settings'].forEach(section => {
            const el = document.getElementById(`section-${section}`);
            if (section === id) {
                el?.classList.remove('hidden');
            } else {
                el?.classList.add('hidden');
            }
        });
    },

    // Views (Landing vs Dashboard)
    showView(id) {
        ['landing', 'dashboard'].forEach(view => {
            const el = document.getElementById(`view-${view}`);
            if (view === id) {
                el?.classList.remove('hidden');
            } else {
                el?.classList.add('hidden');
            }
        });

        // Toggle Navbar buttons
        const btnLogin = document.getElementById('btn-login');
        const btnLogout = document.getElementById('btn-logout');

        if (id === 'dashboard') {
            btnLogin?.classList.add('hidden');
            btnLogout?.classList.remove('hidden');
        } else {
            btnLogin?.classList.remove('hidden');
            btnLogout?.classList.add('hidden');
        }
    },

    // Modals
    closeModal(id) {
        const el = document.getElementById(id);
        el?.classList.add('opacity-0');
        setTimeout(() => el?.classList.add('hidden'), 300);
    },

    // Notifications
    toast(message, type = 'success') {
        // Create toast element on the fly
        const div = document.createElement('div');
        div.className = `fixed top-4 right-4 z-[70] px-6 py-3 rounded-xl shadow-xl transform transition-all duration-300 translate-y-[-20px] opacity-0 flex items-center gap-3 ${type === 'success' ? 'bg-green-500 text-white' :
                type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'
            }`;
        div.innerHTML = `
            <span class="font-bold">${message}</span>
        `;
        document.body.appendChild(div);

        // Animate in
        requestAnimationFrame(() => {
            div.classList.remove('translate-y-[-20px]', 'opacity-0');
        });

        // Remove after 3s
        setTimeout(() => {
            div.classList.add('translate-y-[-20px]', 'opacity-0');
            setTimeout(() => div.remove(), 300);
        }, 3000);
    },

    // Loading
    setLoading(isLoading, btnId) {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        if (isLoading) {
            btn.dataset.originalText = btn.innerHTML;
            btn.innerHTML = '<div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Procesando...';
            btn.disabled = true;
        } else {
            btn.innerHTML = btn.dataset.originalText || 'Listo';
            btn.disabled = false;
        }
    }
};
