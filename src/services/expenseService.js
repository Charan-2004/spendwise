import { supabase } from '../lib/supabase';
import { validateExpense } from '../utils/validation';
import { handleError, isNetworkError } from '../utils/errorHandler';
import { QUERY_TIMEOUTS, RETRY_CONFIG, CACHE_DURATION } from '../utils/constants';

/**
 * Expense Service - Handles all expense-related database operations
 */
class ExpenseService {
    constructor() {
        this.cache = new Map();
        this.pendingRequests = new Map();
    }

    /**
     * Sleep utility for retry delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Execute query with timeout
     */
    async withTimeout(promise, timeoutMs = QUERY_TIMEOUTS.MEDIUM) {
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), timeoutMs)
        );
        return Promise.race([promise, timeoutPromise]);
    }

    /**
     * Execute query with retry logic
     */
    async withRetry(operation, context = '', retries = RETRY_CONFIG.MAX_RETRIES) {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                const isLastAttempt = attempt === retries - 1;

                if (isLastAttempt || !isNetworkError(error)) {
                    throw error;
                }

                const delay = Math.min(
                    RETRY_CONFIG.INITIAL_DELAY * Math.pow(2, attempt),
                    RETRY_CONFIG.MAX_DELAY
                );

                console.log(`Retrying ${context} (attempt ${attempt + 2}/${retries}) after ${delay}ms`);
                await this.sleep(delay);
            }
        }
    }

    /**
     * Get cache key for expenses
     */
    getCacheKey(userId, filters = {}) {
        return `expenses_${userId}_${JSON.stringify(filters)}`;
    }

    /**
     * Check if cache is valid
     */
    isCacheValid(cacheEntry) {
        if (!cacheEntry) return false;
        return Date.now() - cacheEntry.timestamp < CACHE_DURATION.EXPENSES;
    }

    /**
     * Get all expenses for a user
     */
    async getExpenses(userId, options = {}) {
        const { useCache = true, orderBy = 'date', ascending = false } = options;
        const cacheKey = this.getCacheKey(userId, options);

        // Check cache
        if (useCache) {
            const cached = this.cache.get(cacheKey);
            if (this.isCacheValid(cached)) {
                console.log('Returning cached expenses');
                return cached.data;
            }
        }

        // Check if there's a pending request for the same data
        if (this.pendingRequests.has(cacheKey)) {
            console.log('Waiting for pending request');
            return this.pendingRequests.get(cacheKey);
        }

        // Execute query
        const requestPromise = this.withRetry(async () => {
            const query = supabase
                .from('expenses')
                .select('*')
                .eq('user_id', userId)
                .order(orderBy, { ascending });

            const { data, error } = await this.withTimeout(query);

            if (error) throw error;
            return data || [];
        }, 'getExpenses');

        // Store pending request
        this.pendingRequests.set(cacheKey, requestPromise);

        try {
            const data = await requestPromise;

            // Update cache
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            handleError(error, 'fetching expenses');
            throw error;
        } finally {
            this.pendingRequests.delete(cacheKey);
        }
    }

    /**
     * Get expenses for current month
     */
    async getMonthlyExpenses(userId) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        return this.withRetry(async () => {
            const { data, error } = await this.withTimeout(
                supabase
                    .from('expenses')
                    .select('*')
                    .eq('user_id', userId)
                    .gte('date', startOfMonth.toISOString())
                    .order('date', { ascending: false })
            );

            if (error) throw error;
            return data || [];
        }, 'getMonthlyExpenses');
    }

    /**
     * Create a new expense
     */
    async createExpense(expenseData) {
        // Validate input
        const validation = validateExpense(expenseData);
        if (!validation.isValid) {
            throw new Error(Object.values(validation.errors).join(', '));
        }

        return this.withRetry(async () => {
            const { data, error } = await this.withTimeout(
                supabase
                    .from('expenses')
                    .insert([expenseData])
                    .select()
                    .single()
            );

            if (error) throw error;

            // Invalidate cache
            this.invalidateCache(expenseData.user_id);

            return data;
        }, 'createExpense');
    }

    /**
     * Update an expense
     */
    async updateExpense(id, updates, userId) {
        // Validate updates
        if (Object.keys(updates).some(key => ['title', 'amount', 'category', 'date'].includes(key))) {
            const validation = validateExpense({ ...updates, title: updates.title || 'temp', amount: updates.amount || 1, category: updates.category || 'Other', date: updates.date || new Date().toISOString() });
            if (!validation.isValid) {
                const relevantErrors = Object.entries(validation.errors)
                    .filter(([key]) => key in updates)
                    .map(([, value]) => value);
                if (relevantErrors.length > 0) {
                    throw new Error(relevantErrors.join(', '));
                }
            }
        }

        return this.withRetry(async () => {
            const { data, error } = await this.withTimeout(
                supabase
                    .from('expenses')
                    .update(updates)
                    .eq('id', id)
                    .select()
                    .single()
            );

            if (error) throw error;

            // Invalidate cache
            this.invalidateCache(userId);

            return data;
        }, 'updateExpense');
    }

    /**
     * Delete an expense
     */
    async deleteExpense(id, userId) {
        return this.withRetry(async () => {
            const { error } = await this.withTimeout(
                supabase
                    .from('expenses')
                    .delete()
                    .eq('id', id)
            );

            if (error) throw error;

            // Invalidate cache
            this.invalidateCache(userId);

            return true;
        }, 'deleteExpense');
    }

    /**
     * Batch delete expenses
     */
    async batchDeleteExpenses(ids, userId) {
        return this.withRetry(async () => {
            const { error } = await this.withTimeout(
                supabase
                    .from('expenses')
                    .delete()
                    .in('id', ids)
            );

            if (error) throw error;

            // Invalidate cache
            this.invalidateCache(userId);

            return true;
        }, 'batchDeleteExpenses');
    }

    /**
     * Invalidate cache for a user
     */
    invalidateCache(userId) {
        const keysToDelete = [];
        for (const key of this.cache.keys()) {
            if (key.includes(userId)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
        console.log(`Invalidated ${keysToDelete.length} cache entries for user ${userId}`);
    }

    /**
     * Clear all cache
     */
    clearCache() {
        this.cache.clear();
        console.log('Cache cleared');
    }
}

// Export singleton instance
export const expenseService = new ExpenseService();
export default expenseService;
