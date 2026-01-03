
const OrderController = require('../backend/controllers/OrderController');
const authMiddleware = require('../backend/middleware/authMiddleware');

module.exports = async (req, res) => {
    try {
        await authMiddleware(req, res);

        if (req.method === 'POST') {
            return await OrderController.create(req, res);
        }
        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};
