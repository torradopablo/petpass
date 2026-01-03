const PaymentController = require('../backend/controllers/PaymentController');

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        // Webhooks are public (verified by payload signature in real prod, but open for now)
        return await PaymentController.webhook(req, res);
    }

    res.status(405).json({ error: 'Method not allowed' });
};
