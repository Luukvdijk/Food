-- Create the recipe-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recipe-images', 
  'recipe-images', 
  true, 
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload recipe images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to recipe images" ON storage.objects;

-- Create policy for authenticated uploads
CREATE POLICY "Allow authenticated users to upload recipe images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'recipe-images' 
  AND auth.role() = 'authenticated'
);

-- Create policy for public downloads
CREATE POLICY "Allow public access to recipe images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'recipe-images');

-- Create policy for authenticated users to update/delete their uploads
CREATE POLICY "Allow authenticated users to update recipe images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'recipe-images' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'recipe-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete recipe images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'recipe-images' AND auth.role() = 'authenticated');

-- Verify the setup
SELECT 
  'Bucket created' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'recipe-images';

-- List policies
SELECT 
  'Policies created' as status,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%recipe%';
