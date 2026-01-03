
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

    async updatePet(petId, ownerId, petData) {
        // Verify ownership before updating
        const pet = await PetRepository.findById(petId);

        if (!pet) {
            throw new Error('Pet not found');
        }

        if (pet.owner_id !== ownerId) {
            throw new Error('Unauthorized: You can only update your own pets');
        }

        // If updating photo and old photo exists in Cloudinary, delete it
        if (petData.photo_url && pet.photo_url && pet.photo_url.includes('cloudinary.com')) {
            const cloudinary = require('../utils/cloudinary');
            await cloudinary.deleteImage(pet.photo_url);
        }

        // Update the pet
        return await PetRepository.update(petId, petData);
    }

    async deletePet(petId, ownerId) {
        // Verify ownership before deleting
        const pet = await PetRepository.findById(petId);

        if (!pet) {
            throw new Error('Pet not found');
        }

        if (pet.owner_id !== ownerId) {
            throw new Error('Unauthorized: You can only delete your own pets');
        }

        // Delete image from Cloudinary if it exists
        if (pet.photo_url && pet.photo_url.includes('cloudinary.com')) {
            const cloudinary = require('../utils/cloudinary');
            await cloudinary.deleteImage(pet.photo_url);
        }

        // Soft delete: set deleted_at timestamp
        return await PetRepository.softDelete(petId);
    }
}

module.exports = new PetService();
