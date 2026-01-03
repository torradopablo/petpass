
const ProfileRepository = require('../backend/repositories/ProfileRepository');
const PaymentController = require('../backend/controllers/PaymentController');
const authMiddleware = require('../backend/middleware/authMiddleware');

module.exports = async (req, res) => {
    try {
        await authMiddleware(req, res);
        const userId = req.user.id;

        if (req.method === 'DELETE') {
            console.log(`Deactivating account for user: ${userId}`);

            // 1. Try to cancel subscription if exists
            try {
                const profile = await ProfileRepository.findById(userId);
                if (profile.subscription_id && profile.plan_status === 'active') {
                    console.log(`Cancelling subscription before deactivation: ${profile.subscription_id}`);
                    // We call the controller method directly or service
                    // To keep it simple and consistent with existing logic:
                    await PaymentController.cancelSubscription(req, {
                        json: () => { },
                        status: () => ({ json: () => { } }),
                        send: () => { }
                    });
                }
            } catch (error) {
                console.error('Error cancelling subscription during deactivation (non-blocking):', error);
            }

            // 2. Delete/Deactivate from repository
            await ProfileRepository.delete(userId);

            console.log(`User ${userId} deactivated successfully.`);
            return res.json({ message: 'Account deactivated successfully' });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Profile API Error:', error);
        res.status(error.status || 500).json({ error: error.message });
    }
};
