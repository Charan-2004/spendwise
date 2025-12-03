-- Add budget reset fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS reset_day INTEGER CHECK (reset_day >= 1 AND reset_day <= 31),
ADD COLUMN IF NOT EXISTS reset_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_reset_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS current_period_start DATE;

-- Add period tracking to expenses table
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS period_month INTEGER,
ADD COLUMN IF NOT EXISTS period_year INTEGER;

-- Create index for period queries
CREATE INDEX IF NOT EXISTS idx_expenses_period ON expenses(user_id, period_year, period_month);

COMMENT ON COLUMN profiles.reset_day IS 'Day of month (1-31) when budget resets';
COMMENT ON COLUMN profiles.reset_enabled IS 'Whether automatic monthly budget reset is enabled';
COMMENT ON COLUMN profiles.last_reset_date IS 'Timestamp of last budget reset';
COMMENT ON COLUMN profiles.current_period_start IS 'Start date of current tracking period';
COMMENT ON COLUMN expenses.period_month IS 'Month of the budget period (1-12)';
COMMENT ON COLUMN expenses.period_year IS 'Year of the budget period';
