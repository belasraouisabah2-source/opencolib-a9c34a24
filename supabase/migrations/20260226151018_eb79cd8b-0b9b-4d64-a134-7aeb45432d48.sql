
-- Table de référence des actes et soins par type de service
CREATE TABLE public.actes_soins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  type_service TEXT NOT NULL, -- SAD, SSIAD, SPASAD
  categorie TEXT NOT NULL, -- Acte ou Soin
  description TEXT,
  tarif_defaut NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.actes_soins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read actes_soins" ON public.actes_soins FOR SELECT USING (true);
CREATE POLICY "Authenticated insert actes_soins" ON public.actes_soins FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated update actes_soins" ON public.actes_soins FOR UPDATE USING (true);
CREATE POLICY "Authenticated delete actes_soins" ON public.actes_soins FOR DELETE USING (true);

-- Actes SAAD
INSERT INTO public.actes_soins (nom, type_service, categorie, description, tarif_defaut) VALUES
('Aide ménagère', 'SAD', 'Acte', 'Entretien du logement et du linge', 22.50),
('Aide à la toilette', 'SAD', 'Acte', 'Aide à l''hygiène corporelle', 25.00),
('Préparation de repas', 'SAD', 'Acte', 'Préparation et service des repas', 20.00),
('Courses', 'SAD', 'Acte', 'Achats alimentaires et courants', 18.00),
('Accompagnement sorties', 'SAD', 'Acte', 'Accompagnement pour rendez-vous, promenades', 20.00),
('Aide administrative', 'SAD', 'Acte', 'Aide aux démarches administratives', 22.00),
('Aide au lever/coucher', 'SAD', 'Acte', 'Assistance au lever et au coucher', 24.00),
('Garde de jour', 'SAD', 'Acte', 'Présence et surveillance en journée', 19.00),
('Garde de nuit', 'SAD', 'Acte', 'Présence et surveillance nocturne', 25.00);

-- Soins SSIAD
INSERT INTO public.actes_soins (nom, type_service, categorie, description, tarif_defaut) VALUES
('Soins infirmiers', 'SSIAD', 'Soin', 'Actes infirmiers sur prescription', 30.00),
('Soins de nursing', 'SSIAD', 'Soin', 'Soins d''hygiène et de confort', 28.00),
('Aide à la mobilisation', 'SSIAD', 'Soin', 'Transferts, aide à la marche, prévention des chutes', 26.00),
('Surveillance médicale', 'SSIAD', 'Soin', 'Surveillance des constantes et de l''état général', 30.00),
('Pansements', 'SSIAD', 'Soin', 'Réalisation et surveillance de pansements', 28.00),
('Distribution médicaments', 'SSIAD', 'Soin', 'Préparation et aide à la prise de médicaments', 25.00),
('Soins de prévention', 'SSIAD', 'Soin', 'Prévention des escarres, déshydratation', 27.00);

-- Soins SPASAD (combinaison des deux)
INSERT INTO public.actes_soins (nom, type_service, categorie, description, tarif_defaut) VALUES
('Aide ménagère', 'SPASAD', 'Acte', 'Entretien du logement et du linge', 22.50),
('Aide à la toilette', 'SPASAD', 'Acte', 'Aide à l''hygiène corporelle', 25.00),
('Préparation de repas', 'SPASAD', 'Acte', 'Préparation et service des repas', 20.00),
('Soins infirmiers', 'SPASAD', 'Soin', 'Actes infirmiers sur prescription', 30.00),
('Soins de nursing', 'SPASAD', 'Soin', 'Soins d''hygiène et de confort', 28.00),
('Surveillance médicale', 'SPASAD', 'Soin', 'Surveillance des constantes et de l''état général', 30.00);
