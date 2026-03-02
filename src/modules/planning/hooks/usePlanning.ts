import { createCrudHooks } from "@/shared/hooks/useCrudHooks";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type PlanningEvent = Tables<"planning_events">;

const { useGetAll, useInsert, useUpdate, useRemove } = createCrudHooks<PlanningEvent>("planning_events", "date");

export const usePlanningEvents = () =>
  useQuery({
    queryKey: ["planning_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("planning_events")
        .select("*")
        .order("date")
        .order("debut");
      if (error) throw error;
      return data;
    },
  });

export const useInsertPlanningEvent = useInsert;
export const useUpdatePlanningEvent = useUpdate;
export const useDeletePlanningEvent = useRemove;
