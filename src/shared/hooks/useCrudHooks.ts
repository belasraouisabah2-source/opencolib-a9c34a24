import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createRepository } from "@/shared/repositories/baseRepository";
import { handleMutationError, handleMutationSuccess } from "@/shared/errors/errorHandler";
import type { TableName } from "@/shared/types/common.types";

/**
 * Factory to create standardized useQuery + useMutation hooks for a Supabase table.
 */
export function createCrudHooks<T>(
  tableName: TableName,
  orderBy = "id",
  options?: { ascending?: boolean }
) {
  const repo = createRepository<T>(tableName);

  const useGetAll = () =>
    useQuery({
      queryKey: [tableName],
      queryFn: () => repo.getAll(orderBy, options),
    });

  const useInsert = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (row: Record<string, unknown>) => repo.insert(row),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [tableName] });
        handleMutationSuccess("Enregistrement créé");
      },
      onError: handleMutationError,
    });
  };

  const useUpdate = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, ...rest }: Record<string, unknown> & { id: string }) =>
        repo.update(id, rest),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [tableName] });
        handleMutationSuccess("Enregistrement modifié");
      },
      onError: handleMutationError,
    });
  };

  const useRemove = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => repo.remove(id),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [tableName] });
        handleMutationSuccess("Enregistrement supprimé");
      },
      onError: handleMutationError,
    });
  };

  return { useGetAll, useInsert, useUpdate, useRemove };
}
