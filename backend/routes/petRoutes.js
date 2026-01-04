const express = require('express');
const router = express.Router();
const PetController = require('../controllers/PetController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, PetController.getAll.bind(PetController));
router.get('/:id', PetController.getById.bind(PetController));
router.post('/', authMiddleware, PetController.create.bind(PetController));
router.put('/', authMiddleware, PetController.update.bind(PetController));
router.put('/:id', authMiddleware, PetController.update.bind(PetController));
router.delete('/', authMiddleware, PetController.delete.bind(PetController));
router.delete('/:id', authMiddleware, PetController.delete.bind(PetController));

module.exports = router;
