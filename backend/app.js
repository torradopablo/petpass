const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Debug: Check if environment variables are loaded
console.log('Environment variables loaded:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'PRESENT' : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'PRESENT' : 'MISSING');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'PRESENT' : 'MISSING');

const app = express();

// Middleware
app.use(cors());

// Stripe webhook needs raw body
app.use('/api/webhooks', bodyParser.raw({ type: 'application/json' }));

// Regular JSON body parser for other routes
app.use(express.json());

// Routes
const paymentRoutes = require('./routes/paymentRoutes');
const petRoutes = require('./routes/petRoutes');
const scanRoutes = require('./routes/scanRoutes');
const profileRoutes = require('./routes/profileRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/webhooks', (req, res, next) => {
    const PaymentController = require('./controllers/PaymentController');
    PaymentController.webhook(req, res);
});
app.use('/api/pets', (req, res, next) => {
    console.log('Pets endpoint accessed:', req.method, req.url);
    console.log('Headers:', req.headers);
    next();
}, petRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/profile', profileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.name || 'InternalServerError',
        message: err.message || 'Something went wrong on the server'
    });
});

module.exports = app;
