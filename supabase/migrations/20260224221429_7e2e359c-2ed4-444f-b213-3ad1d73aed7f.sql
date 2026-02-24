
CREATE TABLE public.factures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  beneficiaire TEXT NOT NULL,
  periode TEXT NOT NULL,
  montant_ht NUMERIC(10,2) NOT NULL DEFAULT 0,
  tva NUMERIC(10,2) NOT NULL DEFAULT 0,
  montant_ttc NUMERIC(10,2) NOT NULL DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'En attente'
);
ALTER TABLE public.factures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read factures" ON public.factures FOR SELECT USING (true);
CREATE POLICY "Public insert factures" ON public.factures FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update factures" ON public.factures FOR UPDATE USING (true);
CREATE POLICY "Public delete factures" ON public.factures FOR DELETE USING (true);
