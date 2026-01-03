require('dotenv').config({ path: './.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const petId = '6b09365f-0488-4fb9-ab97-daa3a4981902'; // ID provided by user

async function debugFetch() {
    console.log(`Fetching pet ${petId}...`);

    // Exact query from profile.js
    const { data: pet, error } = await supabase
        .from('pets')
        .select(`
            *,
            profiles:owner_id ( full_name, phone, email )
        `)
        .eq('id', petId)
        .single();

    if (error) {
        console.error('Error fetching pet:', error);
    } else {
        console.log('Pet found:', pet);
    }
}

debugFetch();
