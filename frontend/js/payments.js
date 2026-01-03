
import { Auth } from './auth.js';
import { UI } from './ui.js';

export const Payments = {
    mp: null,

    async init() {
        const key = window.env?.MP_PUBLIC_KEY;
        if (!key) {
            console.error('MP_PUBLIC_KEY not found in window.env');
            throw new Error('Configuración de pago incompleta');
        }
        if (!window.MercadoPago) {
            console.error('Mercado Pago SDK not loaded');
            throw new Error('Error al cargar Mercado Pago');
        }
        this.mp = new window.MercadoPago(key);
    },

    async createPreference(orderData) {
        // Call Backend to create preference
        try {
            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Auth.session?.access_token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();
            if (!response.ok) {
                const error = new Error(data.message || 'Error creating payment preference');
                error.details = data;
                throw error;
            }
            return data;
        } catch (error) {
            console.error(error);
            UI.toast('Error iniciando pago', 'error');
            throw error;
        }
    },

    async checkout(preferenceId) {
        if (!this.mp) await this.init();

        this.mp.checkout({
            preference: {
                id: preferenceId
            },
            autoOpen: true, // Open modal
        });
    },

    async subscribe(plan, period = 'monthly') {
        const title = `Suscripción PetPass ${plan.charAt(0).toUpperCase() + plan.slice(1)} (${period === 'monthly' ? 'Mensual' : 'Anual'})`;

        try {
            UI.toast('Preparando pago...', 'info');

            // Defensive check for user session
            if (!Auth.user && !Auth.session?.user) {
                console.warn('Auth user is null, attempting to re-init...');
                await Auth.init();
            }

            const user = Auth.user || Auth.session?.user;
            if (!user) {
                throw new Error('Debes iniciar sesión para suscribirte');
            }

            const orderData = {
                plan: plan,
                period: period,
                title: title,
                payer: {
                    email: user.email
                }
            };

            console.log('Subscribe initiating...', orderData);
            const data = await this.createPreference(orderData);
            console.log('Preference data received:', data);

            if (data.init_point) {
                console.log('Redirecting to MP:', data.init_point);
                window.location.href = data.init_point;
            } else if (data.id) {
                console.log('Opening MP checkout modal for ID:', data.id);
                await this.checkout(data.id);
            } else {
                throw new Error('No se recibió ID ni init_point de Mercado Pago');
            }

        } catch (error) {
            console.error('Subscription Error Details:', error);
            const msg = error.message || 'Error al procesar suscripción';
            UI.toast(msg, 'error');
        }
    },

    async cancelSubscription() {
        try {
            UI.toast('Cancelando suscripción...', 'info');
            const response = await fetch('/api/payments', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${Auth.session?.access_token}`
                }
            });

            if (!response.ok) throw new Error('Error al cancelar');

            UI.toast('Suscripción cancelada correctamente');
            // Reload page or update UI
            setTimeout(() => location.reload(), 1500);
        } catch (error) {
            console.error(error);
            UI.toast('Error al cancelar suscripción', 'error');
        }
    }
};
