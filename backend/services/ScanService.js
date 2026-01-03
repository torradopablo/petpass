
const ScanRepository = require('../repositories/ScanRepository');
const PetRepository = require('../repositories/PetRepository');
const Mailer = require('../utils/mailer');

class ScanService {
    async createScan(scanData) {
        // 1. Save scan
        const scan = await ScanRepository.create(scanData);

        // 2. Fetch pet and owner info for notification
        // We use the Service Role (via Repository) to access owner data
        const { data: pet, error } = await PetRepository.findByIdWithOwner(scanData.pet_id);

        if (pet && pet.profiles && pet.profiles.email) {
            const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${scanData.latitude},${scanData.longitude}`;
            await Mailer.sendEmail(
                pet.profiles.email,
                `¡Alerta! ${pet.name} fue escaneado`,
                `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <h1 style="color: #ef4444;">🚨 Tu mascota ha sido escaneada</h1>
                    <p>Hola <strong>${pet.profiles.full_name || 'Dueño'}</strong>,</p>
                    <p>Alguien acaba de escanear el código QR de <strong>${pet.name}</strong>.</p>
                    
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>📍 Ubicación detectada:</strong></p>
                        <a href="${googleMapsLink}" style="display: inline-block; margin-top: 10px; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Ver en Google Maps</a>
                    </div>

                    <p style="color: #6b7280; font-size: 14px;">Si no fuiste tú, por favor revisa la ubicación inmediatamente.</p>
                </div>
                `
            );
        }

        return scan;
    }
}

module.exports = new ScanService();
