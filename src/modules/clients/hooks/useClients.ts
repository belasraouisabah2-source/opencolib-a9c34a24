import { createCrudHooks } from "@/shared/hooks/useCrudHooks";
import type { Tables } from "@/integrations/supabase/types";

type Client = Tables<"clients">;

const { useGetAll, useInsert, useUpdate, useRemove } = createCrudHooks<Client>("clients", "code");

export const useClients = useGetAll;
export const useInsertClient = useInsert;
export const useUpdateClient = useUpdate;
export const useDeleteClient = useRemove;
