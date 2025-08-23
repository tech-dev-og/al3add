-- Create a function to get users with their statistics
CREATE OR REPLACE FUNCTION public.get_users_with_stats()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  display_name text,
  role text,
  event_count bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    au.id,
    au.email,
    au.created_at,
    p.display_name,
    ur.role::text,
    COALESCE(e.event_count, 0) as event_count
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.user_id = au.id
  LEFT JOIN public.user_roles ur ON ur.user_id = au.id
  LEFT JOIN (
    SELECT user_id, COUNT(*) as event_count
    FROM public.events
    GROUP BY user_id
  ) e ON e.user_id = au.id
  ORDER BY au.created_at DESC;
$$;