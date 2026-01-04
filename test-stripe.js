const dotenv = require('dotenv');
dotenv.config();
const PaymentService = require('./backend/services/PaymentService');

async function test() {
    try {
        console.log('Testing Stripe Session Creation...');
        const session = await PaymentService.createCheckoutSession(
            'basico',
            'monthly',
            'test@example.com',
            'user_123'
        );
        console.log('SUCCESS!');
        console.log('Session ID:', session.id);
        console.log('Checkout URL:', session.url);
    } catch (error) {
        console.error('FAILED:', error.message);
    }
}

test();
