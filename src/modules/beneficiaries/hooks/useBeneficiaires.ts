import { createCrudHooks } from "@/shared/hooks/useCrudHooks";
import type { Tables } from "@/integrations/supabase/types";

type Beneficiaire = Tables<"beneficiaires">;

const { useGetAll, useInsert, useUpdate, useRemove } = createCrudHooks<Beneficiaire>("beneficiaires", "code");

export const useBeneficiaires = useGetAll;
export const useInsertBeneficiaire = useInsert;
export const useUpdateBeneficiaire = useUpdate;
export const useDeleteBeneficiaire = useRemove;
