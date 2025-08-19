-- Drop the existing trigger and function to recreate them properly
DROP TRIGGER IF EXISTS auto_assign_first_admin ON auth.users;
DROP FUNCTION IF EXISTS public.setup_first_admin();

-- Recreate the function with proper enum reference
CREATE OR REPLACE FUNCTION public.setup_first_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if this is the first user and no admin exists yet
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    -- Make this user an admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER auto_assign_first_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.setup_first_admin();