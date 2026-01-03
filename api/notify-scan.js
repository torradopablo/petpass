const mailer = require('../backend/utils/mailer');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { pet_id, latitude, longitude } = req.body;

        if (!pet_id) {
            return res.status(400).json({ error: 'Pet ID is required' });
        }

        // Get pet and owner information
        const { data: pet, error: petError } = await supabase
            .from('pets')
            .select(`
                id,
                name,
                owner_id,
                profiles!inner(email, full_name)
            `)
            .eq('id', pet_id)
            .single();

        if (petError || !pet) {
            console.error('Pet not found:', petError);
            return res.status(404).json({ error: 'Pet not found' });
        }

        // Send notification email
        const ownerEmail = pet.profiles.email;
        const petName = pet.name;

        if (ownerEmail) {
            // New signature: (email, name, lat, lon)
            // notify-scan is usually called without location first
            await mailer.sendQRScanNotification(ownerEmail, petName, latitude, longitude);
            console.log(`QR scan notification sent to ${ownerEmail} for pet ${petName}`);
        }

        // Log the scan (optional - could save to a scans table)
        // await supabase.from('pet_scans').insert({
        //     pet_id: petId,
        //     scanned_at: new Date().toISOString(),
        //     location: location
        // });

        res.status(200).json({
            success: true,
            message: 'Notification sent successfully'
        });

    } catch (error) {
        console.error('QR scan notification error:', error);
        res.status(500).json({ error: error.message });
    }
};
