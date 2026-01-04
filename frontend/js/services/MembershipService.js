// Membership Service - Manejo centralizado de membresías y planes
export class MembershipService {
    constructor() {
        this.currentMembership = null;
        this.features = {
            gratis: {
                name: 'Plan Gratuito',
                maxPets: 2,
                freeTrialDays: 30,
                features: [
                    { name: 'Hasta 2 mascotas', included: true },
                    { name: 'QR básico', included: true },
                    { name: 'Alertas de escaneo', included: false },
                    { name: 'Geolocalización', included: false },
                    { name: 'Historial de posiciones', included: false },
                    { name: 'Soporte prioritario', included: false }
                ]
            },
            basico: {
                name: 'Plan Básico',
                maxPets: 2,
                price: { monthly: 5, annual: 50 },
                features: [
                    { name: 'Hasta 2 mascotas', included: true },
                    { name: 'QR inteligente', included: true },
                    { name: 'Alertas de escaneo', included: true },
                    { name: 'Geolocalización', included: true },
                    { name: 'Historial de posiciones', included: true },
                    { name: 'Soporte prioritario', included: false }
                ]
            },
            premium: {
                name: 'Plan Premium',
                maxPets: 5,
                price: { monthly: 10, annual: 100 },
                features: [
                    { name: 'Hasta 5 mascotas', included: true },
                    { name: 'QR inteligente', included: true },
                    { name: 'Alertas multi-contacto', included: true },
                    { name: 'Geolocalización avanzada', included: true },
                    { name: 'Historial completo', included: true },
                    { name: 'Soporte prioritario 24/7', included: true },
                    { name: 'Perímetro de seguridad', included: true },
                    { name: 'Beneficios exclusivos', included: true }
                ]
            }
        };
    }

    // Analizar el estado actual de la membresía
    analyzeMembership(profile) {
        if (!profile) {
            return this.getDefaultMembership();
        }

        const plan = profile.plan || 'gratis';
        const status = profile.plan_status || 'active';
        const expiresAt = profile.plan_expires_at ? new Date(profile.plan_expires_at) : null;
        const createdAt = profile.created_at ? new Date(profile.created_at) : new Date();
        
        const membership = {
            plan,
            status,
            expiresAt,
            createdAt,
            isActive: false,
            isExpired: false,
            isTrial: false,
            daysRemaining: null,
            canUpgrade: false,
            canDowngrade: false,
            canCancel: false,
            availableOperations: []
        };

        // Determinar estado según el plan y condiciones
        if (plan === 'gratis') {
            membership.isTrial = this.isInFreeTrial(createdAt);
            membership.daysRemaining = membership.isTrial ? this.getTrialDaysRemaining(createdAt) : null;
            membership.isActive = membership.isTrial || status === 'active';
            membership.isExpired = !membership.isTrial && status === 'expired';
            membership.canUpgrade = true;
            membership.canDowngrade = false;
            membership.canCancel = false;
        } else {
            membership.isActive = status === 'active' && (!expiresAt || expiresAt > new Date());
            membership.isExpired = status === 'expired' || (expiresAt && expiresAt <= new Date());
            membership.daysRemaining = expiresAt && expiresAt > new Date() ? this.getDaysRemaining(expiresAt) : null;
            membership.canUpgrade = plan === 'basico';
            membership.canDowngrade = plan === 'premium';
            membership.canCancel = membership.isActive;
        }

        // Determinar operaciones disponibles
        membership.availableOperations = this.getAvailableOperations(membership);

        this.currentMembership = membership;
        return membership;
    }

    // Verificar si está en período de prueba gratis
    isInFreeTrial(createdAt) {
        const trialEnd = new Date(createdAt);
        trialEnd.setDate(trialEnd.getDate() + this.features.gratis.freeTrialDays);
        return new Date() < trialEnd;
    }

    // Días restantes del trial
    getTrialDaysRemaining(createdAt) {
        const trialEnd = new Date(createdAt);
        trialEnd.setDate(trialEnd.getDate() + this.features.gratis.freeTrialDays);
        return this.getDaysRemaining(trialEnd);
    }

    // Días restantes hasta expiración
    getDaysRemaining(expiresAt) {
        const now = new Date();
        const diffTime = expiresAt - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    // Operaciones disponibles según estado
    getAvailableOperations(membership) {
        const operations = [];

        if (membership.plan === 'gratis') {
            if (membership.isTrial) {
                operations.push({
                    type: 'upgrade',
                    text: 'Mejorar Plan',
                    description: 'Mantén tus beneficios después del trial',
                    priority: 'high'
                });
            } else {
                operations.push({
                    type: 'upgrade',
                    text: 'Comenzar Trial Gratis',
                    description: '30 días gratis para probar PetPass',
                    priority: 'high'
                });
            }
        } else {
            if (membership.isActive) {
                operations.push({
                    type: 'upgrade',
                    text: membership.canUpgrade ? 'Mejorar a Premium' : null,
                    description: 'Desbloquea más funciones',
                    priority: 'medium'
                }).filter(op => op.text);

                operations.push({
                    type: 'cancel',
                    text: 'Cancelar Suscripción',
                    description: 'Tu plan continuará hasta el fin del período',
                    priority: 'low',
                    confirm: true
                });
            } else if (membership.isExpired) {
                operations.push({
                    type: 'renew',
                    text: 'Renovar Suscripción',
                    description: 'Reactiva tu acceso a PetPass',
                    priority: 'high'
                });
            }
        }

        return operations;
    }

    // Obtener membresía por defecto (nuevo usuario)
    getDefaultMembership() {
        const now = new Date();
        return {
            plan: 'gratis',
            status: 'active',
            expiresAt: null,
            createdAt: now,
            isActive: true,
            isExpired: false,
            isTrial: true,
            daysRemaining: this.features.gratis.freeTrialDays,
            canUpgrade: true,
            canDowngrade: false,
            canCancel: false,
            availableOperations: [
                {
                    type: 'upgrade',
                    text: 'Mejorar Plan',
                    description: 'Mantén tus beneficios después del trial',
                    priority: 'high'
                }
            ]
        };
    }

    // Verificar si una característica está disponible
    isFeatureAvailable(featureName, membership = null) {
        const currentMembership = membership || this.currentMembership;
        if (!currentMembership || !currentMembership.isActive) return false;

        const planFeatures = this.features[currentMembership.plan]?.features || [];
        const feature = planFeatures.find(f => f.name.toLowerCase().includes(featureName.toLowerCase()));
        return feature?.included || false;
    }

    // Verificar límite de mascotas
    canAddPet(currentPetCount, membership = null) {
        const currentMembership = membership || this.currentMembership;
        if (!currentMembership || !currentMembership.isActive) return false;

        const maxPets = this.features[currentMembership.plan]?.maxPets || 0;
        return currentPetCount < maxPets;
    }

    // Obtener mensaje de estado para UI
    getStatusMessage(membership) {
        if (membership.isTrial) {
            return `Trial gratis: ${membership.daysRemaining} días restantes`;
        }
        
        if (membership.isActive && membership.daysRemaining !== null) {
            return `Activo: ${membership.daysRemaining} días restantes`;
        }
        
        if (membership.isActive) {
            return 'Activo';
        }
        
        if (membership.isExpired) {
            return 'Expirado';
        }
        
        return membership.status;
    }

    // Obtener configuración de planes para UI
    getPlansForUI(currentPlan = 'gratis') {
        return Object.entries(this.features).map(([key, plan]) => ({
            id: key,
            name: plan.name,
            maxPets: plan.maxPets,
            price: plan.price,
            features: plan.features,
            isCurrent: key === currentPlan,
            canSelect: key !== currentPlan,
            freeTrialDays: key === 'gratis' ? plan.freeTrialDays : null
        }));
    }
}

// Instancia global
export const MembershipServiceInstance = new MembershipService();
