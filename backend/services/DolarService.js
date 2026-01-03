
class DolarService {
    constructor() {
        this.apiUrl = 'https://dolarapi.com/v1/dolares/blue'; // Using Dolar Blue for common pricing
        this.cache = null;
        this.lastFetch = null;
        this.cacheDuration = 1000 * 60 * 60; // 1 hour cache
    }

    async getExchangeRate() {
        if (this.cache && (Date.now() - this.lastFetch < this.cacheDuration)) {
            return this.cache;
        }

        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) throw new Error('Error fetching exchange rate');
            const data = await response.json();

            // Return 'compra' or 'venta' average, usually 'venta' is used for pricing
            this.cache = data.venta;
            this.lastFetch = Date.now();
            return this.cache;
        } catch (error) {
            console.error('DolarService Error:', error);
            // Fallback to a safe hardcoded rate if the API fails
            return 1100;
        }
    }

    async convertUsdToArs(amountUsd) {
        const rate = await this.getExchangeRate();
        return Math.round(amountUsd * rate);
    }
}

module.exports = new DolarService();
