
import { supabase } from './supabaseClient.js';
import { Auth } from './auth.js';
import { UI } from './ui.js';


export const Pets = {
    vaccineOptions: {
        perro: ['Parvovirus', 'Moquillo', 'Hepatitis', 'Leptospirosis', 'Rabia'],
        gato: ['Triple Felina', 'Leucemia Felina', 'Rabia']
    },

    selectedSpecies: 'perro', // Default
    maps: { add: null, edit: null },
    markers: { add: null, edit: null },
    coords: { add: { lat: -34.6037, lng: -58.3816 }, edit: { lat: -34.6037, lng: -58.3816 } },

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

        // Toggle address input in Add Modal
        document.getElementById('add-pet-same-address')?.addEventListener('change', (e) => {
            const container = document.getElementById('add-pet-address-container');
            if (e.target.checked) {
                container.classList.add('hidden');
            } else {
                container.classList.remove('hidden');
                this.initMap('add', 'add-pet-map');
            }
        });

        // Sync address with map in Add Modal
        document.getElementById('add-pet-address')?.addEventListener('blur', async (e) => {
            const addr = e.target.value;
            if (addr) {
                const coords = await this.geocode(addr);
                if (coords) this.setCoords('add', coords.lat, coords.lon);
            }
        });

        // Toggle address input in Edit Modal
        document.getElementById('edit-pet-same-address')?.addEventListener('change', (e) => {
            const container = document.getElementById('edit-pet-address-container');
            if (e.target.checked) {
                container.classList.add('hidden');
            } else {
                container.classList.remove('hidden');
                this.initMap('edit', 'edit-pet-map');
            }
        });

        // Sync address with map in Edit Modal
        document.getElementById('edit-pet-address')?.addEventListener('blur', async (e) => {
            const addr = e.target.value;
            if (addr) {
                const coords = await this.geocode(addr);
                if (coords) this.setCoords('edit', coords.lat, coords.lon);
            }
        });

        // Edit pet form handler
        const editPetForm = document.getElementById('edit-pet-form');
        editPetForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.updatePet(new FormData(editPetForm));
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

    renderVaccines(species, containerId = 'vaccines-container') {
        const container = document.getElementById(containerId);
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

            // Add event listeners for delete buttons
            grid.querySelectorAll('.delete-pet-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const petId = btn.dataset.petId;
                    this.deletePet(petId);
                });
            });

            // Add event listeners for edit buttons
            grid.querySelectorAll('.edit-pet-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const petId = btn.dataset.petId;
                    await this.openEditModal(petId);
                });
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
                <img src="${pet.photo_url}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" alt="${pet.name}">
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
                    <button class="p-2 rounded-xl border border-gray-200 hover:bg-blue-50 hover:text-blue-500 transition-colors edit-pet-btn" data-pet-id="${pet.id}" title="Editar">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button class="p-2 rounded-xl border border-gray-200 hover:bg-red-50 hover:text-red-500 transition-colors delete-pet-btn" data-pet-id="${pet.id}" title="Eliminar">
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

        // Handle photo upload to Cloudinary
        const photoFile = formData.get('photo');
        let photo_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`;

        if (photoFile && photoFile.size > 0) {
            try {
                // Convert to base64
                const base64 = await this.fileToBase64(photoFile);

                // Upload to Cloudinary
                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64 })
                });

                if (uploadResponse.ok) {
                    const { url } = await uploadResponse.json();
                    photo_url = url;
                } else {
                    console.error('Upload failed, using default avatar');
                }
            } catch (uploadError) {
                console.error('Photo upload error:', uploadError);
                UI.toast('Foto no pudo subirse, usando avatar por defecto', 'warning');
            }
        }

        const petData = {
            owner_id: Auth.user.id,
            name: name,
            species: species,
            breed: formData.get('breed'),
            birth_date: formData.get('birth_date'),
            weight: formData.get('weight'),
            vaccines: checkedVaccines,
            medical_info: formData.get('medical_info'),
            photo_url: photo_url
        };

        // Handle Address
        const useSameAddress = document.getElementById('add-pet-same-address').checked;
        if (useSameAddress) {
            // Get user address from profiles
            const { data: profile } = await supabase.from('profiles').select('address, latitude, longitude').eq('id', Auth.user.id).single();
            if (profile) {
                petData.address = profile.address;
                petData.latitude = profile.latitude;
                petData.longitude = profile.longitude;
            }
        } else {
            const customAddress = formData.get('address');
            petData.address = customAddress;
            // Use map coordinates if available/moved
            petData.latitude = this.coords.add.lat;
            petData.longitude = this.coords.add.lng;
        }

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

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    async openEditModal(petId) {
        try {
            // Find pet in already loaded data
            const { data: pets, error } = await supabase
                .from('pets')
                .select('*')
                .eq('id', petId)
                .eq('owner_id', Auth.user.id)
                .single();

            if (error) throw error;
            const pet = pets;

            // Populate form
            document.getElementById('edit-pet-id').value = pet.id;
            document.getElementById('edit-name').value = pet.name;
            document.getElementById('edit-breed').value = pet.breed || '';
            document.getElementById('edit-birth-date').value = pet.birth_date || '';
            document.getElementById('edit-weight').value = pet.weight || '';
            document.getElementById('edit-medical-info').value = pet.medical_info || '';

            // Set species
            if (pet.species === 'gato') {
                document.getElementById('edit-species-gato').checked = true;
            } else {
                document.getElementById('edit-species-perro').checked = true;
            }

            // Render vaccines for this species
            this.renderVaccines(pet.species, 'edit-vaccines-container');

            // Check existing vaccines
            if (pet.vaccines) {
                const existingVaccines = pet.vaccines.split(',').map(v => v.trim());
                setTimeout(() => {
                    document.querySelectorAll('#edit-vaccines-container input[type="checkbox"]').forEach(cb => {
                        if (existingVaccines.includes(cb.value)) {
                            cb.checked = true;
                        }
                    });
                }, 100);
            }

            // Show current photo
            if (pet.photo_url) {
                const preview = document.getElementById('edit-preview-photo');
                preview.src = pet.photo_url;
                preview.classList.remove('hidden');
            }

            // Population of address
            const sameAddrCheck = document.getElementById('edit-pet-same-address');
            const addrInput = document.getElementById('edit-pet-address');
            const addrContainer = document.getElementById('edit-pet-address-container');

            // Fetch user profile to compare
            const { data: profile } = await supabase.from('profiles').select('address').eq('id', Auth.user.id).single();

            if (pet.address === profile?.address) {
                sameAddrCheck.checked = true;
                addrContainer.classList.add('hidden');
            } else {
                sameAddrCheck.checked = false;
                addrContainer.classList.remove('hidden');
                addrInput.value = pet.address || '';
                // Init map for edit with pet coords
                if (pet.latitude && pet.longitude) {
                    this.coords.edit = { lat: pet.latitude, lng: pet.longitude };
                }
                setTimeout(() => this.initMap('edit', 'edit-pet-map'), 100);
            }

            // Open modal
            window.openModal('modal-edit-pet');

        } catch (error) {
            console.error('Error loading pet:', error);
            UI.toast('Error al cargar mascota: ' + error.message, 'error');
        }
    },

    async updatePet(formData) {
        const petId = formData.get('pet_id');
        const name = formData.get('name');
        const species = formData.get('species');

        // Collect checked vaccines
        const checkedVaccines = Array.from(document.querySelectorAll('#edit-vaccines-container input[name="vaccine_opt"]:checked'))
            .map(cb => cb.value)
            .join(', ');

        // Handle photo upload
        const photoFile = formData.get('photo');
        let photo_url = null;

        if (photoFile && photoFile.size > 0) {
            try {
                const base64 = await this.fileToBase64(photoFile);
                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64 })
                });

                if (uploadResponse.ok) {
                    const { url } = await uploadResponse.json();
                    photo_url = url;
                }
            } catch (uploadError) {
                console.error('Photo upload error:', uploadError);
            }
        }

        const petData = {
            name: name,
            species: species,
            breed: formData.get('breed'),
            birth_date: formData.get('birth_date'),
            weight: formData.get('weight'),
            vaccines: checkedVaccines,
            medical_info: formData.get('medical_info')
        };

        // Handle Address
        const sameAddrCheck = document.getElementById('edit-pet-same-address');
        const useSameAddress = sameAddrCheck ? sameAddrCheck.checked : false;

        if (useSameAddress) {
            const { data: profile } = await supabase.from('profiles').select('address, latitude, longitude').eq('id', Auth.user.id).single();
            if (profile) {
                petData.address = profile.address;
                petData.latitude = profile.latitude;
                petData.longitude = profile.longitude;
            }
        } else {
            const customAddress = formData.get('address');
            petData.address = customAddress;
            petData.latitude = this.coords.edit.lat;
            petData.longitude = this.coords.edit.lng;
        }

        // Only update photo if new one was uploaded
        if (photo_url) {
            petData.photo_url = photo_url;
        }

        try {
            // Get session token
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw new Error('No hay sesión activa');
            }

            const response = await fetch(`/api/pets?id=${petId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(petData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al actualizar');
            }

            UI.toast('Mascota actualizada correctamente');
            UI.closeModal('modal-edit-pet');
            this.loadPets();

        } catch (error) {
            console.error('Error updating pet:', error);
            UI.toast('Error al actualizar mascota: ' + error.message, 'error');
        }
    },

    async deletePet(id) {
        if (!confirm('¿Estás seguro de eliminar esta mascota? Esta acción es "lógica" y los datos se mantendrán internamente.')) return;

        try {
            // Get current session token
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw new Error('No hay sesión activa');
            }

            const response = await fetch(`/api/pets?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al eliminar');
            }

            UI.toast('Mascota eliminada correctamente');
            this.loadPets();

        } catch (error) {
            console.error(error);
            UI.toast('Error al eliminar: ' + error.message, 'error');
        }
    },

    initMap(type, containerId) {
        const coords = this.coords[type];
        if (this.maps[type]) {
            this.maps[type].setView([coords.lat, coords.lng], 15);
            this.markers[type].setLatLng([coords.lat, coords.lng]);
            setTimeout(() => this.maps[type].invalidateSize(), 150);
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) return;

        this.maps[type] = L.map(containerId).setView([coords.lat, coords.lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.maps[type]);

        this.markers[type] = L.marker([coords.lat, coords.lng], {
            draggable: true
        }).addTo(this.maps[type]);

        this.markers[type].on('dragend', () => {
            const pos = this.markers[type].getLatLng();
            this.coords[type] = { lat: pos.lat, lng: pos.lng };
        });

        this.maps[type].on('click', (e) => {
            this.markers[type].setLatLng(e.latlng);
            this.coords[type] = { lat: e.latlng.lat, lng: e.latlng.lng };
        });

        setTimeout(() => this.maps[type].invalidateSize(), 300);
    },

    setCoords(type, lat, lng) {
        if (lat === undefined || lat === null || lng === undefined || lng === null) return;
        this.coords[type] = { lat: parseFloat(lat), lng: parseFloat(lng) };
        if (this.maps[type]) {
            this.maps[type].setView([this.coords[type].lat, this.coords[type].lng], 15);
            this.markers[type].setLatLng([this.coords[type].lat, this.coords[type].lng]);
        }
    },

    async geocode(address) {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await res.json();
            if (data.length > 0) {
                return { lat: data[0].lat, lon: data[0].lon };
            }
        } catch (e) {
            console.error('Geocoding error:', e);
        }
        return null;
    }
};

