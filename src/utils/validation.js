/**
 * Input validation utilities
 */

/**
 * Validate expense data
 * @param {Object} data - Expense data to validate
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateExpense = (data) => {
    const errors = {};

    // Title validation
    if (!data.title?.trim()) {
        errors.title = 'Title is required';
    } else if (data.title.length > 100) {
        errors.title = 'Title must be less than 100 characters';
    }

    // Amount validation
    if (!data.amount && data.amount !== 0) {
        errors.amount = 'Amount is required';
    } else if (isNaN(data.amount)) {
        errors.amount = 'Amount must be a valid number';
    } else if (Number(data.amount) <= 0) {
        errors.amount = 'Amount must be greater than 0';
    } else if (Number(data.amount) > 1000000000) {
        errors.amount = 'Amount is too large';
    }

    // Category validation
    const validCategories = ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Savings', 'Other', 'Bills'];
    if (!data.category) {
        errors.category = 'Category is required';
    } else if (!validCategories.includes(data.category)) {
        errors.category = 'Invalid category';
    }

    // Date validation
    if (!data.date) {
        errors.date = 'Date is required';
    } else {
        const date = new Date(data.date);
        if (isNaN(date.getTime())) {
            errors.date = 'Invalid date';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate profile data
 * @param {Object} data - Profile data to validate
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateProfile = (data) => {
    const errors = {};

    // Full name validation
    if (data.full_name && data.full_name.length > 100) {
        errors.full_name = 'Name must be less than 100 characters';
    }

    // Monthly income validation
    if (data.monthly_income !== undefined && data.monthly_income !== null) {
        if (isNaN(data.monthly_income)) {
            errors.monthly_income = 'Income must be a valid number';
        } else if (Number(data.monthly_income) < 0) {
            errors.monthly_income = 'Income cannot be negative';
        } else if (Number(data.monthly_income) > 1000000000) {
            errors.monthly_income = 'Income is too large';
        }
    }

    // Fixed expenses validation
    if (data.fixed_expenses !== undefined && data.fixed_expenses !== null) {
        if (isNaN(data.fixed_expenses)) {
            errors.fixed_expenses = 'Fixed expenses must be a valid number';
        } else if (Number(data.fixed_expenses) < 0) {
            errors.fixed_expenses = 'Fixed expenses cannot be negative';
        } else if (Number(data.fixed_expenses) > 1000000000) {
            errors.fixed_expenses = 'Fixed expenses is too large';
        }
    }

    // Currency validation
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD'];
    if (data.currency && !validCurrencies.includes(data.currency)) {
        errors.currency = 'Invalid currency';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Sanitize string input
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input) => {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '');
};
