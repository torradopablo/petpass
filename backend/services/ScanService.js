
const ScanRepository = require('../repositories/ScanRepository');
const PetRepository = require('../repositories/PetRepository');
const Mailer = require('../utils/mailer');

class ScanService {
    async createScan(scanData) {
        // 1. Save scan
        const scan = await ScanRepository.create(scanData);

        // 2. Fetch pet and owner info for notification
        const pet = await PetRepository.findById(scanData.pet_id);

        // Assuming we can get owner email via Supabase Join or separate query
        // For simplicity, we assume we have a way to get owner email (e.g. from profiles)
        // In a real Supabase query we can join.
        // Or we might need a UserRepository.

        // MOCK EMAIL NOTIFICATION
        if (pet) {
            const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${scanData.latitude},${scanData.longitude}`;
            await Mailer.sendEmail(
                'owner@example.com', // TODO: Fetch actua owner email
                `¡Alerta! ${pet.name} fue escaneado`,
                `
                <h1>Tu mascota ha sido escaneada</h1>
                <p>Se detectó un escaneo de tu mascota <strong>${pet.name}</strong>.</p>
                <p>Ubicación: <a href="${googleMapsLink}">Ver en Maps</a></p>
                <p>Hora: ${new Date().toLocaleString()}</p>
                `
            );
        }

        return scan;
    }
}

module.exports = new ScanService();
