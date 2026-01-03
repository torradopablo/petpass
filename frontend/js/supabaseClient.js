
// Initialize Supabase Client
// NOTE: These should be replaced with actual env vars in a real build process
// For this demo, we will check if they are in window.env or placeholders
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper to check user session
export async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return session;
}
