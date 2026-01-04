// Dashboard View Component
export const DashboardView = {
    async render(props = {}) {
        return `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div class="flex flex-col md:flex-row gap-8">
                    <!-- Sidebar -->
                    <aside class="w-full md:w-64 flex-shrink-0">
                        <div class="glass rounded-2xl p-6 sticky top-24">
                            <div class="text-center mb-6">
                                <div class="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-3 overflow-hidden">
                                    <img id="user-avatar" src="https://ui-avatars.com/api/?name=User" class="w-full h-full object-cover">
                                </div>
                                <h3 id="user-name" class="font-bold text-lg">Cargando...</h3>
                                <p id="user-email" class="text-sm text-gray-500">...</p>
                            </div>
                            <nav class="space-y-2">
                                <button onclick="window.showSection('pets')" 
                                    class="nav-btn w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-brand-blue bg-blue-50" 
                                    data-section="pets">
                                    🐾 Mis Mascotas
                                </button>
                                <button onclick="window.showSection('orders')" 
                                    class="nav-btn w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-600" 
                                    data-section="orders">
                                    📦 Pedidos
                                </button>
                                <button onclick="window.showSection('settings')" 
                                    class="nav-btn w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-600" 
                                    data-section="settings">
                                    ⚙️ Configuración
                                </button>
                            </nav>
                        </div>
                    </aside>

                    <!-- Content -->
                    <div class="flex-grow space-y-8">
                        <!-- Pets Section -->
                        <section id="section-pets" class="dashboard-section">
                            <div class="flex justify-between items-center">
                                <h2 class="text-2xl font-bold">Mis Mascotas</h2>
                                <div class="flex items-center gap-4">
                                    <span id="pet-count-indicator" class="text-sm text-gray-500">0/2 mascotas</span>
                                    <button id="btn-add-pet" onclick="window.openModal('modal-add-pet')" 
                                        class="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                        </svg>
                                        Nueva Mascota
                                    </button>
                                </div>
                            </div>
                            <div id="pets-grid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div class="glass rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] text-gray-400">
                                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mb-4"></div>
                                    <p>Cargando mascotas...</p>
                                </div>
                            </div>
                        </section>

                        <!-- Orders Section -->
                        <section id="section-orders" class="dashboard-section hidden">
                            <h2 class="text-2xl font-bold mb-6">Mis Pedidos</h2>
                            <div class="glass rounded-2xl p-6">
                                <p class="text-gray-500">Historial de collares y productos comprados.</p>
                                <div id="orders-list" class="mt-4">
                                    <p class="text-center text-gray-400 py-8">No tienes pedidos aún.</p>
                                </div>
                            </div>
                        </section>

                        <!-- Settings Section -->
                        <section id="section-settings" class="dashboard-section hidden">
                            <div id="settings-content"></div>
                        </section>
                    </div>
                </div>
            </div>
        `;
    },

    script(container, props) {
        this.loadSettingsContent();
        this.initializeNavigation();
    },

    loadSettingsContent() {
        const settingsContainer = document.getElementById('settings-content');
        if (!settingsContainer) return;

        settingsContainer.innerHTML = `
            <h2 class="text-2xl font-bold mb-6">Configuración y Planes</h2>

            <!-- Membership Card Container -->
            <div id="membership-card-container" class="mb-8"></div>

            <div class="glass rounded-2xl p-6">
                <h3 class="text-lg font-bold mb-4">Mejorar Plan</h3>
                <div id="dashboard-plans"></div>
            </div>
        `;

        this.loadDashboardPlans();
    },

    loadDashboardPlans() {
        const plansContainer = document.getElementById('dashboard-plans');
        if (!plansContainer) return;

        plansContainer.innerHTML = `
            <div class="text-center mb-8">
                <div class="inline-flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                    <span id="label-monthly" class="text-sm font-bold text-brand-green">Mensual</span>
                    <button onclick="window.toggleBillingCycle()" id="billing-toggle"
                        class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none">
                        <span id="billing-toggle-dot" class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
                    </button>
                    <span id="label-annual" class="text-sm font-medium text-gray-400">Anual <span class="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full ml-1">-20%</span></span>
                </div>
            </div>

            <div class="grid md:grid-cols-3 gap-6">
                <!-- Plans will be rendered here -->
                <div id="plans-grid"></div>
            </div>
        `;

        this.loadPlansGrid();
    },

    loadPlansGrid() {
        const plansGrid = document.getElementById('plans-grid');
        if (!plansGrid) return;

        const plans = [
            {
                id: 'gratis',
                name: 'Gratuito',
                price: '$0',
                period: 'USD',
                description: 'Prueba por 30 días',
                icon: '🌱',
                features: [
                    { text: 'Hasta 2 Mascotas', included: true },
                    { text: 'Alertas de Escaneo', included: false },
                    { text: 'Mapa de Tracking', included: false }
                ],
                button: { text: 'Plan Actual', disabled: true, class: 'bg-gray-100 text-gray-400' },
                cardClass: 'border border-gray-100 bg-white shadow-sm'
            },
            {
                id: 'basico',
                name: 'Básico',
                price: '$5',
                period: 'USD/mes',
                description: '',
                icon: '🛡️',
                badge: 'RECOMENDADO',
                features: [
                    { text: 'Hasta 2 Mascotas', included: true },
                    { text: 'Alertas Geográficas', included: true },
                    { text: 'Historial de Posiciones', included: true }
                ],
                button: { text: 'Seleccionar', action: 'handlePlanSelection', class: 'bg-brand-green text-white' },
                cardClass: 'border-2 border-brand-green ring-4 ring-green-50 bg-white shadow-xl'
            },
            {
                id: 'premium',
                name: 'Premium',
                price: '$10',
                period: 'USD/mes',
                description: '',
                icon: '💎',
                features: [
                    { text: 'Hasta 5 Mascotas', included: true },
                    { text: 'Alertas Multi-contacto', included: true },
                    { text: 'Soporte Prioritario', included: true },
                    { text: 'Perímetro de Seguridad', included: true },
                    { text: 'Historial Completo', included: true },
                    { text: 'Beneficios Exclusivos', included: true }
                ],
                button: { text: 'Seleccionar', action: 'handlePlanSelection', class: 'bg-white text-gray-900' },
                cardClass: 'border bg-gray-900 text-white shadow-lg overflow-hidden'
            }
        ];

        plansGrid.parentElement.innerHTML = plans.map(plan => `
            <div data-plan-card="${plan.id}" class="${plan.cardClass} rounded-2xl p-6 relative">
                ${plan.badge ? `<div class="absolute -top-4 right-6 bg-brand-green text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">${plan.badge}</div>` : ''}
                ${plan.id === 'premium' ? '<div class="absolute top-0 right-0 w-32 h-32 bg-brand-blue opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>' : ''}
                
                <div class="w-12 h-12 ${plan.id === 'premium' ? 'bg-white/10' : plan.id === 'basico' ? 'bg-green-50' : 'bg-gray-50'} rounded-xl flex items-center justify-center mb-4 text-2xl">
                    ${plan.icon}
                </div>
                
                <h4 class="font-bold ${plan.id === 'premium' ? 'text-white' : 'text-gray-900'}">${plan.name}</h4>
                <div class="flex items-baseline gap-1 mt-2">
                    <span class="text-3xl font-bold price-val" data-monthly="${plan.id === 'basico' ? '5' : plan.id === 'premium' ? '10' : '0'}" data-annual="${plan.id === 'basico' ? '50' : plan.id === 'premium' ? '100' : '0'}">${plan.price}</span>
                    <span class="text-sm font-normal ${plan.id === 'premium' ? 'text-gray-400' : 'text-gray-400'}">${plan.period}</span>
                    ${plan.description ? `<span class="text-xs ${plan.id === 'premium' ? 'text-gray-400' : 'text-gray-500'} mt-1 block">${plan.description}</span>` : ''}
                </div>
                
                <ul class="mt-6 space-y-3 text-sm ${plan.id === 'premium' ? 'text-gray-300' : 'text-gray-600'}">
                    ${plan.features.map(feature => `
                        <li class="flex items-center gap-2">
                            <svg class="w-4 h-4 ${feature.included ? (plan.id === 'premium' ? 'text-brand-blue' : 'text-brand-green') : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="${feature.included ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}"></path>
                            </svg>
                            ${feature.text}
                        </li>
                    `).join('')}
                </ul>
                
                <button onclick="${plan.button.action ? plan.button.action + '(\'' + plan.id + '\')' : ''}" 
                    class="w-full mt-8 py-3 rounded-xl ${plan.button.class} font-bold ${plan.button.disabled ? 'cursor-not-allowed' : 'transition-all hover:scale-[1.02]'}" 
                    ${plan.button.disabled ? 'disabled' : ''}>
                    ${plan.button.text}
                </button>
            </div>
        `).join('');
    },

    initializeNavigation() {
        // Update navigation active states
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.nav-btn').forEach(b => {
                    b.classList.remove('bg-blue-50', 'text-brand-blue');
                    b.classList.add('text-gray-600');
                });
                this.classList.add('bg-blue-50', 'text-brand-blue');
                this.classList.remove('text-gray-600');
            });
        });
    }
};
