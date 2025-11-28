import { supabase } from '../lib/supabase';
import { validateProfile } from '../utils/validation';
import { handleError, isNetworkError } from '../utils/errorHandler';
import { QUERY_TIMEOUTS, RETRY_CONFIG, CACHE_DURATION } from '../utils/constants';

/**
 * Profile Service - Handles all profile-related database operations
 */
class ProfileService {
    constructor() {
        this.cache = new Map();
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
     * Get cache key for profile
     */
    getCacheKey(userId) {
        return `profile_${userId}`;
    }

    /**
     * Check if cache is valid
     */
    isCacheValid(cacheEntry) {
        if (!cacheEntry) return false;
        return Date.now() - cacheEntry.timestamp < CACHE_DURATION.PROFILE;
    }

    /**
     * Get profile by user ID
     */
    async getProfile(userId, options = {}) {
        const { useCache = true } = options;
        const cacheKey = this.getCacheKey(userId);

        // Check cache
        if (useCache) {
            const cached = this.cache.get(cacheKey);
            if (this.isCacheValid(cached)) {
                console.log('Returning cached profile');
                return cached.data;
            }
        }

        return this.withRetry(async () => {
            const { data, error } = await this.withTimeout(
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single()
            );

            if (error && error.code === 'PGRST116') {
                // Profile doesn't exist
                return null;
            }

            if (error) throw error;

            // Update cache
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;
        }, 'getProfile');
    }

    /**
     * Create profile
     */
    async createProfile(profileData) {
        // Validate input
        const validation = validateProfile(profileData);
        if (!validation.isValid) {
            throw new Error(Object.values(validation.errors).join(', '));
        }

        return this.withRetry(async () => {
            const { data, error } = await this.withTimeout(
                supabase
                    .from('profiles')
                    .insert([profileData])
                    .select()
                    .single()
            );

            if (error) throw error;

            // Update cache
            const cacheKey = this.getCacheKey(profileData.id);
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;
        }, 'createProfile');
    }

    /**
     * Update profile
     */
    async updateProfile(userId, updates) {
        // Validate updates
        const validation = validateProfile(updates);
        if (!validation.isValid) {
            throw new Error(Object.values(validation.errors).join(', '));
        }

        return this.withRetry(async () => {
            const { data, error } = await this.withTimeout(
                supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', userId)
                    .select()
                    .single()
            );

            if (error) throw error;

            // Update cache
            const cacheKey = this.getCacheKey(userId);
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;
        }, 'updateProfile');
    }

    /**
     * Delete profile
     */
    async deleteProfile(userId) {
        return this.withRetry(async () => {
            const { error } = await this.withTimeout(
                supabase
                    .from('profiles')
                    .delete()
                    .eq('id', userId)
            );

            if (error) throw error;

            // Clear cache
            this.cache.delete(this.getCacheKey(userId));

            return true;
        }, 'deleteProfile');
    }

    /**
     * Invalidate cache for a user
     */
    invalidateCache(userId) {
        this.cache.delete(this.getCacheKey(userId));
        console.log(`Invalidated cache for user ${userId}`);
    }

    /**
     * Clear all cache
     */
    clearCache() {
        this.cache.clear();
        console.log('Profile cache cleared');
    }
}

// Export singleton instance
export const profileService = new ProfileService();
export default profileService;
