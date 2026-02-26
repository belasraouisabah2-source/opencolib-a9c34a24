
-- Table des contrats
CREATE TABLE public.contrats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  devis_id UUID REFERENCES public.devis(id),
  beneficiaire_id UUID REFERENCES public.beneficiaires(id),
  beneficiaire_nom TEXT NOT NULL,
  
  -- Infos reprises du devis
  montant_total NUMERIC NOT NULL DEFAULT 0,
  
  -- Infos spécifiques au contrat
  date_signature DATE NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE,
  modalites_paiement TEXT,
  clauses TEXT,
  prise_en_charge_id UUID REFERENCES public.beneficiaire_prises_en_charge(id),
  
  statut TEXT NOT NULL DEFAULT 'Actif',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lignes de contrat (copiées du devis)
CREATE TABLE public.contrat_lignes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contrat_id UUID NOT NULL REFERENCES public.contrats(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  description TEXT,
  frequence TEXT,
  duree_heures NUMERIC NOT NULL DEFAULT 1,
  tarif_horaire NUMERIC NOT NULL DEFAULT 0,
  montant NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.contrats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contrat_lignes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read contrats" ON public.contrats FOR SELECT USING (true);
CREATE POLICY "Authenticated insert contrats" ON public.contrats FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated update contrats" ON public.contrats FOR UPDATE USING (true);
CREATE POLICY "Authenticated delete contrats" ON public.contrats FOR DELETE USING (true);

CREATE POLICY "Authenticated read contrat_lignes" ON public.contrat_lignes FOR SELECT USING (true);
CREATE POLICY "Authenticated insert contrat_lignes" ON public.contrat_lignes FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated update contrat_lignes" ON public.contrat_lignes FOR UPDATE USING (true);
CREATE POLICY "Authenticated delete contrat_lignes" ON public.contrat_lignes FOR DELETE USING (true);

-- Trigger updated_at
CREATE TRIGGER update_contrats_updated_at
  BEFORE UPDATE ON public.contrats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
