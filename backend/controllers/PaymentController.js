const PaymentService = require('../services/PaymentService');
const ProfileRepository = require('../repositories/ProfileRepository');

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
                return res.json(preference);
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
                message: error.message
            });
        }
    }

    async cancelSubscription(req, res) {
        try {
            const userId = req.user.id;
            console.log(`Attempting to cancel subscription for user: ${userId}`);

            const profile = await ProfileRepository.findById(userId);

            if (!profile.subscription_id) {
                console.warn(`No active subscription found for user ${userId}`);
                return res.status(400).json({ error: 'No active subscription found' });
            }

            console.log(`Cancelling MP subscription: ${profile.subscription_id}`);
            await PaymentService.cancelSubscription(profile.subscription_id);

            // Update local status immediately
            await ProfileRepository.update(userId, {
                plan_status: 'cancelled',
                // We keep plan name and expires_at for record, 
                // but status 'cancelled' means no more billing.
            });

            res.json({ message: 'Subscription canceled successfully' });
        } catch (error) {
            console.error('Cancellation Error:', error);
            res.status(500).json({
                error: 'Cancellation error',
                message: error.message
            });
        }
    }

    async webhook(req, res) {
        const { type, data } = req.body;
        console.log(`Webhook received: ${type}`, data);

        try {
            if (type === 'payment') {
                const paymentId = data.id;
                const payment = await PaymentService.getPayment(paymentId);

                if (payment.status === 'approved') {
                    const externalReference = payment.external_reference;

                    if (externalReference && externalReference.startsWith('sub_')) {
                        const parts = externalReference.split('_');
                        const planId = parts[1];
                        const period = parts[2];
                        const userId = parts[3];

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
                const preApprovalId = data.id || req.body.resource;
                const preApproval = await PaymentService.getPreApproval(preApprovalId);
                console.log(`PreApproval status for ${preApprovalId}: ${preApproval.status}`);

                const externalReference = preApproval.external_reference;
                if (externalReference && externalReference.startsWith('sub_')) {
                    const parts = externalReference.split('_');
                    const userId = parts[3];

                    if (preApproval.status === 'authorized') {
                        const planId = parts[1];
                        const period = parts[2];

                        await ProfileRepository.update(userId, {
                            subscription_id: preApprovalId,
                            plan: planId,
                            plan_status: 'active',
                            subscription_period: period
                        });
                        console.log(`Subscription authorized for user ${userId}: ${preApprovalId}`);
                    } else if (preApproval.status === 'cancelled' || preApproval.status === 'paused') {
                        await ProfileRepository.update(userId, {
                            plan_status: 'cancelled'
                        });
                        console.log(`Subscription ${preApproval.status} for user ${userId}`);
                    }
                }
            }
        } catch (error) {
            console.error('Webhook processing error:', error);
        }

        res.status(200).send('OK');
    }
}

module.exports = new PaymentController();
