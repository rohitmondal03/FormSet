-- Create the storage bucket
insert into storage.buckets
(id, name, public)
values
('avatars', 'avatars', true); -- 'avatars' is the bucket name, set public to true if you want public access

-- Set up policies for the bucket
-- This is a basic example, you'll likely want more refined policies

-- Allow authenticated users to upload files
create policy "Allow authenticated uploads" on storage.objects for insert with check (auth.role() = 'authenticated');

-- Allow anyone to view files (if the bucket is public)
create policy "Allow public viewing" on storage.objects for select using (true);

-- Allow authenticated users to update their own files (optional)
-- create policy "Allow authenticated updates" on storage.objects for update using (auth.role() = 'authenticated');

-- Allow authenticated users to delete their own files (optional)
-- create policy "Allow authenticated deletes" on storage.objects for delete using (auth.role() = 'authenticated');

-- Allow authenticated users to delete their own files (optional)
-- create policy "Allow authenticated deletes" on storage.objects for delete using (auth.role() = 'authenticated');