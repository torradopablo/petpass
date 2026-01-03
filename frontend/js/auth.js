import { supabase } from './supabaseClient.js';
import { UI } from './ui.js';
import { Settings } from './settings.js';

export const Auth = {
    user: null,

    async init() {
        const { data: { session } } = await supabase.auth.getSession();
        this.session = session;
        this.user = session?.user || null;
        console.log('Auth initialized. User:', this.user?.email || 'None');

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
            this.session = session;
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
        const elSettingPhone = document.getElementById('setting-phone');
        const elSettingAddress = document.getElementById('setting-address');

        if (elEmail) elEmail.textContent = this.user.email;

        // Fetch extended profile
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', this.user.id)
                .single();

            if (data) {
                if (elSettingPhone) elSettingPhone.value = data.phone || '';
                if (elSettingAddress) elSettingAddress.value = data.address || '';

                // Pass coords to settings map
                if (data.latitude !== null && data.latitude !== undefined && data.longitude !== null && data.longitude !== undefined) {
                    Settings.setCoords(data.latitude, data.longitude);
                }
            }

            // Get avatar from Google if available
            const googleAvatar = this.user.user_metadata?.avatar_url;
            const fullName = this.user.user_metadata?.full_name || this.user.user_metadata?.name || data?.full_name;

            // Update profile with Google data if not already set
            if (googleAvatar || fullName) {
                const updates = {};

                if (googleAvatar && (!data?.avatar_url || data.avatar_url.includes('ui-avatars.com'))) {
                    updates.avatar_url = googleAvatar;
                }

                if (fullName && !data?.full_name) {
                    updates.full_name = fullName;
                }

                // Update database if there are changes
                if (Object.keys(updates).length > 0) {
                    await supabase
                        .from('profiles')
                        .update(updates)
                        .eq('id', this.user.id);
                }
            }

            // Display in UI
            const displayName = fullName || 'Usuario';
            const displayAvatar = googleAvatar || data?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

            if (elName) elName.textContent = displayName;
            if (elAvatar) elAvatar.src = displayAvatar;

            // Display Plan Info
            const currentPlan = data?.plan || 'gratis';
            const planStatus = data?.plan_status || 'active';
            const expiresAt = data?.plan_expires_at;

            // Highlight current plan in UI
            document.querySelectorAll('[data-plan-card]').forEach(card => {
                const planId = card.dataset.planCard;
                const btn = card.querySelector('button');

                if (planId === currentPlan) {
                    btn.textContent = 'Tu Plan Actual';
                    btn.disabled = true;
                    btn.classList.add('bg-gray-100', 'text-gray-400');
                    btn.classList.remove('bg-brand-green', 'bg-white', 'text-white', 'text-gray-900');
                    card.classList.add('ring-4', 'ring-brand-green/20');
                } else {
                    card.classList.remove('ring-4', 'ring-brand-green/20');
                }
            });

            // Show cancellation button if subscription_id exists
            const cancelSection = document.getElementById('subscription-cancel-section');
            if (cancelSection) {
                if (data?.subscription_id && planStatus === 'active') {
                    cancelSection.classList.remove('hidden');
                    const elExpiry = document.getElementById('plan-expiry-date');
                    if (elExpiry && expiresAt) {
                        elExpiry.textContent = new Date(expiresAt).toLocaleDateString();
                    }
                } else {
                    cancelSection.classList.add('hidden');
                }
            }

        } catch (err) {
            console.error('Profile load error:', err);
            // Fallback to user metadata
            const fallbackName = this.user.user_metadata?.full_name || this.user.user_metadata?.name || 'Usuario';
            const fallbackAvatar = this.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=random`;

            if (elName) elName.textContent = fallbackName;
            if (elAvatar) elAvatar.src = fallbackAvatar;
        }
    },

    async updateProfile(updates) {
        if (!this.user) return;
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', this.user.id);
        if (error) throw error;
        await this.loadProfile();
    }
};
