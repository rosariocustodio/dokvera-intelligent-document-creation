-- 1. Grant admin role to rosariocustodio006@gmail.com if the user already exists in auth.users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = 'rosariocustodio006@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Update handle_new_user to automatically grant admin role upon signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);

  -- Insert initial welcome credits (10 credits)
  INSERT INTO public.credits (user_id, balance)
  VALUES (NEW.id, 10)
  ON CONFLICT (user_id) DO NOTHING;

  -- If user is the platform owner, assign admin role automatically
  IF lower(NEW.email) = 'rosariocustodio006@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

-- 3. Ensure admins can read profiles for backoffice management
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR lower(auth.jwt() ->> 'email') = 'rosariocustodio006@gmail.com');

-- 4. Ensure admins can read credits for backoffice management
DROP POLICY IF EXISTS "credits_select_admin" ON public.credits;
CREATE POLICY "credits_select_admin" ON public.credits
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR lower(auth.jwt() ->> 'email') = 'rosariocustodio006@gmail.com');

-- 5. Ensure admins can read all documents for global audit
DROP POLICY IF EXISTS "documents_select_admin" ON public.documents;
CREATE POLICY "documents_select_admin" ON public.documents
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR lower(auth.jwt() ->> 'email') = 'rosariocustodio006@gmail.com');

-- 6. Ensure admins can read all credit transactions
DROP POLICY IF EXISTS "credit_transactions_select_admin" ON public.credit_transactions;
CREATE POLICY "credit_transactions_select_admin" ON public.credit_transactions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR lower(auth.jwt() ->> 'email') = 'rosariocustodio006@gmail.com');
