import { supabase } from '../lib/supabase';
import { expenseService } from './expenseService';

class RecurringService {
    /**
     * Get all recurring rules for a user
     */
    async getRecurringRules(userId) {
        const { data, error } = await supabase
            .from('recurring_expenses')
            .select('*')
            .eq('user_id', userId)
            .order('next_due_date', { ascending: true });

        if (error) throw error;
        return data;
    }

    /**
     * Create a new recurring rule
     */
    async createRecurringRule(ruleData) {
        // Calculate next_due_date based on start_date and frequency
        const startDate = new Date(ruleData.start_date || new Date());
        const nextDate = new Date(startDate);

        // Set next due date based on frequency
        if (ruleData.frequency === 'weekly') {
            nextDate.setDate(nextDate.getDate() + 7);
        } else if (ruleData.frequency === 'monthly') {
            nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (ruleData.frequency === 'yearly') {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
        }

        const dataToInsert = {
            ...ruleData,
            next_due_date: nextDate.toISOString().split('T')[0],
            is_active: true
        };

        const { data, error } = await supabase
            .from('recurring_expenses')
            .insert([dataToInsert])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete a recurring rule
     */
    async deleteRecurringRule(id) {
        const { error } = await supabase
            .from('recurring_expenses')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    /**
     * Process due recurring expenses
     * Checks for any active rules where next_due_date <= today
     * Creates actual expenses and updates next_due_date
     */
    async processDueExpenses(userId) {
        try {
            // 1. Get due rules
            const today = new Date().toISOString().split('T')[0];
            const { data: dueRules, error } = await supabase
                .from('recurring_expenses')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)
                .lte('next_due_date', today);

            if (error) throw error;
            if (!dueRules || dueRules.length === 0) return 0;

            console.log(`Found ${dueRules.length} due recurring expenses`);
            let processedCount = 0;

            // 2. Process each rule
            for (const rule of dueRules) {
                // Create the actual expense
                await expenseService.createExpense({
                    user_id: userId,
                    title: rule.title,
                    amount: rule.amount,
                    category: rule.category,
                    date: rule.next_due_date, // Use the due date as the expense date
                    is_recurring: true
                });

                // Calculate next due date
                const nextDate = new Date(rule.next_due_date);
                if (rule.frequency === 'weekly') {
                    nextDate.setDate(nextDate.getDate() + 7);
                } else if (rule.frequency === 'monthly') {
                    nextDate.setMonth(nextDate.getMonth() + 1);
                } else if (rule.frequency === 'yearly') {
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                }

                // Update the rule
                await supabase
                    .from('recurring_expenses')
                    .update({
                        last_generated_date: rule.next_due_date,
                        next_due_date: nextDate.toISOString().split('T')[0]
                    })
                    .eq('id', rule.id);

                processedCount++;
            }

            return processedCount;
        } catch (error) {
            console.error('Error processing recurring expenses:', error);
            return 0;
        }
    }
}

export const recurringService = new RecurringService();
