import { supabase } from '../lib/supabase';

/**
 * Checks if budget reset is due and processes it
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - Returns true if reset was performed
 */
export async function checkAndProcessReset(userId) {
    try {
        // Get user's reset settings
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('reset_day, reset_enabled, last_reset_date, current_period_start')
            .eq('id', userId)
            .single();

        if (profileError || !profile || !profile.reset_enabled) {
            return false;
        }

        const now = new Date();
        const currentDay = now.getDate();
        const resetDay = profile.reset_day;

        // Check if we've already reset this month
        const lastReset = profile.last_reset_date ? new Date(profile.last_reset_date) : null;
        if (lastReset) {
            const sameMonth = lastReset.getMonth() === now.getMonth() &&
                lastReset.getFullYear() === now.getFullYear();
            if (sameMonth) {
                return false; // Already reset this month
            }
        }

        // Check if it's time to reset
        const shouldReset = currentDay >= resetDay;

        if (shouldReset) {
            // Calculate new period start date
            const periodStart = new Date(now.getFullYear(), now.getMonth(), resetDay);

            // Update profile with new period
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    last_reset_date: now.toISOString(),
                    current_period_start: periodStart.toISOString().split('T')[0]
                })
                .eq('id', userId);

            if (updateError) {
                console.error('Error updating reset date:', updateError);
                return false;
            }

            return true;
        }

        return false;
    } catch (error) {
        console.error('Error in checkAndProcessReset:', error);
        return false;
    }
}

/**
 * Gets the current budget period for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - { periodStart, periodEnd }
 */
export async function getCurrentPeriod(userId) {
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('reset_day, reset_enabled, current_period_start')
            .eq('id', userId)
            .single();

        if (!profile || !profile.reset_enabled) {
            // If reset not enabled, return current month
            const now = new Date();
            return {
                periodStart: new Date(now.getFullYear(), now.getMonth(), 1),
                periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0)
            };
        }

        const now = new Date();
        const resetDay = profile.reset_day;
        const currentDay = now.getDate();

        let periodStart, periodEnd;

        if (currentDay >= resetDay) {
            // Current period
            periodStart = new Date(now.getFullYear(), now.getMonth(), resetDay);
            periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, resetDay - 1);
        } else {
            // Previous period
            periodStart = new Date(now.getFullYear(), now.getMonth() - 1, resetDay);
            periodEnd = new Date(now.getFullYear(), now.getMonth(), resetDay - 1);
        }

        return { periodStart, periodEnd };
    } catch (error) {
        console.error('Error getting current period:', error);
        const now = new Date();
        return {
            periodStart: new Date(now.getFullYear(), now.getMonth(), 1),
            periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        };
    }
}

/**
 * Filters expenses by current budget period
 * @param {Array} expenses - All expenses
 * @param {Object} period - { periodStart, periodEnd }
 * @returns {Array} - Filtered expenses
 */
export function filterByPeriod(expenses, period) {
    if (!period || !expenses) return expenses;

    return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= period.periodStart && expenseDate <= period.periodEnd;
    });
}

export const budgetService = {
    checkAndProcessReset,
    getCurrentPeriod,
    filterByPeriod
};

export default budgetService;
