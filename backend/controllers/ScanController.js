
const ScanService = require('../services/ScanService');

class ScanController {
    async create(req, res) {
        try {
            const scan = await ScanService.createScan(req.body);
            res.status(201).json(scan);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ScanController();
