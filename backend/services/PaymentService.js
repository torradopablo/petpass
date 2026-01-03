const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

class PaymentService {
    async createPreference(items, payer, externalReference) {
        const preference = new Preference(client);

        const response = await preference.create({
            body: {
                items: items,
                payer: {
                    email: payer.email
                },
                external_reference: externalReference,
                back_urls: {
                    success: `${process.env.SITE_URL || 'http://localhost:3000'}/frontend/index.html?status=success`,
                    failure: `${process.env.SITE_URL || 'http://localhost:3000'}/frontend/index.html?status=failure`,
                    pending: `${process.env.SITE_URL || 'http://localhost:3000'}/frontend/index.html?status=pending`
                },
                auto_return: 'approved',
                notification_url: `${process.env.SITE_URL || 'https://tu-dominio.vercel.app'}/api/webhooks`
            }
        });

        return {
            id: response.id,
            init_point: response.init_point,
            sandbox_init_point: response.sandbox_init_point
        };
    }
}

module.exports = new PaymentService();
