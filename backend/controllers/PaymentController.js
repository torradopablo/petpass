
const PaymentService = require('../services/PaymentService');

class PaymentController {

    async createPreference(req, res) {
        try {
            const { plan, period, items, pet_id } = req.body;
            const user = req.user;

            if (plan && period) {
                const preference = await PaymentService.createRecurringPreference(
                    plan,
                    period,
                    user.email,
                    user.id
                );
                return res.json(preference); // Returns { id, init_point }
            }

            // Normal preference (one-time purchase)
            const preference = await PaymentService.createPreference(
                items,
                { email: user.email },
                pet_id
            );

            res.json({ id: preference.id });
        } catch (error) {
            console.error('PaymentController Error:', error);
            res.status(500).json({
                error: 'Payment error',
                message: error.message,
                cause: error.cause
            });
        }
    }
    async cancelSubscription(req, res) {
        try {
            const userId = req.user.id;
            const ProfileRepository = require('../repositories/ProfileRepository');
            const profile = await ProfileRepository.findById(userId);

            if (!profile.subscription_id) {
                return res.status(400).json({ error: 'No active subscription found' });
            }

            await PaymentService.cancelSubscription(profile.subscription_id);

            // Update local status
            await ProfileRepository.update(userId, {
                plan_status: 'canceled'
            });

            res.json({ message: 'Subscription canceled successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Cancellation error' });
        }
    }


    async webhook(req, res) {
        const { type, data } = req.body;

        try {
            if (type === 'payment') {
                const paymentId = data.id;
                const payment = await PaymentService.getPayment(paymentId);

                if (payment.status === 'approved') {
                    const externalReference = payment.external_reference;

                    if (externalReference && externalReference.startsWith('sub_')) {
                        // Logic for subscription: sub_planId_period_userId
                        const parts = externalReference.split('_');
                        const planId = parts[1];
                        const period = parts[2];
                        const userId = parts[3];

                        const ProfileRepository = require('../repositories/ProfileRepository');

                        // Calculate expiration date
                        const expiresAt = new Date();
                        if (period === 'monthly') {
                            expiresAt.setMonth(expiresAt.getMonth() + 1);
                        } else {
                            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
                        }

                        await ProfileRepository.update(userId, {
                            plan: planId,
                            plan_status: 'active',
                            plan_expires_at: expiresAt.toISOString(),
                            subscription_period: period
                        });

                        console.log(`Plan updated for user ${userId}: ${planId} (${period})`);
                    }
                }
            } else if (type === 'preapproval') {
                const preApprovalId = data.id || req.body.resource; // MP webhooks can vary
                const preApproval = await PaymentService.getPreApproval(preApprovalId);

                if (preApproval.status === 'authorized') {
                    const externalReference = preApproval.external_reference;

                    if (externalReference && externalReference.startsWith('sub_')) {
                        const parts = externalReference.split('_');
                        const planId = parts[1];
                        const period = parts[2];
                        const userId = parts[3];

                        const ProfileRepository = require('../repositories/ProfileRepository');

                        await ProfileRepository.update(userId, {
                            subscription_id: preApprovalId,
                            plan: planId,
                            plan_status: 'active',
                            subscription_period: period
                        });

                        console.log(`Subscription authorized for user ${userId}: ${preApprovalId}`);
                    }
                }
            }
        } catch (error) {
            console.error('Webhook Error:', error);
        }

        res.status(200).send('OK');
    }
}

module.exports = new PaymentController();
