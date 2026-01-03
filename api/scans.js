
const ScanController = require('../backend/controllers/ScanController');

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        // Public endpoint, no auth required
        return await ScanController.create(req, res);
    }

    res.status(405).json({ error: 'Method not allowed' });
};
