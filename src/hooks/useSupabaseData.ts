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

// ── Generic mutation factory ──

type TableName = "clients" | "services" | "secteurs" | "beneficiaires" | "employes" | "planning_events" | "factures";

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
