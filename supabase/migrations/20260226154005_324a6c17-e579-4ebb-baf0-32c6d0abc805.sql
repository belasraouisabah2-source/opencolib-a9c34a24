
-- Table référentielle des organismes financeurs
CREATE TABLE public.ref_organismes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL UNIQUE,
  type TEXT DEFAULT 'Autre',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ref_organismes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read ref_organismes" ON public.ref_organismes FOR SELECT USING (true);
CREATE POLICY "Authenticated insert ref_organismes" ON public.ref_organismes FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated update ref_organismes" ON public.ref_organismes FOR UPDATE USING (true);
CREATE POLICY "Authenticated delete ref_organismes" ON public.ref_organismes FOR DELETE USING (true);

-- Table référentielle des types de services de prise en charge
CREATE TABLE public.ref_services_pec (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ref_services_pec ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read ref_services_pec" ON public.ref_services_pec FOR SELECT USING (true);
CREATE POLICY "Authenticated insert ref_services_pec" ON public.ref_services_pec FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated update ref_services_pec" ON public.ref_services_pec FOR UPDATE USING (true);
CREATE POLICY "Authenticated delete ref_services_pec" ON public.ref_services_pec FOR DELETE USING (true);

-- Données initiales organismes
INSERT INTO public.ref_organismes (nom, type) VALUES
  ('CPAM', 'Sécurité sociale'),
  ('APA', 'Aide sociale'),
  ('Conseil Départemental', 'Aide sociale'),
  ('CARSAT', 'Retraite'),
  ('CNAV', 'Retraite'),
  ('MSA', 'Sécurité sociale'),
  ('Mutuelle Générale', 'Mutuelle'),
  ('RMA', 'Mutuelle'),
  ('PCH', 'Handicap'),
  ('MDPH', 'Handicap');

-- Données initiales services PEC
INSERT INTO public.ref_services_pec (nom) VALUES
  ('Aide ménagère'),
  ('Aide à la toilette'),
  ('Aide à domicile'),
  ('Accompagnement social'),
  ('Garde de nuit'),
  ('Garde de jour'),
  ('Aide aux repas'),
  ('Accompagnement extérieur'),
  ('Aide administrative');
