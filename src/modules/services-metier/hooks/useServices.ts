import { createCrudHooks } from "@/shared/hooks/useCrudHooks";
import type { Tables } from "@/integrations/supabase/types";

type Service = Tables<"services">;

const { useGetAll, useInsert, useUpdate, useRemove } = createCrudHooks<Service>("services", "code");

export const useServices = useGetAll;
export const useInsertService = useInsert;
export const useUpdateService = useUpdate;
export const useDeleteService = useRemove;
