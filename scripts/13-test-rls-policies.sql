-- Test RLS policies
-- This script will help verify that your RLS policies are working correctly

-- Test 1: Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('recepten', 'ingredienten', 'bijgerechten');

-- Test 2: Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('recepten', 'ingredienten', 'bijgerechten');

-- Test 3: Count total recipes (should work for everyone)
SELECT COUNT(*) as total_recipes FROM recepten;

-- Test 4: Try to get a sample recipe (should work for everyone)
SELECT id, naam, eigenaar FROM recepten LIMIT 1;
