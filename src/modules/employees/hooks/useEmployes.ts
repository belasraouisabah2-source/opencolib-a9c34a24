import { createCrudHooks } from "@/shared/hooks/useCrudHooks";
import type { Tables } from "@/integrations/supabase/types";

type Employe = Tables<"employes">;

const { useGetAll, useInsert, useUpdate, useRemove } = createCrudHooks<Employe>("employes", "code");

export const useEmployes = useGetAll;
export const useInsertEmploye = useInsert;
export const useUpdateEmploye = useUpdate;
export const useDeleteEmploye = useRemove;
