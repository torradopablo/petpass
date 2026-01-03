
// Mock Service for Payment Logic
// Real implementation would use mercadopago/dx-nodejs

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

class PaymentService {
    constructor() {
        // this.mercadopago = ... 
    }

    async createPreference(items, payer, externalReference) {
        // Mock MP request
        // In real app: mercadopago.preferences.create(...)

        const preference = {
            items,
            payer,
            external_reference: externalReference,
            back_urls: {
                success: `${process.env.SITE_URL}/dashboard?status=success`,
                failure: `${process.env.SITE_URL}/dashboard?status=failure`,
                pending: `${process.env.SITE_URL}/dashboard?status=pending`
            },
            auto_return: 'approved'
        };

        // For demo purposes we simulate a preference ID return
        console.log('Creating MP preference:', preference);
        return {
            id: 'mock_preference_id_' + Date.now(),
            init_point: 'https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=...'
        };
    }
}

module.exports = new PaymentService();
