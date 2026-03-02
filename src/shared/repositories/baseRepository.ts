import { supabase } from "@/integrations/supabase/client";
import type { TableName } from "@/shared/types/common.types";

/**
 * Generic repository factory for CRUD operations on Supabase tables.
 */
export function createRepository<T>(tableName: TableName) {
  return {
    getAll: async (orderBy = "id", options?: { ascending?: boolean }) => {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .order(orderBy, { ascending: options?.ascending ?? true });
      if (error) throw error;
      return data as unknown as T[];
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", id as any)
        .single();
      if (error) throw error;
      return data as unknown as T;
    },

    getByField: async (field: string, value: unknown, orderBy?: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q = supabase.from(tableName).select("*") as any;
      q = q.eq(field, value);
      if (orderBy) q = q.order(orderBy);
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as T[];
    },

    insert: async (row: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from(tableName)
        .insert(row as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as T;
    },

    insertMany: async (rows: Record<string, unknown>[]) => {
      const { data, error } = await supabase
        .from(tableName)
        .insert(rows as any);
      if (error) throw error;
      return data;
    },

    update: async (id: string, row: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from(tableName)
        .update(row as any)
        .eq("id", id as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as T;
    },

    remove: async (id: string) => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", id as any);
      if (error) throw error;
    },

    removeByField: async (field: string, value: unknown) => {
      let q = supabase.from(tableName).delete() as any;
      q = q.eq(field, value);
      const { error } = await q;
      if (error) throw error;
    },
  };
}
