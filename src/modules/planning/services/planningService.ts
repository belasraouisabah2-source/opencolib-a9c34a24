/**
 * Planning business logic — time calculations, anomaly detection, status helpers.
 */

/** Convert "HH:MM" or "HH:MM:SS" to minutes. */
export const timeToMinutes = (t: string): number => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

/** Calculate hours difference between two time strings "HH:MM:SS". */
export const timeDiffHours = (start: string, end: string): number => {
  const sMin = timeToMinutes(start);
  const eMin = timeToMinutes(end);
  return (eMin - sMin) / 60;
};

/** Format a time string to "HH:MM". */
export const fmtTime = (t: string | null): string | null => {
  if (!t) return null;
  return t.slice(0, 5);
};

/** Check if an event is an anomaly (>15min difference between planned and actual). */
export const isAnomaly = (ev: {
  statut: string;
  debut: string;
  fin: string;
  debut_reel: string | null;
  fin_reelle: string | null;
}): boolean => {
  if (ev.statut !== "Terminée" || !ev.debut_reel || !ev.fin_reelle) return false;
  const prevuDuration = timeToMinutes(ev.fin) - timeToMinutes(ev.debut);
  const reelDuration = timeToMinutes(ev.fin_reelle) - timeToMinutes(ev.debut_reel);
  return Math.abs(prevuDuration - reelDuration) > 15;
};

/** Calculate duration display string "Xh00". */
export const calcDuree = (debut: string, fin: string): string => {
  const [dh, dm] = debut.split(":").map(Number);
  const [fh, fm] = fin.split(":").map(Number);
  const mins = (fh * 60 + fm) - (dh * 60 + dm);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${m.toString().padStart(2, "0")}`;
};

/** Calculate time gap string like "+5 min" or "-3 min". */
export const calcEcart = (planifie: string, reel: string): string => {
  const [ph, pm] = planifie.split(":").map(Number);
  const [rh, rm] = reel.split(":").map(Number);
  const diff = (rh * 60 + rm) - (ph * 60 + pm);
  if (diff === 0) return "0 min";
  return `${diff > 0 ? "+" : ""}${diff} min`;
};
