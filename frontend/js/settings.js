
export const Settings = {
    map: null,
    marker: null,
    coords: { lat: -34.6037, lng: -58.3816 }, // Default Buenos Aires

    initMap() {
        if (this.map) {
            // Force invalidateSize to fix leaflet rendering issues in hidden containers
            setTimeout(() => this.map.invalidateSize(), 100);
            return;
        }

        console.log('Initializing Settings Map');
        this.map = L.map('settings-map').setView([this.coords.lat, this.coords.lng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.marker = L.marker([this.coords.lat, this.coords.lng], {
            draggable: true
        }).addTo(this.map);

        this.marker.on('dragend', () => {
            const pos = this.marker.getLatLng();
            this.coords = { lat: pos.lat, lng: pos.lng };
            console.log('Marker dragged to:', this.coords);
        });

        this.map.on('click', (e) => {
            this.marker.setLatLng(e.latlng);
            this.coords = { lat: e.latlng.lat, lng: e.latlng.lng };
            console.log('Map clicked at:', this.coords);
        });

        // Fix for rendering in potential HIDDEN state
        setTimeout(() => this.map.invalidateSize(), 200);
    },

    setCoords(lat, lng) {
        if (!lat || !lng) return;
        this.coords = { lat: parseFloat(lat), lng: parseFloat(lng) };
        if (this.map) {
            this.map.setView([this.coords.lat, this.coords.lng], 15);
            this.marker.setLatLng([this.coords.lat, this.coords.lng]);
        }
    }
};
