
const PaymentController = require('../backend/controllers/PaymentController');
const authMiddleware = require('../backend/middleware/authMiddleware');

module.exports = async (req, res) => {
    try {
        await authMiddleware(req, res);

        if (req.method === 'POST') {
            return await PaymentController.createPreference(req, res);
        } else if (req.method === 'DELETE') {
            return await PaymentController.cancelSubscription(req, res);
        }
        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};
