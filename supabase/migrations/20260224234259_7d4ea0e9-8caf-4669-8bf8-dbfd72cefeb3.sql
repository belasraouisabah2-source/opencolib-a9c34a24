
-- Ajouter colonnes manquantes à beneficiaires
ALTER TABLE public.beneficiaires
  ADD COLUMN IF NOT EXISTS secteur text,
  ADD COLUMN IF NOT EXISTS numero_ss text,
  ADD COLUMN IF NOT EXISTS situation_familiale text,
  ADD COLUMN IF NOT EXISTS medecin_traitant text,
  ADD COLUMN IF NOT EXISTS allergies text,
  ADD COLUMN IF NOT EXISTS pathologies text,
  ADD COLUMN IF NOT EXISTS gir text;

-- Table entourage
CREATE TABLE public.beneficiaire_entourage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiaire_id uuid NOT NULL REFERENCES public.beneficiaires(id) ON DELETE CASCADE,
  nom text NOT NULL,
  prenom text NOT NULL,
  lien_parente text,
  telephone_fixe text,
  telephone_mobile text,
  email text,
  adresse text,
  personne_urgence boolean NOT NULL DEFAULT false,
  personne_confiance boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.beneficiaire_entourage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read beneficiaire_entourage" ON public.beneficiaire_entourage FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert beneficiaire_entourage" ON public.beneficiaire_entourage FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update beneficiaire_entourage" ON public.beneficiaire_entourage FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete beneficiaire_entourage" ON public.beneficiaire_entourage FOR DELETE TO authenticated USING (true);

-- Table absences
CREATE TABLE public.beneficiaire_absences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiaire_id uuid NOT NULL REFERENCES public.beneficiaires(id) ON DELETE CASCADE,
  date_debut date NOT NULL,
  date_fin date NOT NULL,
  motif text NOT NULL DEFAULT 'Autre',
  commentaire text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.beneficiaire_absences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read beneficiaire_absences" ON public.beneficiaire_absences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert beneficiaire_absences" ON public.beneficiaire_absences FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update beneficiaire_absences" ON public.beneficiaire_absences FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete beneficiaire_absences" ON public.beneficiaire_absences FOR DELETE TO authenticated USING (true);

-- Table prises en charge
CREATE TABLE public.beneficiaire_prises_en_charge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiaire_id uuid NOT NULL REFERENCES public.beneficiaires(id) ON DELETE CASCADE,
  date_debut date NOT NULL,
  date_fin date,
  service text,
  organisme text,
  nb_heures numeric NOT NULL DEFAULT 0,
  nb_heures_restant numeric NOT NULL DEFAULT 0,
  heures_normales numeric NOT NULL DEFAULT 0,
  heures_dimanches_feries numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.beneficiaire_prises_en_charge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read beneficiaire_prises_en_charge" ON public.beneficiaire_prises_en_charge FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert beneficiaire_prises_en_charge" ON public.beneficiaire_prises_en_charge FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update beneficiaire_prises_en_charge" ON public.beneficiaire_prises_en_charge FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete beneficiaire_prises_en_charge" ON public.beneficiaire_prises_en_charge FOR DELETE TO authenticated USING (true);
