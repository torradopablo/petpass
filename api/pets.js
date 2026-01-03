
const PetController = require('../backend/controllers/PetController');
const authMiddleware = require('../backend/middleware/authMiddleware');

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await authMiddleware(req, res);

        if (req.method === 'POST') {
            return await PetController.create(req, res);
        } else if (req.method === 'GET') {
            return await PetController.getMine(req, res);
        } else if (req.method === 'PUT') {
            return await PetController.update(req, res);
        } else if (req.method === 'DELETE') {
            return await PetController.delete(req, res);
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};
