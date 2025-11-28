/**
 * Application constants
 */

export const EXPENSE_CATEGORIES = [
    'Food',
    'Transport',
    'Housing',
    'Utilities',
    'Entertainment',
    'Health',
    'Shopping',
    'Bills',
    'Other'
];

export const SUPPORTED_CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' }
];

export const QUERY_TIMEOUTS = {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 10000
};

export const RETRY_CONFIG = {
    MAX_RETRIES: 3,
    INITIAL_DELAY: 1000,
    MAX_DELAY: 8000
};

export const CACHE_DURATION = {
    EXPENSES: 5 * 60 * 1000, // 5 minutes
    PROFILE: 10 * 60 * 1000,  // 10 minutes
    STATS: 2 * 60 * 1000      // 2 minutes
};
