import { format, startOfWeek, addDays, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { timeToMinutes } from "@/modules/planning/services/planningService";

interface PlanningEvent {
  date: string;
  debut: string;
  fin: string;
  debut_reel: string | null;
  fin_reelle: string | null;
  statut: string;
  beneficiaire: string;
  employe: string;
}

interface Facture {
  periode: string;
  montant_ttc: number;
}

interface Beneficiaire {
  service: string | null;
}

/**
 * Dashboard KPI computation — no React, pure functions.
 */

export const computeOccupationRate = (todayEvents: PlanningEvent[]): number => {
  if (todayEvents.length === 0) return 0;
  const actives = todayEvents.filter(
    (e) => e.statut === "Terminée" || e.statut === "En cours"
  ).length;
  return Math.round((actives / todayEvents.length) * 100);
};

export const computeAnomalies = (events: PlanningEvent[]): number => {
  return events.filter((ev) => {
    if (ev.statut !== "Terminée" || !ev.debut_reel || !ev.fin_reelle) return false;
    const prevuDuration = timeToMinutes(ev.fin) - timeToMinutes(ev.debut);
    const reelDuration = timeToMinutes(ev.fin_reelle) - timeToMinutes(ev.debut_reel);
    return Math.abs(prevuDuration - reelDuration) > 15;
  }).length;
};

export const computeMonthlyCA = (factures: Facture[]): number => {
  const currentMonth = format(new Date(), "yyyy-MM");
  return factures
    .filter(
      (f) =>
        f.periode?.startsWith(currentMonth) ||
        f.periode === format(new Date(), "MM/yyyy")
    )
    .reduce((sum, f) => sum + (f.montant_ttc ?? 0), 0);
};

export const formatCA = (v: number): string => {
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k€`;
  return `${v.toFixed(0)}€`;
};

export const computeWeeklyHours = (events: PlanningEvent[]) => {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  return days.map((day) => {
    const dk = format(day, "yyyy-MM-dd");
    const dayEvs = events.filter((e) => e.date === dk);
    const planifiees = dayEvs.reduce(
      (sum, ev) => sum + (timeToMinutes(ev.fin) - timeToMinutes(ev.debut)) / 60,
      0
    );
    const realisees = dayEvs
      .filter((ev) => ev.debut_reel && ev.fin_reelle)
      .reduce(
        (sum, ev) =>
          sum + (timeToMinutes(ev.fin_reelle!) - timeToMinutes(ev.debut_reel!)) / 60,
        0
      );
    return {
      jour: format(day, "EEE", { locale: fr }).replace(".", ""),
      planifiees: Math.round(planifiees * 10) / 10,
      realisees: Math.round(realisees * 10) / 10,
    };
  });
};

export const computeServiceTypes = (beneficiaires: Beneficiaire[], colors: string[]) => {
  const counts: Record<string, number> = {};
  for (const b of beneficiaires) {
    const svc = b.service || "Non défini";
    counts[svc] = (counts[svc] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
};

export const computeMonthlyEvolution = (events: PlanningEvent[]) => {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i));
  return months.map((m) => {
    const prefix = format(m, "yyyy-MM");
    const monthBenefs = new Set(
      events.filter((e) => e.date.startsWith(prefix)).map((e) => e.beneficiaire)
    );
    const heures = events
      .filter((e) => e.date.startsWith(prefix))
      .reduce(
        (sum, ev) => sum + (timeToMinutes(ev.fin) - timeToMinutes(ev.debut)) / 60,
        0
      );
    return {
      mois: format(m, "MMM", { locale: fr }),
      beneficiaires: monthBenefs.size,
      heures: Math.round(heures),
    };
  });
};
