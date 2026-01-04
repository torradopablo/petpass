
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

    async getAll(req, res) {
        try {
            const pets = await PetService.getPetsByOwner(req.user.id);
            res.json(pets);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const pet = await PetService.getPetById(req.params.id);
            res.json(pet);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const petId = req.params.id || req.query.id || req.body.id;

            if (!petId) {
                return res.status(400).json({ error: 'Pet ID is required' });
            }

            await PetService.updatePet(petId, req.user.id, req.body);
            res.status(200).json({ message: 'Pet updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const petId = req.params.id || req.query.id || req.body.id;

            if (!petId) {
                return res.status(400).json({ error: 'Pet ID is required' });
            }

            await PetService.deletePet(petId, req.user.id);
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new PetController();
