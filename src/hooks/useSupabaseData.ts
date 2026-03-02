/**
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  BACKWARD COMPATIBILITY LAYER                                   │
 * │  Re-exports all hooks from new modular structure.               │
 * │  Existing components import from here — no breaking changes.    │
 * │  New code should import directly from module hooks.             │
 * └─────────────────────────────────────────────────────────────────┘
 */

// ── Clients ──
export { useClients, useInsertClient, useUpdateClient, useDeleteClient } from "@/modules/clients/hooks/useClients";

// ── Services ──
export { useServices, useInsertService, useUpdateService, useDeleteService } from "@/modules/services-metier/hooks/useServices";

// ── Secteurs ──
export { useSecteurs, useInsertSecteur, useUpdateSecteur, useDeleteSecteur } from "@/modules/services-metier/hooks/useSecteurs";

// ── Bénéficiaires ──
export { useBeneficiaires, useInsertBeneficiaire, useUpdateBeneficiaire, useDeleteBeneficiaire } from "@/modules/beneficiaries/hooks/useBeneficiaires";

// ── Employés ──
export { useEmployes, useInsertEmploye, useUpdateEmploye, useDeleteEmploye } from "@/modules/employees/hooks/useEmployes";

// ── Planning ──
export { usePlanningEvents, useInsertPlanningEvent, useUpdatePlanningEvent, useDeletePlanningEvent } from "@/modules/planning/hooks/usePlanning";

// ── Billing (Factures, Devis, Contrats) ──
export {
  useFactures, useInsertFacture, useUpdateFacture, useDeleteFacture,
  useDevis, useDevisLignes, useInsertDevisLigne, useDeleteDevisLigne,
  useContrats, useContratLignes, useInsertContrat, useUpdateContrat, useDeleteContrat,
  useInsertContratLigne, useDeleteContratLigne,
  useActesSoins, useBeneficiaireAbsences,
} from "@/modules/billing/hooks/useBilling";
