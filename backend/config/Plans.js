
const Plans = {
    GRATIS: {
        id: 'gratis',
        name: 'Plan Gratuito (Trial)',
        maxPets: 2,
        features: {
            scanAlerts: false,
            trackingMap: false
        },
        priceUSD: 0
    },
    BASICO: {
        id: 'basico',
        name: 'Plan Básico',
        maxPets: 2,
        features: {
            scanAlerts: true,
            trackingMap: true
        },
        priceUSD: {
            monthly: 5,
            annual: 50
        }
    },
    PREMIUM: {
        id: 'premium',
        name: 'Plan Premium',
        maxPets: 5,
        features: {
            scanAlerts: true,
            trackingMap: true
        },
        priceUSD: {
            monthly: 10,
            annual: 100
        }
    }
};

module.exports = Plans;
