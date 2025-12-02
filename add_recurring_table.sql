-- =====================================================
-- RECURRING TRANSACTIONS SCHEMA
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create recurring_expenses table
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'weekly', 'yearly')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_generated_date DATE,
    next_due_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
CREATE POLICY "Users can view own recurring expenses"
  ON recurring_expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring expenses"
  ON recurring_expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring expenses"
  ON recurring_expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring expenses"
  ON recurring_expenses FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recurring_user_id ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_next_due ON recurring_expenses(next_due_date);
