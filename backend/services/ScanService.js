console.log('[v2] [INIT] ScanService.js loaded');
const ScanRepository = require('../repositories/ScanRepository');
const PetRepository = require('../repositories/PetRepository');
const Mailer = require('../utils/mailer');

class ScanService {
    async createScan(scanData) {
        console.log('[v2] Creating scan for pet:', scanData.pet_id);
        // 1. Save scan
        const scan = await ScanRepository.create(scanData);
        console.log('[v2] Scan saved in DB');

        // 2. Fetch pet and owner info for notification
        let pet;
        try {
            pet = await PetRepository.findByIdWithOwner(scanData.pet_id);
        } catch (error) {
            console.error('[v2] Error fetching pet/owner from DB:', error);
            return scan;
        }

        if (!pet) {
            console.warn('[v2] Pet not found for ID:', scanData.pet_id);
            return scan;
        }

        console.log('[v2] Found pet:', pet.name);
        console.log('[v2] Pet Profile Data:', JSON.stringify(pet.profiles, null, 2));
        console.log('[v2] Pet Home Coords:', { lat: pet.latitude, lng: pet.longitude });

        if (pet && pet.profiles && pet.profiles.email) {
            const scanLat = parseFloat(scanData.latitude);
            const scanLon = parseFloat(scanData.longitude);

            console.log(`[v2] Home: ${pet.latitude},${pet.longitude} | Scan: ${scanLat},${scanLon}`);

            // Check distance if pet has home coordinates
            if (pet.latitude && pet.longitude && !isNaN(scanLat) && !isNaN(scanLon)) {
                const distance = this.calculateDistance(
                    pet.latitude, pet.longitude,
                    scanLat, scanLon
                );

                console.log(`[v2] Calculated distance: ${distance.toFixed(3)} km`);

                // If distance is less than 100 meters (0.1 km), do not notify
                if (distance < 0.1) {
                    console.log(`[v2] WITHIN 100m RANGE. Skipping notification.`);
                    return scan;
                }
            } else {
                console.log('[v2] Missing coordinates for distance check. Proceeding with notification.');
            }

            console.log('[v2] Triggering email notification...');
            await Mailer.sendQRScanNotification(
                pet.profiles.email,
                pet.name,
                scanLat,
                scanLon
            );
        } else {
            console.warn('[v2] Missing pet/owner data for notification:', {
                hasPet: !!pet,
                hasProfiles: !!pet?.profiles,
                hasEmail: !!pet?.profiles?.email
            });
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
