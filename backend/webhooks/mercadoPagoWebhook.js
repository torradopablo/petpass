
const PaymentController = require('../controllers/PaymentController');

// Vercel Serverless Function export pattern
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        return await PaymentController.webhook(req, res);
    }
    res.status(405).send('Method Not Allowed');
};
