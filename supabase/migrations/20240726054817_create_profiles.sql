create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null unique,
  full_name text,
  avatar_url text,
  email text
);

alter table profiles enable row level security;

create policy "Users can view all profiles." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = user_id);
create policy "Users can update their own profile." on profiles for update using (auth.uid() = user_id);


create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, '{"image/jpeg","image/png","image/gif"}');

create policy "Avatar images are publicly accessible." on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." on storage.objects
  for insert with check (bucket_id = 'avatars');

create policy "Users can update their own avatars." on storage.objects
  for update using (auth.uid() = owner) with check (bucket_id = 'avatars');

create policy "Users can delete their own avatars." on storage.objects
  for delete using (auth.uid() = owner);
