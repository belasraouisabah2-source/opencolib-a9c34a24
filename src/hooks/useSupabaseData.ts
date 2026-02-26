import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// ── Queries ──

export const useClients = () =>
  useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("code");
      if (error) throw error;
      return data;
    },
  });

export const useServices = () =>
  useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("code");
      if (error) throw error;
      return data;
    },
  });

export const useSecteurs = () =>
  useQuery({
    queryKey: ["secteurs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("secteurs").select("*").order("code");
      if (error) throw error;
      return data;
    },
  });

export const useBeneficiaires = () =>
  useQuery({
    queryKey: ["beneficiaires"],
    queryFn: async () => {
      const { data, error } = await supabase.from("beneficiaires").select("*").order("code");
      if (error) throw error;
      return data;
    },
  });

export const useEmployes = () =>
  useQuery({
    queryKey: ["employes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employes").select("*").order("code");
      if (error) throw error;
      return data;
    },
  });

export const usePlanningEvents = () =>
  useQuery({
    queryKey: ["planning_events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("planning_events").select("*").order("date").order("debut");
      if (error) throw error;
      return data;
    },
  });

export const useFactures = () =>
  useQuery({
    queryKey: ["factures"],
    queryFn: async () => {
      const { data, error } = await supabase.from("factures").select("*").order("code");
      if (error) throw error;
      return data;
    },
  });

export const useBeneficiaireAbsences = () =>
  useQuery({
    queryKey: ["beneficiaire_absences"],
    queryFn: async () => {
      const { data, error } = await supabase.from("beneficiaire_absences").select("*").order("date_debut", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useDevis = () =>
  useQuery({
    queryKey: ["devis"],
    queryFn: async () => {
      const { data, error } = await supabase.from("devis").select("*").order("date_creation", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

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

export const useDevisLignes = (devisId?: string) =>
  useQuery({
    queryKey: ["devis_lignes", devisId],
    queryFn: async () => {
      const { data, error } = await supabase.from("devis_lignes").select("*").eq("devis_id", devisId as any).order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!devisId,
  });

export const useContrats = () =>
  useQuery({
    queryKey: ["contrats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contrats").select("*").order("date_debut", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useContratLignes = (contratId?: string) =>
  useQuery({
    queryKey: ["contrat_lignes", contratId],
    queryFn: async () => {
      const { data, error } = await supabase.from("contrat_lignes").select("*").eq("contrat_id", contratId as any).order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!contratId,
  });

// ── Generic mutation factory ──

type TableName = "clients" | "services" | "secteurs" | "beneficiaires" | "employes" | "planning_events" | "factures" | "devis" | "devis_lignes" | "actes_soins" | "contrats" | "contrat_lignes";

function useInsertMutation(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const { data, error } = await supabase.from(table).insert(row as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast({ title: "Enregistrement créé" });
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}

function useUpdateMutation(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: Record<string, unknown> & { id: string }) => {
      const { data, error } = await supabase.from(table).update(rest as any).eq("id", id as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast({ title: "Enregistrement modifié" });
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}

function useDeleteMutation(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast({ title: "Enregistrement supprimé" });
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}

// ── Per-entity mutation hooks ──

export const useInsertClient = () => useInsertMutation("clients");
export const useUpdateClient = () => useUpdateMutation("clients");
export const useDeleteClient = () => useDeleteMutation("clients");

export const useInsertService = () => useInsertMutation("services");
export const useUpdateService = () => useUpdateMutation("services");
export const useDeleteService = () => useDeleteMutation("services");

export const useInsertSecteur = () => useInsertMutation("secteurs");
export const useUpdateSecteur = () => useUpdateMutation("secteurs");
export const useDeleteSecteur = () => useDeleteMutation("secteurs");

export const useInsertBeneficiaire = () => useInsertMutation("beneficiaires");
export const useUpdateBeneficiaire = () => useUpdateMutation("beneficiaires");
export const useDeleteBeneficiaire = () => useDeleteMutation("beneficiaires");

export const useInsertEmploye = () => useInsertMutation("employes");
export const useUpdateEmploye = () => useUpdateMutation("employes");
export const useDeleteEmploye = () => useDeleteMutation("employes");

export const useInsertPlanningEvent = () => useInsertMutation("planning_events");
export const useUpdatePlanningEvent = () => useUpdateMutation("planning_events");
export const useDeletePlanningEvent = () => useDeleteMutation("planning_events");

export const useInsertFacture = () => useInsertMutation("factures");
export const useUpdateFacture = () => useUpdateMutation("factures");
export const useDeleteFacture = () => useDeleteMutation("factures");

export const useInsertDevis = () => useInsertMutation("devis");
export const useUpdateDevis = () => useUpdateMutation("devis");
export const useDeleteDevis = () => useDeleteMutation("devis");

export const useInsertDevisLigne = () => useInsertMutation("devis_lignes");
export const useDeleteDevisLigne = () => useDeleteMutation("devis_lignes");

export const useInsertContrat = () => useInsertMutation("contrats");
export const useUpdateContrat = () => useUpdateMutation("contrats");
export const useDeleteContrat = () => useDeleteMutation("contrats");

export const useInsertContratLigne = () => useInsertMutation("contrat_lignes");
export const useDeleteContratLigne = () => useDeleteMutation("contrat_lignes");
