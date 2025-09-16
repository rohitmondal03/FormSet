
-- CREATE profile table
CREATE TABLE IF NOT EXISTS profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT
);

-- search INDEX on user_id
CREATE INDEX idx_profile_user_id ON profile(user_id);

-- Set up Row Level Security
ALTER TABLE profile
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profile are viewable by everyone." ON profile
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profile
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profile
  FOR UPDATE USING (auth.uid() = id);

-- This trigger automatically CREATEs a profile entry when a new user signs up.
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER as $$
BEGIN
  INSERT INTO public.profile (user_id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY definer;

CREATE TRIGGER on_auth_user_CREATEd
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
