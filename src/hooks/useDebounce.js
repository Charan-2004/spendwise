import { useEffect, useRef } from 'react';

/**
 * Debounce hook - delays execution until after wait period of inactivity
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function useDebounce(callback, delay = 500) {
    const timeoutRef = useRef(null);
    const callbackRef = useRef(callback);

    // Update callback ref when it changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    };
}

export default useDebounce;
