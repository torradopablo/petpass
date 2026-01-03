
import { supabase } from './supabaseClient.js';

// Get Pet ID from URL
const params = new URLSearchParams(window.location.search);
const petId = params.get('id');

async function initProfile() {
    const elLoading = document.getElementById('loading');
    const elCard = document.getElementById('profile-card');
    const elNotFound = document.getElementById('not-found');

    try {
        if (!petId) {
            elLoading.style.display = 'none';
            elNotFound.classList.remove('hidden');
            throw new Error('No pet ID provided');
        }

        // Fetch pet data
        const { data: pet, error } = await supabase
            .from('pets')
            .select(`
                *,
                profiles:owner_id ( full_name, phone, email )
            `)
            .eq('id', petId)
            .is('deleted_at', null)
            .single();

        if (error || !pet) throw new Error('Pet not found');

        // Render Data
        document.getElementById('pet-name').textContent = pet.name;
        document.getElementById('pet-photo').src = pet.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(pet.name)}`;
        document.getElementById('pet-info').textContent = pet.medical_info || 'Sin información adicional.';

        // Species
        const speciesIcon = pet.species === 'gato' ? '🐱 Gato' : '🐶 Perro';
        document.getElementById('pet-species').textContent = speciesIcon;

        // Breed
        document.getElementById('pet-breed').textContent = pet.breed || 'Sin especificar';

        // Weight
        document.getElementById('pet-weight').textContent = pet.weight || 'Sin especificar';

        // Calc Age
        if (pet.birth_date) {
            const birth = new Date(pet.birth_date);
            const today = new Date();
            let years = today.getFullYear() - birth.getFullYear();
            let months = today.getMonth() - birth.getMonth();
            if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
                years--;
                months += 12;
            }
            const ageText = years > 0 ? `${years} años` : `${months} meses`;
            document.getElementById('pet-age').textContent = ageText;
        } else if (pet.age) {
            document.getElementById('pet-age').textContent = pet.age + ' años';
        } else {
            document.getElementById('pet-age').textContent = 'Sin especificar';
        }

        // Vaccines
        if (pet.vaccines && pet.vaccines.trim()) {
            const vaccinesArray = pet.vaccines.split(',').map(v => v.trim()).filter(v => v);
            if (vaccinesArray.length > 0) {
                const vaccinesContainer = document.getElementById('pet-vaccines');
                vaccinesContainer.innerHTML = vaccinesArray.map(vaccine =>
                    `<span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">${vaccine}</span>`
                ).join('');
                document.getElementById('pet-vaccines-section').classList.remove('hidden');
            }
        }

        if (pet.is_premium) {
            document.getElementById('pet-premium-badge').classList.remove('hidden');
        }

        // WhatsApp / Phone Links
        const phone = pet.profiles?.phone;
        if (phone) {
            document.getElementById('btn-call').href = `tel:${phone}`;
            document.getElementById('btn-whatsapp').href = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=Hola, escaneé el código QR de ${pet.name} y creo que lo encontré.`;
        } else {
            // Disable buttons if no phone
            document.getElementById('btn-call').classList.add('opacity-50', 'pointer-events-none');
            document.getElementById('btn-whatsapp').classList.add('opacity-50', 'pointer-events-none');
        }

        elLoading.style.display = 'none';
        elCard.classList.remove('hidden');

        // Request Geolocation and Notify Owner
        requestLocation(pet.id);

    } catch (error) {
        console.error('Error loading pet profile:', error);
        elLoading.style.display = 'none';
        elNotFound.classList.remove('hidden');
        const errEl = document.getElementById('error-text');
        if (errEl) errEl.textContent = error.message || 'Mascota no encontrada';
    }
}

async function requestLocation(petId) {
    if (!navigator.geolocation) {
        sendScanNotification(petId);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await sendScanNotification(petId, latitude, longitude);
            showMap(latitude, longitude);
        },
        async (error) => {
            console.log('Location denied or error', error);
            await sendScanNotification(petId);
        },
        { timeout: 10000, maximumAge: 60000 }
    );
}

async function sendScanNotification(petId, latitude = null, longitude = null) {
    try {
        const body = { pet_id: petId };
        if (latitude && longitude) {
            body.latitude = latitude;
            body.longitude = longitude;
        }

        // Use /api/scans which handles distance and maps
        await fetch('/api/scans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    } catch (err) {
        console.error('Error sending scan notification:', err);
    }
}

function showMap(lat, lng) {
    const container = document.getElementById('map-container');
    if (!container) return;

    container.classList.remove('hidden');
    const map = L.map('map-container').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([lat, lng]).addTo(map)
        .bindPopup('Ubicación del escaneo')
        .openPopup();
}

// Start
initProfile();
