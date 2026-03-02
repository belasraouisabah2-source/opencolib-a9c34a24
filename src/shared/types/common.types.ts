/**
 * All Supabase table names used in the application.
 */
export type TableName =
  | "clients"
  | "services"
  | "secteurs"
  | "beneficiaires"
  | "employes"
  | "planning_events"
  | "factures"
  | "devis"
  | "devis_lignes"
  | "actes_soins"
  | "contrats"
  | "contrat_lignes"
  | "beneficiaire_absences"
  | "beneficiaire_entourage"
  | "beneficiaire_prises_en_charge"
  | "ref_organismes"
  | "ref_services_pec";

/**
 * Generic select option for form selects.
 */
export interface SelectOption {
  label: string;
  value: string;
}
