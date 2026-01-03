
import { supabase } from './supabaseClient.js';
import { UI } from './ui.js';

export const Auth = {
    user: null,

    async init() {
        // Check active session
        const { data: { session } } = await supabase.auth.getSession();
        this.user = session?.user || null;

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
            this.user = session?.user || null;
            if (this.user) {
                UI.showView('dashboard');
                this.loadProfile();
            } else {
                UI.showView('landing');
            }
        });
    },

    async loginWithEmail(email) {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        });
        if (error) throw error;
    },

    async loginWithGoogle() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) throw error;
    },

    async signOut() {
        await supabase.auth.signOut();
        UI.showView('landing');
    },

    async loadProfile() {
        if (!this.user) return;

        // Update UI headers
        const elAvatar = document.getElementById('user-avatar');
        const elName = document.getElementById('user-name');
        const elEmail = document.getElementById('user-email');

        if (elEmail) elEmail.textContent = this.user.email;

        // Fetch extended profile
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', this.user.id)
                .single();

            if (data) {
                if (elName) elName.textContent = data.full_name || 'Usuario';
                // If user has no avatar, use UI avatars
                if (elAvatar) elAvatar.src = data.avatar_url || `https://ui-avatars.com/api/?name=${data.full_name || 'User'}&background=random`;
            }
        } catch (err) {
            console.error('Profile load error:', err);
        }
    }
};
