export type AppRole =
  | "admin"
  | "responsable_service"
  | "responsable_secteur"
  | "coordinateur"
  | "comptable"
  | "rh"
  | "intervenant";

/**
 * Check if a list of roles includes a specific role.
 */
export function checkRole(roles: AppRole[], role: AppRole): boolean {
  return roles.includes(role);
}

/**
 * Role display labels.
 */
export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrateur",
  responsable_service: "Responsable de service",
  responsable_secteur: "Responsable de secteur",
  coordinateur: "Coordinateur",
  comptable: "Comptable",
  rh: "RH",
  intervenant: "Intervenant",
};

/**
 * Role badge color classes.
 */
export const ROLE_COLOR_MAP: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  responsable_service: "bg-primary/10 text-primary border-primary/20",
  responsable_secteur: "bg-accent/80 text-accent-foreground border-accent",
  coordinateur: "bg-secondary text-secondary-foreground border-secondary",
  comptable: "bg-muted text-muted-foreground border-border",
  rh: "bg-primary/10 text-primary border-primary/20",
  intervenant: "bg-muted text-muted-foreground border-border",
};
