
import { supabase } from './supabaseClient.js';
import { Auth } from './auth.js';
import { UI } from './ui.js';

export const Pets = {
    async init() {
        this.bindEvents();
    },

    bindEvents() {
        const addPetForm = document.getElementById('add-pet-form');
        addPetForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addPet(new FormData(addPetForm));
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

    async loadPets() {
        const grid = document.getElementById('pets-grid');
        if (!grid) return;

        grid.innerHTML = '<div class="glass col-span-full rounded-2xl p-8 text-center flex flex-col items-center justify-center text-gray-400"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mb-4"></div><p>Cargando mascotas...</p></div>';

        try {
            const { data: pets, error } = await supabase
                .from('pets')
                .select('*')
                .eq('owner_id', Auth.user.id)
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

        div.innerHTML = `
            <div class="h-48 overflow-hidden relative">
                <img src="${pet.photo_url || `https://ui-avatars.com/api/?name=${pet.name}&background=random`}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500">
                ${pet.is_premium ? '<div class="absolute top-4 right-4 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">PREMIUM</div>' : ''}
            </div>
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-2xl font-bold text-gray-900">${pet.name}</h3>
                        <p class="text-sm text-gray-500">Registrado el ${new Date(pet.created_at).toLocaleDateString()}</p>
                    </div>
                    
                </div>
                
                <div class="flex gap-2 mt-4">
                    <a href="${qrUrl}" target="_blank" class="flex-1 text-center py-2 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors text-sm">
                        Ver Perfil QR
                    </a>
                    <button class="p-2 rounded-xl border border-gray-200 hover:bg-red-50 hover:text-red-500 transition-colors" onclick="alert('TODO: Delete logic')">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
        `;
        return div;
    },

    async addPet(formData) {
        const btnSubmit = document.querySelector('#add-pet-form button[type="submit"]');

        // TODO: Implement actual image upload to Cloudinary or via Backend
        // For now we will just use a placeholder if an image is selected, or let it be null
        // Real implementation should send file to backend endpoint

        const petData = {
            owner_id: Auth.user.id,
            name: formData.get('name'),
            medical_info: formData.get('medical_info'),
            photo_url: null
        };

        try {
            UI.setLoading(true, btnSubmit.id || 'btn-submit-pet'); // Needs ID on button

            // Insert into Supabase
            const { data, error } = await supabase
                .from('pets')
                .insert([petData])
                .select();

            if (error) throw error;

            UI.toast('Mascota agregada correctamente');
            UI.closeModal('modal-add-pet');
            document.getElementById('add-pet-form').reset();
            document.getElementById('preview-photo').classList.add('hidden');

            this.loadPets();

        } catch (error) {
            UI.toast('Error al agregar mascota: ' + error.message, 'error');
        } finally {
            // Restore button state (need to ensure button has ID or select it correctly)
            const btn = document.querySelector('#add-pet-form button[type="submit"]');
            btn.innerHTML = 'Guardar';
            btn.disabled = false;
        }
    }
};
