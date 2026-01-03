
export const Settings = {
    map: null,
    marker: null,
    coords: { lat: -34.6037, lng: -58.3816 }, // Default Buenos Aires

    initMap() {
        if (!window.L) {
            console.error('Leaflet not loaded');
            return;
        }

        const mapContainer = document.getElementById('settings-map');
        if (!mapContainer) return;

        if (this.map) {
            console.log('Settings Map already exists, re-centering to:', this.coords);
            this.map.setView([this.coords.lat, this.coords.lng], 15);
            this.marker.setLatLng([this.coords.lat, this.coords.lng]);
            // Force invalidateSize to fix leaflet rendering issues in hidden containers
            setTimeout(() => {
                this.map.invalidateSize();
            }, 100);
            return;
        }

        console.log('Initializing Settings Map with coords:', this.coords);
        this.map = L.map('settings-map', {
            zoomControl: true,
            scrollWheelZoom: false
        }).setView([this.coords.lat, this.coords.lng], 15);

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

        // Trigger resize fix after a delay to ensure container is fully visible
        setTimeout(() => {
            this.map.invalidateSize();
        }, 500);
    },

    setCoords(lat, lng) {
        if (lat === undefined || lat === null || lng === undefined || lng === null) return;
        const newCoords = { lat: parseFloat(lat), lng: parseFloat(lng) };

        // Only update and re-center if they actually changed (or map is not yet centered)
        if (Math.abs(this.coords.lat - newCoords.lat) > 0.0001 || Math.abs(this.coords.lng - newCoords.lng) > 0.0001) {
            this.coords = newCoords;
            console.log('Settings coords updated to:', this.coords);
            if (this.map) {
                this.map.setView([this.coords.lat, this.coords.lng], 15);
                this.marker.setLatLng([this.coords.lat, this.coords.lng]);
            }
        }
    }
};
