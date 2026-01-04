const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, PaymentController.createPreference.bind(PaymentController));
router.delete('/', authMiddleware, PaymentController.cancelSubscription.bind(PaymentController));

module.exports = router;
