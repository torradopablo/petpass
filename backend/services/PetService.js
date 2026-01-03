
const PetRepository = require('../repositories/PetRepository');

class PetService {
    async createPet(petData) {
        // Validation logic can go here
        if (!petData.name) throw new Error('Name is required');
        return await PetRepository.create(petData);
    }

    async getPetById(id) {
        return await PetRepository.findById(id);
    }

    async getPetsByOwner(ownerId) {
        return await PetRepository.findByOwner(ownerId);
    }
}

module.exports = new PetService();
