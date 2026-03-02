import { createCrudHooks } from "@/shared/hooks/useCrudHooks";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Facture = Tables<"factures">;
type Devis = Tables<"devis">;
type Contrat = Tables<"contrats">;

// ── Factures ──
const factureHooks = createCrudHooks<Facture>("factures", "code");
export const useFactures = factureHooks.useGetAll;
export const useInsertFacture = factureHooks.useInsert;
export const useUpdateFacture = factureHooks.useUpdate;
export const useDeleteFacture = factureHooks.useRemove;

// ── Devis ──
export const useDevis = () =>
  useQuery({
    queryKey: ["devis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devis")
        .select("*")
        .order("date_creation", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

const devisLigneHooks = createCrudHooks("devis_lignes", "created_at");
export const useInsertDevisLigne = devisLigneHooks.useInsert;
export const useDeleteDevisLigne = devisLigneHooks.useRemove;

export const useDevisLignes = (devisId?: string) =>
  useQuery({
    queryKey: ["devis_lignes", devisId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devis_lignes")
        .select("*")
        .eq("devis_id", devisId as any)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!devisId,
  });

// ── Contrats ──
export const useContrats = () =>
  useQuery({
    queryKey: ["contrats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contrats")
        .select("*")
        .order("date_debut", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

const contratHooks = createCrudHooks<Contrat>("contrats", "date_debut", { ascending: false });
export const useInsertContrat = contratHooks.useInsert;
export const useUpdateContrat = contratHooks.useUpdate;
export const useDeleteContrat = contratHooks.useRemove;

const contratLigneHooks = createCrudHooks("contrat_lignes", "created_at");
export const useInsertContratLigne = contratLigneHooks.useInsert;
export const useDeleteContratLigne = contratLigneHooks.useRemove;

export const useContratLignes = (contratId?: string) =>
  useQuery({
    queryKey: ["contrat_lignes", contratId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contrat_lignes")
        .select("*")
        .eq("contrat_id", contratId as any)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!contratId,
  });

// ── Actes/Soins ──
export const useActesSoins = (typeService?: string) =>
  useQuery({
    queryKey: ["actes_soins", typeService],
    queryFn: async () => {
      let query = supabase.from("actes_soins").select("*").order("categorie").order("nom");
      if (typeService) {
        query = query.eq("type_service", typeService as any);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

// ── Beneficiaire Absences (used by topbar notifications) ──
export const useBeneficiaireAbsences = () =>
  useQuery({
    queryKey: ["beneficiaire_absences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiaire_absences")
        .select("*")
        .order("date_debut", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
