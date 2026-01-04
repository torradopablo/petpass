const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Plans = require('../config/Plans');

class PaymentService {
    async createCheckoutSession(planId, period, userEmail, userId) {
        const planKey = planId.toUpperCase();
        const plan = Plans[planKey];
        if (!plan) throw new Error('Invalid plan');

        const priceUsd = plan.priceUSD[period];
        const title = `Suscripción PetPass ${plan.name} (${period === 'monthly' ? 'Mensual' : 'Anual'})`;

        let siteUrl = process.env.SITE_URL || 'http://localhost:3001';
        if (!siteUrl.startsWith('http')) {
            siteUrl = 'http://' + siteUrl;
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: title,
                        },
                        unit_amount: priceUsd * 100, // Stripe uses cents
                        recurring: {
                            interval: period === 'monthly' ? 'month' : 'year',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            customer_email: userEmail,
            client_reference_id: userId,
            metadata: {
                planId,
                period,
                userId
            },
            success_url: `${siteUrl}/index.html?status=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${siteUrl}/index.html?status=failure`,
        });

        return { id: session.id, url: session.url };
    }

    async cancelSubscription(subscriptionId) {
        return await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });
    }

    async getSubscription(subscriptionId) {
        return await stripe.subscriptions.retrieve(subscriptionId);
    }

    async getCheckoutSession(sessionId) {
        return await stripe.checkout.sessions.retrieve(sessionId);
    }
}

module.exports = new PaymentService();
