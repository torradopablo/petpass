const PetRepository = require('../repositories/PetRepository');
const ProfileRepository = require('../repositories/ProfileRepository');
const Plans = require('../config/Plans');

class PetService {
    async createPet(petData) {
        // Validation logic
        if (!petData.name) throw new Error('Name is required');

        // Check plan limits
        const profile = await ProfileRepository.findById(petData.owner_id);
        const planKey = (profile.plan || 'gratis').toUpperCase();
        const plan = Plans[planKey] || Plans.GRATIS;

        const currentPets = await PetRepository.findByOwner(petData.owner_id);
        if (currentPets.length >= plan.maxPets) {
            throw new Error(`Has alcanzado el límite de ${plan.maxPets} mascotas para tu plan ${plan.name}. Mejora tu plan para agregar más.`);
        }

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
