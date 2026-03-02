export type { AppRole } from "@/shared/permissions/permissions";

export interface AuthContextType {
  user: import("@supabase/supabase-js").User | null;
  session: import("@supabase/supabase-js").Session | null;
  roles: import("@/shared/permissions/permissions").AppRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  hasRole: (role: import("@/shared/permissions/permissions").AppRole) => boolean;
  failedAttempts: number;
  lockedUntil: number | null;
}
