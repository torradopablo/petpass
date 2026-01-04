const ScanRepository = require('../repositories/ScanRepository');
const PetRepository = require('../repositories/PetRepository');
const Mailer = require('../utils/mailer');
const Plans = require('../config/Plans');

class ScanService {
    async createScan(scanData) {
        // 1. Save scan record in database
        const scan = await ScanRepository.create(scanData);

        // 2. Fetch pet and owner details for notification
        let pet;
        try {
            pet = await PetRepository.findByIdWithOwner(scanData.pet_id);
        } catch (error) {
            console.error('Error fetching pet for notification:', error);
            return scan;
        }

        if (pet && pet.profiles && pet.profiles.email) {
            const ownerPlanKey = (pet.profiles.plan || 'gratis').toUpperCase();
            const ownerPlan = Plans[ownerPlanKey] || Plans.GRATIS;

            // Enforce plan restrictions: only plans with scanAlerts enabled receive emails
            if (!ownerPlan.features?.scanAlerts) {
                return scan;
            }

            // If plan status is not active, do not send notifications
            if (pet.profiles.plan_status && pet.profiles.plan_status !== 'active') {
                return scan;
            }

            // If there is an expiry date and it's in the past, do not send notifications
            if (pet.profiles.plan_expires_at) {
                const expiresAt = new Date(pet.profiles.plan_expires_at);
                if (!isNaN(expiresAt.getTime()) && expiresAt.getTime() < Date.now()) {
                    return scan;
                }
            }

            const scanLat = parseFloat(scanData.latitude);
            const scanLon = parseFloat(scanData.longitude);

            // Check if within safe zone (100 meters from home)
            if (pet.latitude && pet.longitude && !isNaN(scanLat) && !isNaN(scanLon)) {
                const distance = this.calculateDistance(
                    pet.latitude, pet.longitude,
                    scanLat, scanLon
                );

                // If within 100 meters, we assume it's a test or the owner at home
                if (distance < 0.1) {
                    return scan;
                }
            }

            // Trigger notification
            await Mailer.sendQRScanNotification(
                pet.profiles.email,
                pet.name,
                scanLat,
                scanLon
            );
        }

        return scan;
    }

    // Haversine formula to calculate distance in KM
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}

module.exports = new ScanService();
