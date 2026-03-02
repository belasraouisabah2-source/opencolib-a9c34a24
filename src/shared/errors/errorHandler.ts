import { toast } from "@/hooks/use-toast";

/**
 * Centralized error handler for mutations and async operations.
 * Shows a destructive toast with the error message.
 */
export function handleMutationError(error: Error) {
  toast({ title: "Erreur", description: error.message, variant: "destructive" });
}

/**
 * Centralized success handler for mutations.
 */
export function handleMutationSuccess(message: string) {
  toast({ title: message });
}

/**
 * Generic error handler that logs and shows toast.
 */
export function handleError(title: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${title}]`, error);
  toast({ title, description: message, variant: "destructive" });
}
