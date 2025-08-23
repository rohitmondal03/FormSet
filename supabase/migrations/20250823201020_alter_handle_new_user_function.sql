CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (email, full_name, user_id)
  VALUES (new.email, new.raw_user_meta_data->>'full_name', new.id);
  return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;