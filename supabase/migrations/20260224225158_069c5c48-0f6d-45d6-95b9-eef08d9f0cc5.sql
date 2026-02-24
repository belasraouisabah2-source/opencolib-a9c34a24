
-- 1. Create roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'responsable_service', 'responsable_secteur', 'coordinateur', 'comptable', 'rh', 'intervenant');

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- 4. Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Drop all existing public policies and replace with authenticated-only
-- clients
DROP POLICY IF EXISTS "Public read clients" ON public.clients;
DROP POLICY IF EXISTS "Public insert clients" ON public.clients;
DROP POLICY IF EXISTS "Public update clients" ON public.clients;
DROP POLICY IF EXISTS "Public delete clients" ON public.clients;
CREATE POLICY "Authenticated read clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update clients" ON public.clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete clients" ON public.clients FOR DELETE TO authenticated USING (true);

-- services
DROP POLICY IF EXISTS "Public read services" ON public.services;
DROP POLICY IF EXISTS "Public insert services" ON public.services;
DROP POLICY IF EXISTS "Public update services" ON public.services;
DROP POLICY IF EXISTS "Public delete services" ON public.services;
CREATE POLICY "Authenticated read services" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert services" ON public.services FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update services" ON public.services FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete services" ON public.services FOR DELETE TO authenticated USING (true);

-- secteurs
DROP POLICY IF EXISTS "Public read secteurs" ON public.secteurs;
DROP POLICY IF EXISTS "Public insert secteurs" ON public.secteurs;
DROP POLICY IF EXISTS "Public update secteurs" ON public.secteurs;
DROP POLICY IF EXISTS "Public delete secteurs" ON public.secteurs;
CREATE POLICY "Authenticated read secteurs" ON public.secteurs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert secteurs" ON public.secteurs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update secteurs" ON public.secteurs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete secteurs" ON public.secteurs FOR DELETE TO authenticated USING (true);

-- beneficiaires
DROP POLICY IF EXISTS "Public read beneficiaires" ON public.beneficiaires;
DROP POLICY IF EXISTS "Public insert beneficiaires" ON public.beneficiaires;
DROP POLICY IF EXISTS "Public update beneficiaires" ON public.beneficiaires;
DROP POLICY IF EXISTS "Public delete beneficiaires" ON public.beneficiaires;
CREATE POLICY "Authenticated read beneficiaires" ON public.beneficiaires FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert beneficiaires" ON public.beneficiaires FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update beneficiaires" ON public.beneficiaires FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete beneficiaires" ON public.beneficiaires FOR DELETE TO authenticated USING (true);

-- employes
DROP POLICY IF EXISTS "Public read employes" ON public.employes;
DROP POLICY IF EXISTS "Public insert employes" ON public.employes;
DROP POLICY IF EXISTS "Public update employes" ON public.employes;
DROP POLICY IF EXISTS "Public delete employes" ON public.employes;
CREATE POLICY "Authenticated read employes" ON public.employes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert employes" ON public.employes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update employes" ON public.employes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete employes" ON public.employes FOR DELETE TO authenticated USING (true);

-- planning_events
DROP POLICY IF EXISTS "Public read planning_events" ON public.planning_events;
DROP POLICY IF EXISTS "Public insert planning_events" ON public.planning_events;
DROP POLICY IF EXISTS "Public update planning_events" ON public.planning_events;
DROP POLICY IF EXISTS "Public delete planning_events" ON public.planning_events;
CREATE POLICY "Authenticated read planning_events" ON public.planning_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert planning_events" ON public.planning_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update planning_events" ON public.planning_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete planning_events" ON public.planning_events FOR DELETE TO authenticated USING (true);

-- factures
DROP POLICY IF EXISTS "Public read factures" ON public.factures;
DROP POLICY IF EXISTS "Public insert factures" ON public.factures;
DROP POLICY IF EXISTS "Public update factures" ON public.factures;
DROP POLICY IF EXISTS "Public delete factures" ON public.factures;
CREATE POLICY "Authenticated read factures" ON public.factures FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert factures" ON public.factures FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update factures" ON public.factures FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete factures" ON public.factures FOR DELETE TO authenticated USING (true);

-- 8. Admin policy: admins can manage roles
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
