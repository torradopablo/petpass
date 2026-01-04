const PaymentService = require('../services/PaymentService');
const ProfileRepository = require('../repositories/ProfileRepository');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentController {

    async createPreference(req, res) {
        try {
            const { plan, period } = req.body;
            const user = req.user;

            if (plan && period) {
                const session = await PaymentService.createCheckoutSession(
                    plan,
                    period,
                    user.email,
                    user.id
                );
                // Return both ID and URL for flexibility
                return res.json({ id: session.id, init_point: session.url });
            }

            res.status(400).json({ error: 'Plan and period are required' });
        } catch (error) {
            console.error('PaymentController Error:', error);
            res.status(500).json({
                error: 'Payment error',
                message: error.message
            });
        }
    }

    async cancelSubscription(req, res) {
        try {
            const userId = req.user.id;
            const profile = await ProfileRepository.findById(userId);

            if (!profile.subscription_id) {
                return res.status(400).json({ error: 'No active subscription found' });
            }

            await PaymentService.cancelSubscription(profile.subscription_id);

            await ProfileRepository.update(userId, {
                plan_status: 'cancelled'
            });

            res.json({ message: 'Subscription will be canceled at the end of the period' });
        } catch (error) {
            console.error('Cancellation Error:', error);
            res.status(500).json({
                error: 'Cancellation error',
                message: error.message
            });
        }
    }

    async webhook(req, res) {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error(`Webhook Error: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        try {
            switch (event.type) {
                case 'checkout.session.completed':
                    const session = event.data.object;
                    const userId = session.client_reference_id;
                    const subscriptionId = session.subscription;
                    const planId = session.metadata.planId;
                    const period = session.metadata.period;

                    const expiresAt = new Date();
                    if (period === 'monthly') {
                        expiresAt.setMonth(expiresAt.getMonth() + 1);
                    } else if (period === 'annual') {
                        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
                    }

                    await ProfileRepository.update(userId, {
                        subscription_id: subscriptionId,
                        plan: planId,
                        plan_status: 'active',
                        plan_expires_at: expiresAt.toISOString(),
                        subscription_period: period
                    });
                    console.log(`✅ Subscription ACTIVATED for user ${userId}`);
                    break;

                case 'customer.subscription.deleted':
                    const subscription = event.data.object;
                    // We need to find the user by subscription ID
                    // In a real app, you'd query your DB for the user with this subscription_id
                    // For now, we'll log it. Ideally, you'd have a repository method for this.
                    console.log(`❌ Subscription DELETED: ${subscription.id}`);
                    break;

                default:
                    console.log(`Unhandled event type ${event.type}`);
            }
        } catch (error) {
            console.error('❌ Webhook processing error:', error);
        }

        res.json({ received: true });
    }
}

module.exports = new PaymentController();
