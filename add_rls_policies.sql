-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- CRITICAL: Apply before production deployment
-- =====================================================

-- This file adds Row Level Security to prevent unauthorized data access
-- Users will only be able to see and modify their own data

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for clean slate)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile (optional - for account deletion)
CREATE POLICY "Users can delete own profile"
  ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- =====================================================
-- 2. EXPENSES TABLE
-- =====================================================

-- Enable RLS on expenses table
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for clean slate)
DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;

-- Policy: Users can view their own expenses
CREATE POLICY "Users can view own expenses"
  ON expenses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own expenses
CREATE POLICY "Users can insert own expenses"
  ON expenses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own expenses
CREATE POLICY "Users can update own expenses"
  ON expenses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own expenses
CREATE POLICY "Users can delete own expenses"
  ON expenses
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. VERIFICATION QUERIES
-- =====================================================

-- Run these queries to verify RLS is working:

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'expenses');

-- View all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('profiles', 'expenses')
ORDER BY tablename, policyname;

-- =====================================================
-- 4. TESTING RLS (Run as authenticated user)
-- =====================================================

-- Test 1: Try to view another user's profile (should return 0 rows)
-- SELECT * FROM profiles WHERE id != auth.uid();

-- Test 2: Try to insert expense for another user (should fail)
-- INSERT INTO expenses (user_id, title, amount, category, date)
-- VALUES ('other-user-id', 'Test', 100, 'Food', CURRENT_DATE);

-- Test 3: View own expenses (should work)
-- SELECT * FROM expenses WHERE user_id = auth.uid();

-- =====================================================
-- 5. PERFORMANCE INDEXES (Already exist but verify)
-- =====================================================

-- These indexes ensure RLS policies don't slow down queries
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category ON expenses(user_id, category);

-- =====================================================
-- 6. NOTES
-- =====================================================

-- 🔒 Security Notes:
-- - RLS is now enforced at the database level
-- - Even if frontend has bugs, users can't access others' data
-- - API keys in frontend are safe (anon key can't bypass RLS)
-- - Service role key (if used) BYPASSES RLS - keep it secret!

-- ⚡ Performance Notes:
-- - Indexes on user_id ensure fast RLS checks
-- - PostgreSQL optimizes RLS policies efficiently
-- - No significant performance impact expected

-- 🧪 Testing Notes:
-- - Test with multiple user accounts
-- - Verify user can only see their own data
-- - Check that signup creates profile correctly
-- - Ensure all CRUD operations work

-- ✅ Migration Complete!
-- RLS is now active. Your database is secure! 🎉
