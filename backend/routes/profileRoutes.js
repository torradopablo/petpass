const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const ProfileRepository = require('../repositories/ProfileRepository');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const profile = await ProfileRepository.findById(req.user.id);
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/', authMiddleware, async (req, res) => {
    try {
        const profile = await ProfileRepository.update(req.user.id, req.body);
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/', authMiddleware, async (req, res) => {
    try {
        await ProfileRepository.delete(req.user.id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
