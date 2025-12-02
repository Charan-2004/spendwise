import { supabase } from '../lib/supabase';

class SavingsService {
    /**
     * Get all savings goals for a user
     */
    async getGoals(userId) {
        const { data, error } = await supabase
            .from('savings_goals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Create a new savings goal
     */
    async createGoal(goalData) {
        const { data, error } = await supabase
            .from('savings_goals')
            .insert([goalData])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update a savings goal (e.g. adding money)
     */
    async updateGoal(id, updates) {
        const { data, error } = await supabase
            .from('savings_goals')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete a savings goal
     */
    async deleteGoal(id) {
        const { error } = await supabase
            .from('savings_goals')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
}

export const savingsService = new SavingsService();
