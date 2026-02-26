
-- Table principale des devis
CREATE TABLE public.devis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  beneficiaire_id UUID REFERENCES public.beneficiaires(id) ON DELETE CASCADE,
  beneficiaire_nom TEXT NOT NULL,
  date_creation DATE NOT NULL DEFAULT CURRENT_DATE,
  date_validite DATE NOT NULL,
  montant_total NUMERIC NOT NULL DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'Brouillon',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lignes de devis (services proposés)
CREATE TABLE public.devis_lignes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  devis_id UUID NOT NULL REFERENCES public.devis(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  description TEXT,
  frequence TEXT,
  duree_heures NUMERIC NOT NULL DEFAULT 1,
  tarif_horaire NUMERIC NOT NULL DEFAULT 0,
  montant NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis_lignes ENABLE ROW LEVEL SECURITY;

-- RLS policies for devis
CREATE POLICY "Authenticated read devis" ON public.devis FOR SELECT USING (true);
CREATE POLICY "Authenticated insert devis" ON public.devis FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated update devis" ON public.devis FOR UPDATE USING (true);
CREATE POLICY "Authenticated delete devis" ON public.devis FOR DELETE USING (true);

-- RLS policies for devis_lignes
CREATE POLICY "Authenticated read devis_lignes" ON public.devis_lignes FOR SELECT USING (true);
CREATE POLICY "Authenticated insert devis_lignes" ON public.devis_lignes FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated update devis_lignes" ON public.devis_lignes FOR UPDATE USING (true);
CREATE POLICY "Authenticated delete devis_lignes" ON public.devis_lignes FOR DELETE USING (true);

-- Trigger for updated_at on devis
CREATE TRIGGER update_devis_updated_at
BEFORE UPDATE ON public.devis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
