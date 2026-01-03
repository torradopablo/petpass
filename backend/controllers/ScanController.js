
const ScanService = require('../services/ScanService');

class ScanController {
    async create(req, res) {
        try {
            console.log('[v2] Incoming scan request:', req.body);
            console.log('[v2] [DIAG] ScanService type:', typeof ScanService);
            console.log('[v2] [DIAG] ScanService keys:', Object.keys(ScanService));
            console.log('[v2] [BRIDGE] Calling ScanService.createScan...');
            const scan = await ScanService.createScan(req.body);
            console.log('[v2] [BRIDGE] ScanService.createScan returned');
            res.status(201).json(scan);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ScanController();
