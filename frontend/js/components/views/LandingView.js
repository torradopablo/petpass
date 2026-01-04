// Landing View Component
export const LandingView = {
    async render(props = {}) {
        return `
            <!-- Hero Section -->
            <section class="relative pt-20 pb-32 overflow-hidden hero-bg">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div class="grid lg:grid-cols-2 gap-12 items-center">
                        <div class="text-center lg:text-left">
                            <h1 class="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
                                Identificación <br>
                                <span class="gradient-text">Inteligente</span> para tu Mascota
                            </h1>
                            <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                PetPass es el sistema más avanzado de Argentina para proteger a quien más amas. QR, GPS
                                y perfil médico en un solo lugar.
                            </p>
                            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button onclick="document.getElementById('btn-login').click()"
                                    class="px-8 py-4 rounded-full bg-gradient-to-r from-brand-green to-brand-teal text-white font-bold text-lg shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transition-all transform hover:-translate-y-1">
                                    Comenzar Ahora
                                </button>
                                <button onclick="window.showView('about')"
                                    class="px-8 py-4 rounded-full bg-white text-gray-700 font-bold text-lg shadow-sm border border-gray-100 hover:bg-gray-50 transition-all">
                                    Saber más
                                </button>
                            </div>
                        </div>
                        <div class="relative">
                            <!-- Hero Image -->
                            <div class="relative glass rounded-3xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                                <div class="aspect-w-4 aspect-h-3 bg-gray-200 rounded-2xl overflow-hidden relative">
                                    <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                        alt="Dog with PetPass" class="object-cover w-full h-full">
                                </div>
                                <div class="mt-4 flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="font-bold text-gray-900">Mascota Protegida</p>
                                            <p class="text-sm text-gray-500">Estado: Activo</p>
                                        </div>
                                    </div>
                                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Premium</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Features Section -->
            <section id="features" class="py-20 bg-white">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center mb-16">
                        <h2 class="text-4xl lg:text-5xl font-bold mb-6">Características <span class="gradient-text">Inteligentes</span></h2>
                        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                            Tecnología de vanguardia diseñada para proteger a tu mascota con la máxima eficiencia y tranquilidad.
                        </p>
                    </div>

                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <!-- Features will be rendered here -->
                        <div id="features-grid"></div>
                    </div>
                </div>
            </section>

            <!-- Premium Section -->
            <section id="premium" class="py-20 bg-gray-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div id="premium-plans"></div>
                </div>
            </section>
        `;
    },

    script(container, props) {
        // Cargar componentes dinámicamente
        this.loadFeatures();
        this.loadPremiumPlans();
    },

    loadFeatures() {
        const featuresGrid = document.getElementById('features-grid');
        if (!featuresGrid) return;

        const features = [
            {
                icon: '📱',
                title: 'QR Inteligente',
                description: 'Escaneable con cualquier smartphone. Sin necesidad de apps especiales.',
                benefits: ['Acceso instantáneo al perfil', 'Compatible con todos los dispositivos'],
                gradient: 'from-brand-green to-brand-teal'
            },
            {
                icon: '📍',
                title: 'Geolocalización',
                description: 'Recibe alertas inmediatas con mapa cuando alguien escanea el QR.',
                benefits: ['Notificaciones por email', 'Mapa de última ubicación'],
                gradient: 'from-brand-blue to-brand-teal'
            },
            {
                icon: '🏥',
                title: 'Perfil Médico',
                description: 'Información médica importante siempre disponible para emergencias.',
                benefits: ['Alergias y medicamentos', 'Contactos de emergencia'],
                gradient: 'from-purple-500 to-brand-blue'
            },
            {
                icon: '🔄',
                title: 'Actualización Remota',
                description: 'Modifica la información sin necesidad de cambiar la chapita.',
                benefits: ['Cambios en tiempo real', 'Sin costos adicionales'],
                gradient: 'from-orange-500 to-red-500'
            },
            {
                icon: '🤝',
                title: 'Red de Ayuda',
                description: 'Conecta instantáneamente con quien encuentra tu mascota.',
                benefits: ['Comunicación directa', 'Protección de privacidad'],
                gradient: 'from-pink-500 to-purple-500'
            },
            {
                icon: '💪',
                title: 'Máxima Durabilidad',
                description: 'Chapitas resistentes al agua diseñadas para durar toda la vida.',
                benefits: ['Material premium', 'Garantía de por vida'],
                gradient: 'from-gray-600 to-gray-800'
            }
        ];

        featuresGrid.innerHTML = features.map(feature => `
            <div class="group">
                <div class="glass p-8 rounded-3xl h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div class="w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 text-2xl group-hover:scale-110 transition-transform">
                        ${feature.icon}
                    </div>
                    <h3 class="text-2xl font-bold mb-4">${feature.title}</h3>
                    <p class="text-gray-600 leading-relaxed mb-4">${feature.description}</p>
                    <ul class="space-y-2 text-sm text-gray-500">
                        ${feature.benefits.map(benefit => `
                            <li class="flex items-center gap-2">
                                <span class="w-1.5 h-1.5 bg-current rounded-full"></span>
                                ${benefit}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    },

    loadPremiumPlans() {
        const premiumContainer = document.getElementById('premium-plans');
        if (!premiumContainer) return;

        premiumContainer.innerHTML = `
            <div class="text-center mb-16">
                <h2 class="text-4xl lg:text-5xl font-bold mb-6">Planes <span class="gradient-text">Premium</span></h2>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                    Elige el plan perfecto para proteger a tu mascota con la máxima tranquilidad y funcionalidades avanzadas.
                </p>
            </div>

            <div class="text-center mb-12">
                <div class="inline-flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                    <span id="label-monthly" class="text-sm font-bold text-brand-green">Mensual</span>
                    <button onclick="window.toggleBillingCycle()" id="billing-toggle"
                        class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none">
                        <span id="billing-toggle-dot"
                            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
                    </button>
                    <span id="label-annual" class="text-sm font-medium text-gray-400">Anual <span
                            class="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full ml-1">-20%</span></span>
                </div>
            </div>

            <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
    }
};
