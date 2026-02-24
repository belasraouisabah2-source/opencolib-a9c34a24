
-- Clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  date_creation DATE NOT NULL DEFAULT CURRENT_DATE,
  etat TEXT NOT NULL DEFAULT 'Actif'
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Public insert clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Public delete clients" ON public.clients FOR DELETE USING (true);

-- Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  client_nom TEXT,
  type TEXT NOT NULL,
  etat TEXT NOT NULL DEFAULT 'Activé',
  date_creation DATE NOT NULL DEFAULT CURRENT_DATE
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public insert services" ON public.services FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update services" ON public.services FOR UPDATE USING (true);
CREATE POLICY "Public delete services" ON public.services FOR DELETE USING (true);

-- Secteurs
CREATE TABLE public.secteurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  service TEXT,
  nb_employes INTEGER NOT NULL DEFAULT 0,
  nb_beneficiaires INTEGER NOT NULL DEFAULT 0,
  etat TEXT NOT NULL DEFAULT 'Actif'
);
ALTER TABLE public.secteurs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read secteurs" ON public.secteurs FOR SELECT USING (true);
CREATE POLICY "Public insert secteurs" ON public.secteurs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update secteurs" ON public.secteurs FOR UPDATE USING (true);
CREATE POLICY "Public delete secteurs" ON public.secteurs FOR DELETE USING (true);

-- Beneficiaires
CREATE TABLE public.beneficiaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  civilite TEXT,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  client TEXT,
  service TEXT,
  date_naissance DATE,
  adresse TEXT,
  telephone TEXT,
  etat TEXT NOT NULL DEFAULT 'Actif'
);
ALTER TABLE public.beneficiaires ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read beneficiaires" ON public.beneficiaires FOR SELECT USING (true);
CREATE POLICY "Public insert beneficiaires" ON public.beneficiaires FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update beneficiaires" ON public.beneficiaires FOR UPDATE USING (true);
CREATE POLICY "Public delete beneficiaires" ON public.beneficiaires FOR DELETE USING (true);

-- Employes
CREATE TABLE public.employes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  civilite TEXT,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  service TEXT,
  poste TEXT,
  contrat TEXT,
  date_embauche DATE,
  telephone TEXT,
  etat TEXT NOT NULL DEFAULT 'Actif'
);
ALTER TABLE public.employes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read employes" ON public.employes FOR SELECT USING (true);
CREATE POLICY "Public insert employes" ON public.employes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update employes" ON public.employes FOR UPDATE USING (true);
CREATE POLICY "Public delete employes" ON public.employes FOR DELETE USING (true);

-- Planning events
CREATE TABLE public.planning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  employe TEXT NOT NULL,
  beneficiaire TEXT NOT NULL,
  date DATE NOT NULL,
  debut TIME NOT NULL,
  fin TIME NOT NULL,
  statut TEXT NOT NULL DEFAULT 'Planifiée',
  debut_reel TIME,
  fin_reelle TIME
);
ALTER TABLE public.planning_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read planning_events" ON public.planning_events FOR SELECT USING (true);
CREATE POLICY "Public insert planning_events" ON public.planning_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update planning_events" ON public.planning_events FOR UPDATE USING (true);
CREATE POLICY "Public delete planning_events" ON public.planning_events FOR DELETE USING (true);
