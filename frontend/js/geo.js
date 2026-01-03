
// Geolocation Utilities for Dashboard (Owner View)

export const Geo = {
    // Determine map provider (Google Maps or Leaflet)
    // For this project, we prioritize Leaflet as it's free/easy, but can link to Google Maps

    getGoogleMapsLink(lat, lng) {
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    },

    async reverseGeocode(lat, lng) {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            return data.display_name || `${lat}, ${lng}`;
        } catch (e) {
            return `${lat}, ${lng}`;
        }
    }
};
