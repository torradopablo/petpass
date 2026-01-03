
const OrderService = require('../services/OrderService');

class OrderController {
    async create(req, res) {
        try {
            const order = await OrderService.createOrder({
                ...req.body,
                user_id: req.user.id
            });
            res.status(201).json(order);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new OrderController();
