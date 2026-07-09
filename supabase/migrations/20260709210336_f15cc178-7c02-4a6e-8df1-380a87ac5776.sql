
-- 1. Foreign keys so PostgREST embeds (billing joins) work
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey,
  ADD CONSTRAINT subscriptions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_package_id_fkey,
  ADD CONSTRAINT subscriptions_package_id_fkey
    FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE RESTRICT;

ALTER TABLE public.activity_logs
  DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey,
  ADD CONSTRAINT activity_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Cover image column for profile header customization
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url text;

-- 3. Auth user -> profile + role trigger (function already exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Backfill profiles for existing auth users missing one
INSERT INTO public.profiles (id, email, full_name)
SELECT u.id, u.email,
       COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email,'@',1))
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id,
       CASE WHEN u.email = 'admin@digistreaming.com'
            THEN 'admin'::public.app_role
            ELSE 'client'::public.app_role END
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE r.user_id IS NULL;
