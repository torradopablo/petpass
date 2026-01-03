
import { supabase } from './supabaseClient.js';
import { Auth } from './auth.js';
import { UI } from './ui.js';


export const Pets = {
    vaccineOptions: {
        perro: ['Parvovirus', 'Moquillo', 'Hepatitis', 'Leptospirosis', 'Rabia'],
        gato: ['Triple Felina', 'Leucemia Felina', 'Rabia']
    },

    selectedSpecies: 'perro', // Default

    async init() {
        this.bindEvents();
        this.renderVaccines('perro'); // Initial render
    },

    bindEvents() {
        const addPetForm = document.getElementById('add-pet-form');
        addPetForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addPet(new FormData(addPetForm));
        });

        // Species change listener
        window.addEventListener('species-change', (e) => {
            this.selectedSpecies = e.detail;
            this.renderVaccines(e.detail);
        });

        // Image preview
        const fileInput = addPetForm?.querySelector('input[type="file"]');
        const imgPreview = document.getElementById('preview-photo');

        fileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imgPreview.src = e.target.result;
                    imgPreview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    },

    renderVaccines(species) {
        const container = document.getElementById('vaccines-container');
        if (!container) return;

        const vaccines = this.vaccineOptions[species] || [];

        container.innerHTML = vaccines.map(v => `
            <label class="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <span class="text-gray-700 font-medium">${v}</span>
                <div class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="vaccine_opt" value="${v}" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </div>
            </label>
        `).join('');
    },

    async loadPets() {
        const grid = document.getElementById('pets-grid');
        if (!grid) return;

        grid.innerHTML = '<div class="glass col-span-full rounded-2xl p-8 text-center flex flex-col items-center justify-center text-gray-400"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mb-4"></div><p>Cargando mascotas...</p></div>';

        try {
            const { data: pets, error } = await supabase
                .from('pets')
                .select('*')
                .eq('owner_id', Auth.user.id)
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (error) throw error;

            grid.innerHTML = '';

            if (pets.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-12 glass rounded-2xl">
                        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 mb-2">No tienes mascotas registradas</h3>
                        <p class="text-gray-500 mb-6">Agrega a tu primera mascota para protegerla.</p>
                        <button onclick="document.querySelector('button[onclick=\\'openModal(\\'modal-add-pet\\')\\']').click()" class="text-brand-green font-bold hover:underline">Agregar Mascota</button>
                    </div>
                `;
                return;
            }

            pets.forEach(pet => {
                grid.appendChild(this.createPetCard(pet));
            });

        } catch (error) {
            console.error(error);
            grid.innerHTML = '<p class="text-red-500 text-center col-span-full">Error al cargar mascotas.</p>';
        }
    },

    createPetCard(pet) {
        const div = document.createElement('div');
        div.className = 'glass rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all group';

        const qrUrl = `${window.location.origin}/pet.html?id=${pet.id}`;
        const speciesIcon = pet.species === 'gato' ? '🐱' : '🐶';

        // Calculate Age
        let ageDisplay = 'Edad desconocida';
        if (pet.birth_date) {
            const birth = new Date(pet.birth_date);
            const today = new Date();
            let years = today.getFullYear() - birth.getFullYear();
            let months = today.getMonth() - birth.getMonth();
            if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
                years--;
                months += 12;
            }
            if (years > 0) ageDisplay = `${years} años`;
            else ageDisplay = `${months} meses`;
        }

        const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}`;

        div.innerHTML = `
            <div class="h-48 overflow-hidden relative">
                <img src="${pet.photo_url || `https://ui-avatars.com/api/?name=${pet.name}&background=random`}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500">
                ${pet.is_premium ? '<div class="absolute top-4 right-4 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">PREMIUM</div>' : ''}
                <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xl shadow-sm">
                    ${speciesIcon}
                </div>
            </div>
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-2xl font-bold text-gray-900">${pet.name}</h3>
                        <p class="text-sm text-gray-500">${pet.breed || 'Sin raza'} • ${ageDisplay}</p>
                    </div>
                </div>

                <!-- Expanded QR View (Hidden by default) -->
                <div id="qr-view-${pet.id}" class="hidden mb-4 text-center bg-white p-4 rounded-xl border border-gray-100 shadow-inner">
                    <img src="${qrImgUrl}" class="mx-auto rounded-lg mb-2" alt="QR Code">
                    <p class="text-xs text-gray-400 break-all">${qrUrl}</p>
                </div>
                
                <div class="flex gap-2 mt-4">
                    <button onclick="document.getElementById('qr-view-${pet.id}').classList.toggle('hidden')" class="flex-1 text-center py-2 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors text-sm flex items-center justify-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                        Ver QR
                    </button>
                    <a href="${qrUrl}" target="_blank" class="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors" title="Abrir enlace">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                    <button class="p-2 rounded-xl border border-gray-200 hover:bg-red-50 hover:text-red-500 transition-colors" onclick="import('./pets.js').then(m => m.Pets.deletePet('${pet.id}'))">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
        `;
        return div;
    },

    async addPet(formData) {
        const btnSubmit = document.querySelector('#add-pet-form button[type="submit"]');
        const name = formData.get('name');
        const species = this.selectedSpecies;

        // Collect Checked Vaccines
        const checkedVaccines = Array.from(document.querySelectorAll('input[name="vaccine_opt"]:checked'))
            .map(cb => cb.value)
            .join(', ');

        const photo_url = `https://ui-avatars.com/api/?name=${name}&background=random&size=200`;

        const petData = {
            owner_id: Auth.user.id,
            name: name,
            species: species,
            breed: formData.get('breed'),
            birth_date: formData.get('birth_date'),
            weight: formData.get('weight'),
            vaccines: checkedVaccines, // Send as comma separated string
            medical_info: formData.get('medical_info'),
            photo_url: photo_url
        };

        try {
            UI.setLoading(true, btnSubmit.id || 'btn-submit-pet');

            const { data, error } = await supabase
                .from('pets')
                .insert([petData])
                .select();

            if (error) throw error;

            UI.toast('Mascota agregada correctamente');
            UI.closeModal('modal-add-pet');
            document.getElementById('add-pet-form').reset();
            const preview = document.getElementById('preview-photo');
            if (preview) preview.classList.add('hidden');

            // Reset to default
            this.selectedSpecies = 'perro';
            this.renderVaccines('perro');

            this.loadPets();

        } catch (error) {
            UI.toast('Error al agregar mascota: ' + error.message, 'error');
        } finally {
            const btn = document.querySelector('#add-pet-form button[type="submit"]');
            if (btn) {
                btn.innerHTML = 'Guardar';
                btn.disabled = false;
            }
        }
    },

    async deletePet(id) {
        if (!confirm('¿Estás seguro de eliminar esta mascota? Esta acción es "lógica" y los datos se mantendrán internamente.')) return;

        try {
            const { error } = await supabase
                .from('pets')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            UI.toast('Mascota eliminada correctamente');
            this.loadPets();

        } catch (error) {
            console.error(error);
            UI.toast('Error al eliminar: ' + error.message, 'error');
        }
    }
};

