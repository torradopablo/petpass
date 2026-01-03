
const PaymentService = require('../services/PaymentService');

class PaymentController {

    async createPreference(req, res) {
        try {
            const { items, pet_id } = req.body;
            const user = req.user; // Assuming Auth Middleware populates this

            const preference = await PaymentService.createPreference(
                items,
                { email: user.email },
                pet_id // External Reference
            );

            res.json({ id: preference.id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Payment error' });
        }
    }

    async webhook(req, res) {
        const { type, data } = req.body;

        if (type === 'payment') {
            // Validate payment status with PaymentService
            console.log('Payment Webhook received:', data.id);
            // Update Order or Pet status in database
            // await OrderService.updateStatus(data.id, 'paid');
        }

        res.status(200).send('OK');
    }
}

module.exports = new PaymentController();
