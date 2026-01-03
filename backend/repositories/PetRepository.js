
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for backend admin tasks
);

class PetRepository {
    async create(petData) {
        const { data, error } = await supabase.from('pets').insert([petData]).select().single();
        if (error) throw error;
        return data;
    }

    async findById(id) {
        const { data, error } = await supabase.from('pets').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    }

    async findByOwner(ownerId) {
        const { data, error } = await supabase.from('pets').select('*').eq('owner_id', ownerId);
        if (error) throw error;
        return data;
    }

    async findByIdWithOwner(id) {
        // Requires a foreign key relationship between pets.owner_id and profiles.id (or auth.users)
        // Adjust 'profiles' to the actual table name if different
        const { data, error } = await supabase
            .from('pets')
            .select(`
                *,
                profiles:owner_id ( email, full_name )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }
}

module.exports = new PetRepository();
