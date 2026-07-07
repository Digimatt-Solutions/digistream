
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN NEW.email = 'admin@digistreaming.com' THEN 'admin'::public.app_role ELSE 'client'::public.app_role END);
  RETURN NEW;
END;
$function$;

UPDATE auth.users
SET email = 'admin@digistreaming.com',
    encrypted_password = crypt('0206White!', gen_salt('bf')),
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('full_name','Digistream Admin'),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email = 'admin@digistraming.com';

UPDATE public.profiles SET email = 'admin@digistreaming.com'
WHERE id = '2ec9b45b-5451-40ea-a246-72d413367ff0';
