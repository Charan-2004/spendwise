/**
 * Currency formatting utilities
 */

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (USD, EUR, etc.)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD'
        }).format(amount);
    } catch (error) {
        console.error('Currency formatting error:', error);
        return `$${amount.toFixed(2)}`;
    }
};

/**
 * Get currency symbol for a given currency code
 * @param {string} currency - Currency code (USD, EUR, etc.)
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency = 'USD') => {
    try {
        const parts = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD'
        }).formatToParts(0);

        const symbolPart = parts.find(part => part.type === 'currency');
        return symbolPart?.value || '$';
    } catch (error) {
        console.error('Currency symbol error:', error);
        return '$';
    }
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string like "$1,234.56"
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString) => {
    if (typeof currencyString === 'number') return currencyString;
    const cleaned = String(currencyString).replace(/[^0-9.-]+/g, '');
    return parseFloat(cleaned) || 0;
};
