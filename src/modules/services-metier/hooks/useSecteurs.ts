import { createCrudHooks } from "@/shared/hooks/useCrudHooks";
import type { Tables } from "@/integrations/supabase/types";

type Secteur = Tables<"secteurs">;

const { useGetAll, useInsert, useUpdate, useRemove } = createCrudHooks<Secteur>("secteurs", "code");

export const useSecteurs = useGetAll;
export const useInsertSecteur = useInsert;
export const useUpdateSecteur = useUpdate;
export const useDeleteSecteur = useRemove;
