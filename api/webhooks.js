const PaymentController = require('../backend/controllers/PaymentController');

// Stripe requires the raw body for signature verification
// This is a Vercel-specific way to handle raw body if needed, 
// but for standard Node.js/Express we might need a different approach.
// Since this is a serverless function in 'api/', we'll assume standard req.body for now
// but keep in mind Stripe signature verification needs the raw buffer.

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, stripe-signature');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        return await PaymentController.webhook(req, res);
    }

    res.status(405).json({ error: 'Method not allowed' });
};
