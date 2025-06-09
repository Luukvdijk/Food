-- Enable Row Level Security on our tables
ALTER TABLE recepten ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredienten ENABLE ROW LEVEL SECURITY;
ALTER TABLE bijgerechten ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (anyone can view recipes)
CREATE POLICY "Allow public read access to recepten" ON recepten
FOR SELECT USING (true);

CREATE POLICY "Allow public read access to ingredienten" ON ingredienten
FOR SELECT USING (true);

CREATE POLICY "Allow public read access to bijgerechten" ON bijgerechten
FOR SELECT USING (true);

-- Create policies for authenticated users to manage recipes
CREATE POLICY "Allow authenticated users to insert recepten" ON recepten
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update recepten" ON recepten
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete recepten" ON recepten
FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for ingredients (tied to recipes)
CREATE POLICY "Allow authenticated users to insert ingredienten" ON ingredienten
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update ingredienten" ON ingredienten
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete ingredienten" ON ingredienten
FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for bijgerechten (tied to recipes)
CREATE POLICY "Allow authenticated users to insert bijgerechten" ON bijgerechten
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update bijgerechten" ON bijgerechten
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete bijgerechten" ON bijgerechten
FOR DELETE USING (auth.role() = 'authenticated');

-- Verify the policies
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('recepten', 'ingredienten', 'bijgerechten')
ORDER BY tablename, policyname;
