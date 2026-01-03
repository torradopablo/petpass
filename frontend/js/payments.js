
import { loadMercadoPago } from "https://sdk.mercadopago.com/js/v2";
import { Auth } from './auth.js';
import { UI } from './ui.js';

// NOTE: MP_PUBLIC_KEY placeholder
const MP_PUBLIC_KEY = window.env?.MP_PUBLIC_KEY;

export const Payments = {
    mp: null,

    async init() {
        await loadMercadoPago();
        this.mp = new window.MercadoPago(MP_PUBLIC_KEY);
    },

    async createPreference(orderData) {
        // Call Backend to create preference
        try {
            const response = await fetch('/api/payments/create-preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Auth.session?.access_token}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) throw new Error('Error creating payment preference');

            const { id } = await response.json();
            return id;
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

    async subscribe(plan) {
        const prices = {
            'basic': 4999,
            'premium': 9999
        };
        const title = `Suscripción PetPass ${plan.charAt(0).toUpperCase() + plan.slice(1)}`;

        // Create Preference for Subscription (Mocking as one-time for prototype)
        try {
            const orderData = {
                items: [{
                    title: title,
                    unit_price: prices[plan],
                    quantity: 1,
                    currency_id: 'ARS'
                }],
                payer: {
                    email: Auth.user.email
                },
                external_reference: `sub_${plan}_${Auth.user.id}` // To track in webhook
            };

            const preferenceId = await this.createPreference(orderData);
            await this.checkout(preferenceId);

        } catch (error) {
            console.error(error);
            UI.toast('Error al procesar suscripción', 'error');
        }
    }
};
