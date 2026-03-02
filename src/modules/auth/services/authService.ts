import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/shared/permissions/permissions";
import { SESSION_TIMEOUT_MS, MAX_FAILED_ATTEMPTS, LOCKOUT_DURATION_MS } from "@/shared/constants/app.constants";

export interface SignInResult {
  error: string | null;
}

export interface AuthState {
  failedAttempts: number;
  lockedUntil: number | null;
}

/**
 * Auth business logic — no React state, pure async operations.
 */
export async function signInUser(
  email: string,
  password: string,
  state: AuthState
): Promise<{ error: string | null; newState: Partial<AuthState> }> {
  if (state.lockedUntil && Date.now() < state.lockedUntil) {
    const mins = Math.ceil((state.lockedUntil - Date.now()) / 60000);
    return { error: `Compte verrouillé. Réessayez dans ${mins} minute(s).`, newState: {} };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const next = state.failedAttempts + 1;
    if (next >= MAX_FAILED_ATTEMPTS) {
      return {
        error: "Trop de tentatives échouées. Compte verrouillé pour 15 minutes.",
        newState: { failedAttempts: 0, lockedUntil: Date.now() + LOCKOUT_DURATION_MS },
      };
    }
    return { error: error.message, newState: { failedAttempts: next } };
  }
  return { error: null, newState: { failedAttempts: 0, lockedUntil: null } };
}

export async function signUpUser(email: string, password: string, displayName: string): Promise<SignInResult> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: { display_name: displayName },
    },
  });
  return { error: error?.message ?? null };
}

export async function signOutUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
    // Even if signOut fails, caller clears local state
  }
}

export async function resetUserPassword(email: string): Promise<SignInResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error: error?.message ?? null };
}

export async function fetchUserRoles(userId: string): Promise<AppRole[]> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r: any) => r.role as AppRole);
}
