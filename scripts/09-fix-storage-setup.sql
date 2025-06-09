-- Check what storage tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'storage';

-- Create the recipe-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Check if policies exist in pg_policies instead
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Drop existing policies using the correct method
DROP POLICY IF EXISTS "Allow uploads to recipe-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to recipe-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to recipe-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes from recipe-images" ON storage.objects;

-- Create RLS policies for storage.objects
CREATE POLICY "Enable insert for recipe images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'recipe-images');

CREATE POLICY "Enable select for recipe images" ON storage.objects
FOR SELECT USING (bucket_id = 'recipe-images');

CREATE POLICY "Enable update for recipe images" ON storage.objects
FOR UPDATE USING (bucket_id = 'recipe-images');

CREATE POLICY "Enable delete for recipe images" ON storage.objects
FOR DELETE USING (bucket_id = 'recipe-images');

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Verify setup
SELECT 'Bucket created:' as info, id, name, public 
FROM storage.buckets WHERE id = 'recipe-images';

SELECT 'Policies created:' as info, policyname 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects' 
AND policyname LIKE '%recipe%';
