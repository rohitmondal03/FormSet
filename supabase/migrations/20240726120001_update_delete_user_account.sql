
-- Drop the existing function if it exists to replace it
DROP FUNCTION IF EXISTS public.delete_user_account();

-- Recreate the function with improved logic
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id_to_delete uuid;
BEGIN
    -- Get the user ID from the current session
    SELECT auth.uid() INTO user_id_to_delete;

    IF user_id_to_delete IS NULL THEN
        RAISE EXCEPTION 'User not found. Cannot delete account.';
    END IF;
    
    -- Step 1: Delete form responses for all forms owned by the user
    -- This is crucial for data cleanup and to avoid foreign key violations if not using ON DELETE CASCADE for responses.
    DELETE FROM public.form_responses fr
    WHERE fr.form_id IN (SELECT f.id FROM public.forms f WHERE f.user_id = user_id_to_delete);
    
    -- Step 2: Delete form fields for all forms owned by the user.
    -- This is done before deleting the forms themselves.
    DELETE from public.form_fields ff
    WHERE ff.form_id IN (SELECT f.id FROM public.forms f WHERE f.user_id = user_id_to_delete);

    -- Step 3: Delete all forms owned by the user
    DELETE FROM public.forms f
    WHERE f.user_id = user_id_to_delete;

    -- Step 4: Delete the user's profile from the public.profiles table
    DELETE FROM public.profiles p
    WHERE p.user_id = user_id_to_delete;

    -- Step 5: Delete the user from the auth.users table in the auth schema
    -- This will cascade and delete related data in the auth schema (e.g., sessions, identities)
    DELETE FROM auth.users u
    WHERE u.id = user_id_to_delete;
END;
$$;

-- Grant execute permission to the function for authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
