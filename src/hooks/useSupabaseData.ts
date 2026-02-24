import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
