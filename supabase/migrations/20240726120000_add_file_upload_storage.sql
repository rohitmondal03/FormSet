-- Create a new bucket for form uploads if it doesn't exist.
INSERT INTO storage.buckets (id, name, public)
SELECT 'form-uploads', 'form-uploads', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'form-uploads'
);

-- Set up Row Level Security (RLS) policies for the 'form-uploads' bucket.
-- These policies control who can access and modify the files.

-- Policy: Allow all users to view files.
-- This is necessary so that public URLs to the files work correctly.
CREATE POLICY "Allow public read access on form uploads"
ON storage.objects FOR SELECT
USING ( bucket_id = 'form-uploads' );

-- Policy: Allow authenticated users to upload files.
-- This provides a baseline security measure, ensuring only logged-in users can add files.
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'form-uploads' );

-- Policy: Allow users to update their own uploaded files.
-- The ownership is determined by matching the uploader's UID with the current user's UID.
CREATE POLICY "Allow users to update their own files"
ON storage.objects FOR UPDATE
USING ( auth.uid() = owner )
WITH CHECK ( bucket_id = 'form-uploads' );

-- Policy: Allow users to delete their own uploaded files.
-- Ownership is checked in the same way as the update policy.
CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE
USING ( auth.uid() = owner );
