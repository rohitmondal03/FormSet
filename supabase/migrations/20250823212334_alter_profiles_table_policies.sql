-- Drop and recreate the insert policy
DROP POLICY IF EXISTS "Users can insert their own profile." ON profile;
CREATE POLICY "Users can insert their own profile."
  ON profile
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Drop and recreate the update policy
DROP POLICY IF EXISTS "Users can update own profile." ON profile;
CREATE POLICY "Users can update own profile."
  ON profile
  FOR UPDATE
  USING (auth.uid() = user_id);