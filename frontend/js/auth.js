import { supabase } from './supabaseClient.js';
import { UI } from './ui.js';
import { Settings } from './settings.js';
import { MembershipServiceInstance } from './services/MembershipService.js';

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
            options: {
                redirectTo: window.location.origin,
            },
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

            // Update subscription status display
            this.updateSubscriptionUI(data);
            // Update membership status using new service
            this.updateMembershipUI(data);

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
    },

    async deleteAccount() {
        if (!this.user) return;

        const response = await fetch('/api/profile', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.session?.access_token}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Error al eliminar cuenta');
        }

        // Sign out locally
        await this.signOut();
    },

    updateSubscriptionUI(profile) {
        // Update current plan display
        const currentPlanName = document.getElementById('current-plan-name');
        const currentPlanStatus = document.getElementById('current-plan-status');
        const subscriptionCancelSection = document.getElementById('subscription-cancel-section');

        if (currentPlanName) {
            const planNames = {
                'basico': 'Plan Básico',
                'premium': 'Plan Premium',
                'gratis': 'Plan Gratuito'
            };
            currentPlanName.textContent = planNames[profile.plan] || 'Plan Gratuito';
        }

        if (currentPlanStatus) {
            const statusConfig = {
                'active': { text: 'Activo', class: 'bg-green-100 text-green-700' },
                'cancelled': { text: 'Cancelado', class: 'bg-red-100 text-red-700' },
                'paused': { text: 'Pausado', class: 'bg-yellow-100 text-yellow-700' },
                'expired': { text: 'Expirado', class: 'bg-gray-100 text-gray-700' }
            };
            
            const status = profile.plan_status || 'active';
            const config = statusConfig[status] || statusConfig['active'];
            currentPlanStatus.textContent = config.text;
            currentPlanStatus.className = `px-3 py-1 rounded-full text-xs font-bold uppercase ${config.class}`;
        }

        // Show/hide cancel section based on subscription
        if (subscriptionCancelSection) {
            const hasActiveSubscription = profile.plan && profile.plan !== 'gratis' && profile.plan_status === 'active';
            subscriptionCancelSection.classList.toggle('hidden', !hasActiveSubscription);
            
            // Update expiry date if available
            const expiryDateEl = document.getElementById('plan-expiry-date');
            if (expiryDateEl && profile.plan_expires_at) {
                const expiryDate = new Date(profile.plan_expires_at);
                expiryDateEl.textContent = expiryDate.toLocaleDateString('es-AR');
            }
        }
    },

    updateMembershipUI(profile) {
        // Analyze membership using the new service
        const membership = MembershipServiceInstance.analyzeMembership(profile);
        
        // Update membership card if it exists
        const membershipCardContainer = document.getElementById('membership-card-container');
        if (membershipCardContainer) {
            // Import and create membership card dynamically
            import('./components/ui/MembershipCard.js').then(({ createMembershipCard }) => {
                const card = createMembershipCard(membershipCardContainer, MembershipServiceInstance);
                card.render(membership);
            });
        }
        
        // Update plan selection buttons based on membership
        this.updatePlanSelectionUI(membership);
        
        // Show/hide features based on membership
        this.updateFeaturesUI(membership);
        
        // Store membership for global access
        window.currentMembership = membership;
        
        console.log('Membership updated:', membership);
    },

    updatePlanSelectionUI(membership) {
        document.querySelectorAll('[data-plan-card]').forEach(card => {
            const planId = card.dataset.planCard;
            const btn = card.querySelector('button');

            if (planId === membership.plan) {
                btn.textContent = 'Tu Plan Actual';
                btn.disabled = true;
                btn.classList.add('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
                btn.classList.remove('bg-brand-green', 'bg-white', 'text-white', 'text-gray-900', 'hover:scale-[1.02]');
                card.classList.add('ring-4', 'ring-brand-green/20', 'opacity-75');
            } else {
                // Enable upgrade/downgrade based on membership rules
                const canSelect = this.canSelectPlan(planId, membership);
                btn.disabled = !canSelect;
                
                if (canSelect) {
                    btn.textContent = 'Seleccionar';
                    btn.classList.remove('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
                    
                    // Restore original button styling based on plan
                    if (planId === 'premium') {
                        btn.classList.add('bg-white', 'text-gray-900', 'hover:scale-[1.02]');
                        btn.classList.remove('bg-brand-green', 'text-white');
                    } else {
                        btn.classList.add('bg-brand-green', 'text-white', 'hover:scale-[1.02]');
                        btn.classList.remove('bg-white', 'text-gray-900');
                    }
                } else {
                    btn.textContent = 'No disponible';
                    btn.classList.add('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
                    btn.classList.remove('bg-brand-green', 'bg-white', 'text-white', 'text-gray-900', 'hover:scale-[1.02]');
                }
                
                card.classList.remove('ring-4', 'ring-brand-green/20', 'opacity-75');
            }
        });
    },

    canSelectPlan(targetPlan, membership) {
        // Gratis can always upgrade to paid plans
        if (membership.plan === 'gratis' && (targetPlan === 'basico' || targetPlan === 'premium')) {
            return true;
        }
        
        // Basic can upgrade to premium
        if (membership.plan === 'basico' && targetPlan === 'premium') {
            return true;
        }
        
        // Premium can downgrade (but should show confirmation)
        if (membership.plan === 'premium' && targetPlan === 'basico') {
            return true;
        }
        
        // Cannot downgrade to gratis if has active subscription
        if (membership.plan !== 'gratis' && targetPlan === 'gratis') {
            return false;
        }
        
        return false;
    },

    updateFeaturesUI(membership) {
        // Update pet limit indicator
        const petCountElement = document.getElementById('pet-count-indicator');
        if (petCountElement) {
            const currentPetCount = document.querySelectorAll('[data-pet-card]').length;
            const maxPets = MembershipServiceInstance.features[membership.plan]?.maxPets || 2;
            
            petCountElement.textContent = `${currentPetCount}/${maxPets} mascotas`;
            petCountElement.className = currentPetCount >= maxPets 
                ? 'text-red-500 font-medium' 
                : 'text-gray-500';
        }
        
        // Disable add pet button if at limit
        const addPetBtn = document.getElementById('btn-add-pet');
        if (addPetBtn) {
            const currentPetCount = document.querySelectorAll('[data-pet-card]').length;
            const canAdd = MembershipServiceInstance.canAddPet(currentPetCount, membership);
            
            addPetBtn.disabled = !canAdd;
            if (!canAdd) {
                addPetBtn.textContent = 'Límite alcanzado';
                addPetBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                addPetBtn.textContent = 'Nueva Mascota';
                addPetBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
        
        // Show/hide premium features
        document.querySelectorAll('[data-premium-feature]').forEach(feature => {
            const featureName = feature.dataset.premiumFeature;
            const isAvailable = MembershipServiceInstance.isFeatureAvailable(featureName, membership);
            
            feature.classList.toggle('hidden', !isAvailable);
            feature.classList.toggle('opacity-50', !isAvailable);
        });
    }
};
