
-- This function deletes a user and all their associated data.
create or replace function public.delete_user_account()
returns void
language plpgsql
security definer -- This is important for permissions
as $$
declare
    user_id_to_delete uuid;
begin
    -- Get the user ID from the current session
    select auth.uid() into user_id_to_delete;

    if user_id_to_delete is null then
        raise exception 'User not found. Cannot delete account.';
    end if;
    
    -- Delete from profiles table
    delete from public.profiles where user_id = user_id_to_delete;
    
    -- Now, delete the user from auth.users
    -- This will cascade and delete from other auth tables
    delete from auth.users where id = user_id_to_delete;

end;
$$;


-- Grant execute permission to the authenticated role
grant execute on function public.delete_user_account() to authenticated;
