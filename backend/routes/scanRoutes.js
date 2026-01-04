const express = require('express');
const router = express.Router();
const ScanController = require('../controllers/ScanController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', ScanController.create.bind(ScanController));
router.get('/:petId', authMiddleware, ScanController.getByPet.bind(ScanController));

module.exports = router;
