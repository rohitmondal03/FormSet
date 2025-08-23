-- Add user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='profiles' and column_name='user_id')
  THEN
      ALTER TABLE "public"."profiles" ADD COLUMN "user_id" uuid REFERENCES auth.users(id) ON DELETE CASCADE;
      ALTER TABLE "public"."profiles" ALTER COLUMN "user_id" SET NOT NULL;
      ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");
  END IF;
END $$;

-- Update the handle_new_user function to populate user_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger to use the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON "public"."profiles";
DROP POLICY IF EXISTS "Users can insert their own profile." ON "public"."profiles";
DROP POLICY IF EXISTS "Users can update own profile." ON "public"."profiles";

-- Re-create RLS policies using the user_id column
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can insert their own profile." ON "public"."profiles"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile." ON "public"."profiles"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create a storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png']
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
);

-- RLS policies for avatar storage
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can update their own avatar." ON storage.objects;
CREATE POLICY "Users can update their own avatar." ON storage.objects FOR UPDATE USING (auth.uid() = owner) WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can delete their own avatar." ON storage.objects;
CREATE POLICY "Users can delete their own avatar." ON storage.objects FOR DELETE USING (auth.uid() = owner);
