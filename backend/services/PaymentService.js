const { MercadoPagoConfig, Preference, Payment, PreApproval } = require('mercadopago');
const DolarService = require('./DolarService');
const Plans = require('../config/Plans');

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

const token = (process.env.MP_ACCESS_TOKEN || '').trim();
if (token && !token.startsWith('TEST-') && !token.startsWith('APP_USR-')) {
    console.error('CRITICAL: MP_ACCESS_TOKEN has an invalid format. It MUST start with TEST- or APP_USR-.');
}

console.log('MP Config Debug:', {
    hasToken: !!token,
    length: token.length,
    prefix: token.substring(0, 10) + '...',
    siteUrl: process.env.MP_PUBLIC_URL || process.env.SITE_URL
});

class PaymentService {
    async getPreApproval(preApprovalId) {
        const preApproval = new PreApproval(client);
        return await preApproval.get({ id: preApprovalId });
    }

    async getPayment(paymentId) {
        const payment = new Payment(client);
        return await payment.get({ id: paymentId });
    }

    async createSubscriptionPreference(planId, period, userEmail, userId) {
        // ... (this might be unused now but keeping for backward compatibility)
        const preference = new Preference(client);
        const planKey = planId.toUpperCase();
        const plan = Plans[planKey];
        const priceUsd = plan.priceUSD[period];
        const priceArs = await DolarService.convertUsdToArs(priceUsd);
        const title = `Suscripción PetPass ${plan.name} (${period === 'monthly' ? 'Mensual' : 'Anual'})`;

        const response = await preference.create({
            body: {
                items: [{ title: title, unit_price: priceArs, quantity: 1, currency_id: 'ARS' }],
                payer: { email: userEmail },
                external_reference: `sub_${planId}_${period}_${userId}`,
                back_urls: {
                    success: `${process.env.SITE_URL || 'http://localhost:3000'}/index.html?status=success`,
                    failure: `${process.env.SITE_URL || 'http://localhost:3000'}/index.html?status=failure`,
                    pending: `${process.env.SITE_URL || 'http://localhost:3000'}/index.html?status=pending`
                },
                auto_return: 'approved'
            }
        });
        return { id: response.id, init_point: response.init_point };
    }

    async createRecurringPreference(planId, period, userEmail, userId) {
        console.log(`Creating recurring preference for ${planId} (${period}) for user ${userId}`);
        const preApproval = new PreApproval(client);

        const planKey = planId.toUpperCase();
        const plan = Plans[planKey];
        if (!plan) throw new Error('Invalid plan');

        const priceUsd = plan.priceUSD[period];
        const priceArs = await DolarService.convertUsdToArs(priceUsd);

        const title = `Suscripcion PetPass ${plan.name} (${period === 'monthly' ? 'Mensual' : 'Anual'})`;

        let siteUrl = process.env.MP_PUBLIC_URL || process.env.SITE_URL || 'http://localhost:3001';
        if (!siteUrl.startsWith('http')) {
            siteUrl = 'http://' + siteUrl;
        }

        // For Mercado Pago test mode, we need a valid public URL
        // If still using localhost, use a fallback public URL
        if (siteUrl.includes('localhost')) {
            console.warn('Using fallback URL for Mercado Pago test mode');
            siteUrl = 'https://petpass.vercel.app'; // Replace with your actual domain in production
        }

        const body = {
            reason: title,
            external_reference: `sub_${planId}_${period}_${userId}`,
            payer_email: userEmail,
            auto_recurring: {
                frequency: 1,
                frequency_type: 'months',
                transaction_amount: priceArs,
                currency_id: 'ARS'
            },
            back_url: `${siteUrl}/index.html?status=success`,
            notification_url: `${siteUrl}/api/webhooks`,
            status: 'pending'
        };

        if (period === 'annual') {
            body.auto_recurring.frequency = 12;
        }

        try {
            console.log('Sending body to MP PreApproval:', JSON.stringify(body, null, 2));
            const response = await preApproval.create({ body });
            console.log('MP PreApproval Response Success');
            return {
                id: response.id,
                init_point: response.init_point,
            };
        } catch (error) {
            console.error('MP PreApproval FULL ERROR:', error);
            // If it's a FetchError, it might be a connectivity or auth (401) issue leading to non-JSON
            if (error.name === 'FetchError') {
                console.error('Network or Auth Error: Check if MP_ACCESS_TOKEN is correct and has no whitespace.');
            }
            if (error.apiResponse) {
                try {
                    console.error('MP API Response Error:', JSON.stringify(error.apiResponse.getErrors(), null, 2));
                } catch (e) {
                    console.error('Could not parse MP API Error Response');
                }
            }
            throw error;
        }
    }

    async cancelSubscription(preApprovalId) {
        const preApproval = new PreApproval(client);
        return await preApproval.update({
            id: preApprovalId,
            body: { status: 'cancelled' }
        });
    }

    async createPreference(items, payer, externalReference) {
        const preference = new Preference(client);
        const response = await preference.create({
            body: {
                items: items,
                payer: { email: payer.email },
                external_reference: externalReference,
                back_urls: {
                    success: `${process.env.SITE_URL || 'http://localhost:3000'}/index.html?status=success`,
                    failure: `${process.env.SITE_URL || 'http://localhost:3000'}/index.html?status=failure`,
                    pending: `${process.env.SITE_URL || 'http://localhost:3000'}/index.html?status=pending`
                },
                auto_return: 'approved'
            }
        });
        return { id: response.id, init_point: response.init_point };
    }
}

module.exports = new PaymentService();
