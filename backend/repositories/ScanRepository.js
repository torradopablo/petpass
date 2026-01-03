
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

class ScanRepository {
    async create(scanData) {
        const { data, error } = await supabase.from('scans').insert([scanData]).select().single();
        if (error) throw error;
        return data;
    }

    async findByPetId(petId) {
        const { data, error } = await supabase.from('scans').select('*').eq('pet_id', petId).order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }
}

module.exports = new ScanRepository();
