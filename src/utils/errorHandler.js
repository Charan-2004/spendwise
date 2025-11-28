/**
 * Centralized error handling utilities
 */

/**
 * Format error for user display
 * @param {Error|Object} error - Error object
 * @param {string} context - Context where error occurred
 * @returns {string} User-friendly error message
 */
export const formatErrorMessage = (error, context = '') => {
    // Supabase specific errors
    if (error?.code === 'PGRST116') {
        return 'Data not found';
    }
    if (error?.code === '23505') {
        return 'This record already exists';
    }
    if (error?.code === '23503') {
        return 'Cannot complete operation due to related data';
    }
    if (error?.message?.includes('JWT')) {
        return 'Session expired. Please sign in again';
    }
    if (error?.message?.includes('timeout')) {
        return 'Request timed out. Please try again';
    }
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        return 'Network error. Please check your internet connection';
    }

    // Generic errors
    if (error?.message) {
        return error.message;
    }

    return context ? `Error in ${context}` : 'An unexpected error occurred';
};

/**
 * Handle and log error
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @param {boolean} showAlert - Whether to show alert to user
 * @returns {Object} { message: string, shouldRetry: boolean }
 */
export const handleError = (error, context = '', showAlert = true) => {
    const message = formatErrorMessage(error, context);

    // Log to console in development
    if (import.meta.env.DEV) {
        console.error(`[${context}]`, error);
    }

    // Determine if error is retryable
    const retryableErrors = ['timeout', 'network', 'fetch', 'ECONNREFUSED'];
    const shouldRetry = retryableErrors.some(type =>
        error?.message?.toLowerCase().includes(type.toLowerCase())
    );

    // Show alert if requested
    if (showAlert && typeof window !== 'undefined') {
        // In a real app, this would trigger a toast notification
        // For now, we'll just console.warn
        console.warn(message);
    }

    return {
        message,
        shouldRetry,
        originalError: error
    };
};

/**
 * Create error object with context
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} details - Additional details
 * @returns {Error} Error object
 */
export const createError = (message, code = 'UNKNOWN', details = {}) => {
    const error = new Error(message);
    error.code = code;
    error.details = details;
    return error;
};

/**
 * Check if error is network related
 * @param {Error} error - Error to check
 * @returns {boolean} True if network error
 */
export const isNetworkError = (error) => {
    const networkIndicators = ['network', 'fetch', 'timeout', 'ECONNREFUSED', 'offline'];
    return networkIndicators.some(indicator =>
        error?.message?.toLowerCase().includes(indicator.toLowerCase())
    );
};
