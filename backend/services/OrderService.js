
const OrderRepository = require('../repositories/OrderRepository');

class OrderService {
    async createOrder(orderData) {
        return await OrderRepository.create(orderData);
    }

    async updateStatus(id, status) {
        return await OrderRepository.updateStatus(id, status);
    }
}

module.exports = new OrderService();
