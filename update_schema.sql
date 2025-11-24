-- Add fixed_expenses column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS fixed_expenses DECIMAL(10,2) DEFAULT 0.00;

-- Comment on the column
COMMENT ON COLUMN profiles.fixed_expenses IS 'User defined fixed monthly expenditure amount';
