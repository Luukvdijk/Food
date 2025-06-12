-- Enable RLS on all tables
ALTER TABLE recepten ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredienten ENABLE ROW LEVEL SECURITY;
ALTER TABLE bijgerechten ENABLE ROW LEVEL SECURITY;

-- Create policies for recepten table
-- Allow public read access to all recipes
CREATE POLICY "Allow public read access to recepten" ON recepten
    FOR SELECT USING (true);

-- Allow authenticated users to insert recipes
CREATE POLICY "Allow authenticated users to insert recepten" ON recepten
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update recipes
CREATE POLICY "Allow authenticated users to update recepten" ON recepten
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete recipes
CREATE POLICY "Allow authenticated users to delete recepten" ON recepten
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for ingredienten table
-- Allow public read access to all ingredients
CREATE POLICY "Allow public read access to ingredienten" ON ingredienten
    FOR SELECT USING (true);

-- Allow authenticated users to insert ingredients
CREATE POLICY "Allow authenticated users to insert ingredienten" ON ingredienten
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update ingredients
CREATE POLICY "Allow authenticated users to update ingredienten" ON ingredienten
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete ingredients
CREATE POLICY "Allow authenticated users to delete ingredienten" ON ingredienten
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for bijgerechten table
-- Allow public read access to all side dishes
CREATE POLICY "Allow public read access to bijgerechten" ON bijgerechten
    FOR SELECT USING (true);

-- Allow authenticated users to insert side dishes
CREATE POLICY "Allow authenticated users to insert bijgerechten" ON bijgerechten
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update side dishes
CREATE POLICY "Allow authenticated users to update bijgerechten" ON bijgerechten
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete side dishes
CREATE POLICY "Allow authenticated users to delete bijgerechten" ON bijgerechten
    FOR DELETE USING (auth.role() = 'authenticated');
