-- Simple storage setup for recipe images

-- First, let's check if the bucket exists
SELECT 
  'Current buckets:' as info,
  id,
  name,
  public
FROM storage.buckets;

-- Create the bucket manually (run this if bucket doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- Remove all existing policies for this bucket to start fresh
DELETE FROM storage.policies 
WHERE bucket_id = 'recipe-images';

-- Create simple policies
-- Policy 1: Allow anyone to upload (for now, we'll restrict later)
CREATE POLICY "Allow uploads to recipe-images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'recipe-images');

-- Policy 2: Allow anyone to view
CREATE POLICY "Allow public access to recipe-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'recipe-images');

-- Policy 3: Allow updates
CREATE POLICY "Allow updates to recipe-images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'recipe-images')
WITH CHECK (bucket_id = 'recipe-images');

-- Policy 4: Allow deletes
CREATE POLICY "Allow deletes from recipe-images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'recipe-images');

-- Verify the setup
SELECT 
  'Verification:' as info,
  'Bucket exists' as status
FROM storage.buckets 
WHERE id = 'recipe-images';

SELECT 
  'Policies created:' as info,
  policyname
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%recipe-images%';
