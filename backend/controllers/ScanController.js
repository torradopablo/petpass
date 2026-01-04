const ScanService = require('../services/ScanService');
const ScanRepository = require('../repositories/ScanRepository');

class ScanController {
    async create(req, res) {
        try {
            const scan = await ScanService.createScan(req.body);
            res.status(201).json(scan);
        } catch (error) {
            console.error('ScanController Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getByPet(req, res) {
        try {
            const scans = await ScanRepository.findByPetId(req.params.petId);
            res.json(scans);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ScanController();
