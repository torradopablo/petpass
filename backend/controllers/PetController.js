
const PetService = require('../services/PetService');

class PetController {
    async create(req, res) {
        try {
            const pet = await PetService.createPet({
                ...req.body,
                owner_id: req.user.id // From Auth Middleware
            });
            res.status(201).json(pet);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getMine(req, res) {
        try {
            const pets = await PetService.getPetsByOwner(req.user.id);
            res.json(pets);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new PetController();
