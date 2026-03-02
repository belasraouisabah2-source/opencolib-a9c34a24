// ── Session & Security ──
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// ── Password policy ──
export const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: "8 caractères minimum" },
  { test: (p: string) => /[A-Z]/.test(p), label: "1 majuscule" },
  { test: (p: string) => /[a-z]/.test(p), label: "1 minuscule" },
  { test: (p: string) => /\d/.test(p), label: "1 chiffre" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: "1 caractère spécial" },
];

// ── Roles ──
export const ALL_ROLES = [
  { value: "admin", label: "Administrateur" },
  { value: "responsable_service", label: "Responsable de service" },
  { value: "responsable_secteur", label: "Responsable de secteur" },
  { value: "coordinateur", label: "Coordinateur" },
  { value: "comptable", label: "Comptable" },
  { value: "rh", label: "RH" },
  { value: "intervenant", label: "Intervenant" },
] as const;

// ── Status colors (badge classes) ──
export const ETAT_CLASSES = {
  Actif: "badge-active",
  Activé: "badge-active",
  Archivé: "badge-archived",
} as const;

// ── Dashboard chart colors ──
export const PIE_COLORS = [
  "hsl(199, 89%, 38%)",
  "hsl(172, 66%, 40%)",
  "hsl(260, 60%, 55%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 55%)",
];

export const STAT_COLOR_MAP: Record<string, string> = {
  "stat-blue": "bg-info/10 text-info",
  "stat-green": "bg-success/10 text-success",
  "stat-orange": "bg-warning/10 text-warning",
  "stat-red": "bg-destructive/10 text-destructive",
  "stat-purple": "bg-accent/10 text-accent",
};

// ── Billing ──
export const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export const PAYMENT_MODES = [
  "Prélèvement automatique", "Virement", "Chèque", "CESU", "Espèces",
];

// ── Beneficiaire ──
export const GIR_OPTIONS = ["GIR 1", "GIR 2", "GIR 3", "GIR 4", "GIR 5", "GIR 6"];
export const SITUATION_OPTIONS = ["Célibataire", "Marié(e)", "Pacsé(e)", "Veuf/Veuve", "Divorcé(e)"];
export const LIENS_PARENTE = ["Conjoint(e)", "Enfant", "Parent", "Frère/Sœur", "Ami(e)", "Voisin(e)", "Autre"];
export const MOTIFS_ABSENCE = ["Hospitalisation", "Vacances", "Autre"];
