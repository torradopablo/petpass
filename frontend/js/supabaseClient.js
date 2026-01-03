
// Initialize Supabase Client
// NOTE: These should be replaced with actual env vars in a real build process
// For this demo, we will check if they are in window.env or placeholders
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = window.env?.SUPABASE_URL;
const SUPABASE_KEY = window.env?.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Supabase vars missing in window.env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper to check user session
export async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return session;
}
