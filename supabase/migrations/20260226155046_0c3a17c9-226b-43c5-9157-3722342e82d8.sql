
-- Add FK columns and dates to factures
ALTER TABLE public.factures
  ADD COLUMN contrat_id uuid REFERENCES public.contrats(id) ON DELETE SET NULL,
  ADD COLUMN beneficiaire_id uuid REFERENCES public.beneficiaires(id) ON DELETE SET NULL,
  ADD COLUMN devis_id uuid REFERENCES public.devis(id) ON DELETE SET NULL,
  ADD COLUMN date_emission date NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN date_echeance date;

-- Index for lookups
CREATE INDEX idx_factures_contrat_id ON public.factures(contrat_id);
CREATE INDEX idx_factures_beneficiaire_id ON public.factures(beneficiaire_id);
