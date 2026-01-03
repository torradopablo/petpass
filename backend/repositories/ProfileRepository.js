
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

class ProfileRepository {
    async findById(id) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    }

    async update(id, updates) {
        const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }
}

module.exports = new ProfileRepository();
