-- This is an alternative to the previous script
-- Use this if you want recipes to be editable only by their owners

-- First, we need to add a user_id column to track ownership
-- (Skip this if you want to use the 'eigenaar' field instead)
-- ALTER TABLE recepten ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to recepten" ON recepten;
DROP POLICY IF EXISTS "Allow authenticated users to insert recepten" ON recepten;
DROP POLICY IF EXISTS "Allow authenticated users to update recepten" ON recepten;
DROP POLICY IF EXISTS "Allow authenticated users to delete recepten" ON recepten;

-- Create owner-based policies for recepten
-- Allow public read access to all recipes
CREATE POLICY "Allow public read access to recepten" ON recepten
    FOR SELECT USING (true);

-- Allow authenticated users to insert recipes (they become the owner)
CREATE POLICY "Allow authenticated users to insert recepten" ON recepten
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update only their own recipes (using eigenaar field)
CREATE POLICY "Allow users to update own recepten" ON recepten
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        (eigenaar = auth.jwt() ->> 'email' OR auth.jwt() ->> 'role' = 'admin')
    );

-- Allow users to delete only their own recipes
CREATE POLICY "Allow users to delete own recepten" ON recepten
    FOR DELETE USING (
        auth.role() = 'authenticated' AND 
        (eigenaar = auth.jwt() ->> 'email' OR auth.jwt() ->> 'role' = 'admin')
    );

-- Update ingredient policies to match recipe ownership
DROP POLICY IF EXISTS "Allow authenticated users to update ingredienten" ON ingredienten;
DROP POLICY IF EXISTS "Allow authenticated users to delete ingredienten" ON ingredienten;

CREATE POLICY "Allow users to update ingredients of own recipes" ON ingredienten
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM recepten 
            WHERE recepten.id = ingredienten.recept_id 
            AND (recepten.eigenaar = auth.jwt() ->> 'email' OR auth.jwt() ->> 'role' = 'admin')
        )
    );

CREATE POLICY "Allow users to delete ingredients of own recipes" ON ingredienten
    FOR DELETE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM recepten 
            WHERE recepten.id = ingredienten.recept_id 
            AND (recepten.eigenaar = auth.jwt() ->> 'email' OR auth.jwt() ->> 'role' = 'admin')
        )
    );

-- Update bijgerechten policies to match recipe ownership
DROP POLICY IF EXISTS "Allow authenticated users to update bijgerechten" ON bijgerechten;
DROP POLICY IF EXISTS "Allow authenticated users to delete bijgerechten" ON bijgerechten;

CREATE POLICY "Allow users to update bijgerechten of own recipes" ON bijgerechten
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM recepten 
            WHERE recepten.id = bijgerechten.recept_id 
            AND (recepten.eigenaar = auth.jwt() ->> 'email' OR auth.jwt() ->> 'role' = 'admin')
        )
    );

CREATE POLICY "Allow users to delete bijgerechten of own recipes" ON bijgerechten
    FOR DELETE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM recepten 
            WHERE recepten.id = bijgerechten.recept_id 
            AND (recepten.eigenaar = auth.jwt() ->> 'email' OR auth.jwt() ->> 'role' = 'admin')
        )
    );
