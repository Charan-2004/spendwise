const BASE_URL = 'https://open.er-api.com/v6/latest';

class CurrencyService {
    constructor() {
        this.rates = null;
        this.lastFetch = 0;
        this.base = 'USD';
    }

    async fetchRates(base = 'USD') {
        // DISABLED FOR PERFORMANCE - API is too slow (50+ seconds timeout)
        // Return cached rates if less than 1 hour old and base matches
        // const now = Date.now();
        // if (this.rates && this.base === base && (now - this.lastFetch) < 3600000) {
        //     return this.rates;
        // }

        // try {
        //     const response = await fetch(`${BASE_URL}/${base}`);
        //     const data = await response.json();

        //     if (data.result === 'success') {
        //         this.rates = data.rates;
        //         this.lastFetch = now;
        //         this.base = base;
        //         return this.rates;
        //     } else {
        //         throw new Error('Failed to fetch rates');
        //     }
        // } catch (error) {
        //     console.error('Error fetching currency rates:', error);

        // Fallback to basic rates - using static rates for performance
        return {
            USD: 1,
            EUR: 0.92,
            GBP: 0.79,
            JPY: 150.0,
            CAD: 1.35,
            AUD: 1.52,
            INR: 83.5
        };
        // }
    }

    async convert(amount, from, to) {
        if (from === to) return amount;

        const rates = await this.fetchRates(from);
        const rate = rates[to];

        if (!rate) {
            console.warn(`Exchange rate not found for ${from} to ${to}`);
            return amount;
        }

        return amount * rate;
    }

    getAvailableCurrencies() {
        return [
            { code: 'USD', symbol: '$', name: 'US Dollar' },
            { code: 'EUR', symbol: '€', name: 'Euro' },
            { code: 'GBP', symbol: '£', name: 'British Pound' },
            { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
            { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
            { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
            { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
        ];
    }
}

export const currencyService = new CurrencyService();
