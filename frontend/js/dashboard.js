
import { Pets } from './pets.js';
import { Orders } from './orders.js';

export const Dashboard = {
    init() {
        console.log('Dashboard initialized');
        // Initial data load
        Pets.loadPets();
        Orders.loadOrders();
    }
};
