

# Restructuration en Monolithe Modulaire -- OpenColib

## Objectif

Reorganiser le code existant en modules metier independants avec separation claire des couches (presentation, business, data), sans modifier la logique metier ni ajouter de fonctionnalites.

## Structure cible

```text
src/
  modules/
    auth/
      components/        (Auth.tsx, ResetPassword.tsx, ProtectedRoute.tsx)
      services/           (authService.ts - logique signIn/signUp/resetPassword)
      hooks/              (useAuth.tsx - contexte React, consomme le service)
      types/              (auth.types.ts)
    users/
      components/         (AdminUsers.tsx)
      services/           (userService.ts)
      hooks/              (useUsers.ts)
      types/              (user.types.ts)
    clients/
      components/         (ClientsPage.tsx)
      repositories/       (clientRepository.ts - acces Supabase)
      hooks/              (useClients.ts - queries/mutations)
      types/              (client.types.ts)
    services-metier/
      components/         (ServicesPage.tsx, SecteursPage.tsx)
      repositories/       (serviceRepository.ts, secteurRepository.ts)
      hooks/              (useServices.ts, useSecteurs.ts)
      types/              (service.types.ts)
    beneficiaries/
      components/         (BeneficiairesPage.tsx, BeneficiaireDetailDialog, tabs/)
      repositories/       (beneficiaireRepository.ts, absenceRepository.ts, entourageRepository.ts, prisesEnChargeRepository.ts)
      hooks/              (useBeneficiaires.ts)
      types/              (beneficiaire.types.ts)
    employees/
      components/         (EmployesPage.tsx)
      repositories/       (employeRepository.ts)
      hooks/              (useEmployes.ts)
      types/              (employe.types.ts)
    planning/
      components/         (PlanningPage.tsx, PlanningBeneficiaires.tsx, PlanningMulti.tsx)
      services/           (planningService.ts - calculs heures, filtrage, anomalies)
      repositories/       (planningRepository.ts)
      hooks/              (usePlanning.ts)
      types/              (planning.types.ts)
    billing/
      components/         (FacturationPage.tsx, FactureDetailDialog.tsx, DevisPage.tsx, DevisFormDialog.tsx, DevisDetailDialog.tsx, ContratsPage.tsx, ContratDetailDialog.tsx, TransformerContratDialog.tsx, GenererFactureDialog.tsx)
      services/           (factureService.ts - generation PDF, calculs montants)
      repositories/       (factureRepository.ts, devisRepository.ts, contratRepository.ts, devisLigneRepository.ts, contratLigneRepository.ts)
      hooks/              (useFactures.ts, useDevis.ts, useContrats.ts)
      types/              (billing.types.ts)
    dashboard/
      components/         (DashboardPage.tsx)
      services/           (dashboardService.ts - calculs KPIs, stats)
      types/              (dashboard.types.ts)
  shared/
    components/
      ui/                 (tous les composants Shadcn/UI existants)
      crud/               (EntityFormDialog, DeleteDialog)
      layout/             (AppLayout, Sidebar, Topbar, NavLink)
    hooks/                (use-mobile, use-toast)
    lib/                  (utils.ts)
    types/                (common.types.ts)
    constants/            (app.constants.ts - statuts, couleurs, timeouts)
    errors/               (errorHandler.ts - gestion centralisee des erreurs)
    permissions/          (permissions.ts - verification des roles centralisee)
  integrations/
    supabase/             (client.ts, types.ts - inchanges, auto-generes)
  App.tsx
  main.tsx
  index.css
```

## Etapes d'implementation

### 1. Creer l'infrastructure partagee

- `src/shared/constants/app.constants.ts` : centraliser les constantes (SESSION_TIMEOUT_MS, MAX_FAILED_ATTEMPTS, statuts, couleurs de badges)
- `src/shared/errors/errorHandler.ts` : factoriser la gestion des erreurs toast en une fonction reutilisable
- `src/shared/permissions/permissions.ts` : extraire la logique `hasRole` et les types de roles
- `src/shared/types/common.types.ts` : types partages (TableName, options de select, etc.)
- Deplacer `src/components/ui/`, `src/components/crud/`, `src/components/layout/` vers `src/shared/components/`
- Deplacer `src/hooks/use-mobile.tsx` et `src/hooks/use-toast.ts` vers `src/shared/hooks/`

### 2. Creer le pattern Repository generique

- `src/shared/repositories/baseRepository.ts` : classe/fonctions generiques pour les operations CRUD Supabase (getAll, getById, insert, update, delete)
- Chaque module aura un repository qui etend/utilise ce pattern de base

### 3. Creer le pattern Hook generique

- `src/shared/hooks/useCrudHooks.ts` : factory generique pour creer useQuery/useMutation par table (remplace le monolithe useSupabaseData.ts)

### 4. Migrer chaque module (dans l'ordre des dependances)

**auth/** : Extraire la logique metier de `useAuth.tsx` dans `authService.ts` (signIn, signUp, signOut, resetPassword). Le hook devient un consommateur du service + gestionnaire d'etat React.

**clients/** : Deplacer `Clients.tsx`, creer `clientRepository.ts` (appels Supabase) et `useClients.ts` (hooks React Query).

**services-metier/** : Regrouper Services + Secteurs (meme domaine metier). Creer repositories et hooks dedies.

**employees/** : Meme pattern que clients.

**beneficiaries/** : Deplacer `Beneficiaires.tsx` + sous-composants (tabs, detail dialog). Creer repositories pour chaque sous-entite (absences, entourage, prises en charge).

**planning/** : Extraire les fonctions de calcul (timeToMinutes, timeDiffHours, statusIcon, statusBg) dans `planningService.ts`. Deplacer les 3 pages planning.

**billing/** : Regrouper Factures + Devis + Contrats. Deplacer `generateFacturePdf.ts` dans `billing/services/`. Creer repositories et hooks par entite.

**dashboard/** : Extraire les calculs de KPIs (tauxOccupation, anomalies, caMois, weeklyHours, serviceTypes, monthlyEvolution) dans `dashboardService.ts`. Le composant ne fait plus que de l'affichage.

**users/** : Deplacer AdminUsers.tsx et le hook associe.

### 5. Mettre a jour les imports et le routeur

- Mettre a jour `App.tsx` pour importer les pages depuis `src/modules/*/components/`
- Mettre a jour tous les chemins d'alias `@/` en consequence
- Supprimer les anciens fichiers (`src/pages/`, `src/hooks/useSupabaseData.ts`, `src/data/mockData.ts`)

### 6. Ajouter le diagramme d'architecture

Ajouter un commentaire en haut de `App.tsx` avec le diagramme d'architecture en ASCII decrivant les modules et leurs dependances.

## Regles respectees

- **Aucune logique metier dans les composants** : tous les calculs (KPIs, heures, montants, filtrage avance) sont dans les `services/`
- **Aucun acces DB dans les composants** : tout passe par `repositories/` -> `hooks/`
- **Pas de dependances circulaires** : les modules ne s'importent qu'entre eux via des interfaces, et les dependances vont toujours dans le sens dashboard -> planning/billing -> beneficiaries/employees -> shared
- **Pas de code duplique** : le pattern repository generique et les hooks factory eliminent la repetition presente dans `useSupabaseData.ts`
- **Compatible extraction microservices** : chaque module peut etre extrait independamment car il contient ses types, sa logique et son acces data

## Details techniques -- Pattern Repository

```typescript
// src/shared/repositories/baseRepository.ts
export function createRepository<T>(tableName: string) {
  return {
    getAll: async (orderBy = "id") => {
      const { data, error } = await supabase.from(tableName).select("*").order(orderBy);
      if (error) throw error;
      return data as T[];
    },
    insert: async (row: Partial<T>) => { ... },
    update: async (id: string, row: Partial<T>) => { ... },
    delete: async (id: string) => { ... },
  };
}
```

## Details techniques -- Extraction service (exemple Dashboard)

```typescript
// src/modules/dashboard/services/dashboardService.ts
export const computeOccupationRate = (todayEvents: PlanningEvent[]): number => {
  if (todayEvents.length === 0) return 0;
  const actives = todayEvents.filter(e => e.statut === "Terminee" || e.statut === "En cours").length;
  return Math.round((actives / todayEvents.length) * 100);
};

export const computeAnomalies = (events: PlanningEvent[]): number => { ... };
export const computeMonthlyCA = (factures: Facture[]): number => { ... };
export const computeWeeklyHours = (events: PlanningEvent[]): WeeklyData[] => { ... };
```

## Estimation

Ce refactoring touche environ 30+ fichiers (deplacement + modification d'imports) et la creation d'environ 25 nouveaux fichiers (repositories, services, types, infrastructure partagee). Aucune fonctionnalite n'est ajoutee ni modifiee.

