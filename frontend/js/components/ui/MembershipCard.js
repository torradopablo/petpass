// Membership Card Component - UI para mostrar estado y operaciones de membresía
export class MembershipCard {
    constructor(container, membershipService) {
        this.container = container;
        this.membershipService = membershipService;
        this.membership = null;
    }

    render(membership) {
        this.membership = membership;
        this.container.innerHTML = this.getMembershipHTML();
        this.attachEventListeners();
    }

    getMembershipHTML() {
        const { membership } = this;
        const statusConfig = this.getStatusConfig(membership);
        
        return `
            <div class="glass rounded-2xl p-6 border ${statusConfig.borderClass}">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900">Tu Plan Actual</h3>
                        <p class="text-sm text-gray-600">${membership.plan === 'gratis' ? 'Comienza gratis' : 'Suscripción activa'}</p>
                    </div>
                    <div class="text-right">
                        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase ${statusConfig.class}">
                            ${statusConfig.text}
                        </span>
                        ${membership.daysRemaining !== null ? `
                            <p class="text-xs text-gray-500 mt-1">${membership.daysRemaining} días restantes</p>
                        ` : ''}
                    </div>
                </div>

                <!-- Plan Info -->
                <div class="bg-gray-50 p-4 rounded-xl mb-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="font-bold text-lg text-gray-900">${this.membershipService.features[membership.plan]?.name || 'Plan Gratuito'}</p>
                            <p class="text-sm text-gray-600">${this.getPlanDescription(membership)}</p>
                        </div>
                        <div class="text-2xl">
                            ${this.getPlanIcon(membership.plan)}
                        </div>
                    </div>
                </div>

                <!-- Available Operations -->
                ${membership.availableOperations.length > 0 ? `
                    <div class="space-y-3">
                        <h4 class="text-sm font-medium text-gray-700">Operaciones Disponibles</h4>
                        ${membership.availableOperations.map(op => this.getOperationButton(op)).join('')}
                    </div>
                ` : ''}

                <!-- Features Status -->
                <div class="mt-6 pt-6 border-t border-gray-100">
                    <h4 class="text-sm font-medium text-gray-700 mb-3">Características de tu Plan</h4>
                    <div class="space-y-2">
                        ${this.getFeaturesStatus(membership)}
                    </div>
                </div>

                <!-- Trial Warning -->
                ${membership.isTrial && membership.daysRemaining <= 7 ? `
                    <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p class="text-sm text-yellow-800">
                            ⚠️ Tu trial gratis expira en ${membership.daysRemaining} días. 
                            <button onclick="window.MembershipServiceInstance.showUpgradeModal()" class="underline font-medium">Mejora tu plan</button> para mantener tus beneficios.
                        </p>
                    </div>
                ` : ''}

                <!-- Expired Warning -->
                ${membership.isExpired ? `
                    <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p class="text-sm text-red-800">
                            ❌ Tu suscripción ha expirado. 
                            <button onclick="window.MembershipServiceInstance.showRenewModal()" class="underline font-medium">Renueva ahora</button> para recuperar el acceso.
                        </p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    getStatusConfig(membership) {
        if (membership.isTrial) {
            return {
                text: 'Trial Gratis',
                class: 'bg-blue-100 text-blue-700',
                borderClass: 'border-blue-200'
            };
        }
        
        if (membership.isActive) {
            return {
                text: 'Activo',
                class: 'bg-green-100 text-green-700',
                borderClass: 'border-green-200'
            };
        }
        
        if (membership.isExpired) {
            return {
                text: 'Expirado',
                class: 'bg-red-100 text-red-700',
                borderClass: 'border-red-200'
            };
        }
        
        return {
            text: membership.status || 'Desconocido',
            class: 'bg-gray-100 text-gray-700',
            borderClass: 'border-gray-200'
        };
    }

    getPlanDescription(membership) {
        const features = this.membershipService.features[membership.plan];
        if (!features) return '';
        
        if (membership.plan === 'gratis') {
            return membership.isTrial 
                ? `${features.freeTrialDays} días de prueba gratuita` 
                : 'Plan gratuito con funciones básicas';
        }
        
        return `Hasta ${features.maxPets} mascotas • ${features.features.filter(f => f.included).length} características`;
    }

    getPlanIcon(plan) {
        const icons = {
            gratis: '🌱',
            basico: '🛡️',
            premium: '💎'
        };
        return icons[plan] || '📦';
    }

    getOperationButton(operation) {
        const baseClasses = 'w-full py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2';
        const priorityStyles = {
            high: 'bg-brand-green text-white hover:bg-green-600 shadow-lg',
            medium: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
            low: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        };

        const confirmAttr = operation.confirm ? 'data-confirm="true"' : '';
        
        return `
            <button 
                onclick="window.MembershipServiceInstance.handleOperation('${operation.type}', ${confirmAttr})"
                class="${baseClasses} ${priorityStyles[operation.priority] || priorityStyles.medium}"
                ${operation.type === 'cancel' ? 'data-cancel="true"' : ''}
            >
                ${this.getOperationIcon(operation.type)}
                ${operation.text}
            </button>
            ${operation.description ? `<p class="text-xs text-gray-500 mt-1">${operation.description}</p>` : ''}
        `;
    }

    getOperationIcon(type) {
        const icons = {
            upgrade: '⬆️',
            downgrade: '⬇️',
            cancel: '❌',
            renew: '🔄'
        };
        return icons[type] || '📋';
    }

    getFeaturesStatus(membership) {
        const features = this.membershipService.features[membership.plan]?.features || [];
        
        return features.map(feature => `
            <div class="flex items-center justify-between py-2">
                <span class="text-sm text-gray-600">${feature.name}</span>
                <span class="flex items-center gap-1">
                    ${feature.included 
                        ? '<span class="text-green-500">✓</span>' 
                        : '<span class="text-gray-300">✕</span>'
                    }
                </span>
            </div>
        `).join('');
    }

    attachEventListeners() {
        // Add confirmation for cancel operations
        this.container.querySelectorAll('[data-cancel="true"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!confirm('¿Estás seguro de que quieres cancelar tu suscripción? Perderás el acceso a las características premium al final del período actual.')) {
                    e.preventDefault();
                }
            });
        });
    }
}

// Factory function
export function createMembershipCard(container, membershipService) {
    return new MembershipCard(container, membershipService);
}
