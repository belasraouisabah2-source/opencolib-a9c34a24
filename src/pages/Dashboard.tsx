import { useMemo } from "react";
import {
  Users,
  Heart,
  CalendarCheck,
  Clock,
  TrendingUp,
  AlertTriangle,
  Euro,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useBeneficiaires, useEmployes, usePlanningEvents, useFactures, useServices } from "@/hooks/useSupabaseData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { format, startOfWeek, addDays, subMonths, parse, differenceInMinutes } from "date-fns";
import { fr } from "date-fns/locale";

const colorMap: Record<string, string> = {
  "stat-blue": "bg-info/10 text-info",
  "stat-green": "bg-success/10 text-success",
  "stat-orange": "bg-warning/10 text-warning",
  "stat-red": "bg-destructive/10 text-destructive",
  "stat-purple": "bg-accent/10 text-accent",
};

const PIE_COLORS = [
  "hsl(199, 89%, 38%)",
  "hsl(172, 66%, 40%)",
  "hsl(260, 60%, 55%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 55%)",
];

const timeToMinutes = (t: string): number => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

const Dashboard = () => {
  const { data: beneficiaires } = useBeneficiaires();
  const { data: employes } = useEmployes();
  const { data: planningEvents } = usePlanningEvents();
  const { data: factures } = useFactures();
  const { data: services } = useServices();

  const today = format(new Date(), "yyyy-MM-dd");
  const todayLabel = format(new Date(), "MMMM yyyy", { locale: fr });

  // ── KPIs ──
  const beneficiairesActifs = (beneficiaires ?? []).filter(b => b.etat === "Actif").length;
  const employesActifs = (employes ?? []).filter(e => e.etat === "Actif").length;

  const todayEvents = useMemo(
    () => (planningEvents ?? []).filter(e => e.date === today),
    [planningEvents, today]
  );
  const interventionsJour = todayEvents.length;

  // Taux d'occupation : interventions terminées ou en cours / total du jour
  const tauxOccupation = useMemo(() => {
    if (todayEvents.length === 0) return 0;
    const actives = todayEvents.filter(e => e.statut === "Terminée" || e.statut === "En cours").length;
    return Math.round((actives / todayEvents.length) * 100);
  }, [todayEvents]);

  // Anomalies : interventions terminées dont les heures réelles diffèrent de >15min des prévues
  const anomalies = useMemo(() => {
    return (planningEvents ?? []).filter(ev => {
      if (ev.statut !== "Terminée" || !ev.debut_reel || !ev.fin_reelle) return false;
      const prevuDuration = timeToMinutes(ev.fin) - timeToMinutes(ev.debut);
      const reelDuration = timeToMinutes(ev.fin_reelle) - timeToMinutes(ev.debut_reel);
      return Math.abs(prevuDuration - reelDuration) > 15;
    }).length;
  }, [planningEvents]);

  // CA du mois : somme montant_ttc des factures du mois en cours
  const caMois = useMemo(() => {
    const currentMonth = format(new Date(), "yyyy-MM");
    const total = (factures ?? [])
      .filter(f => f.periode?.startsWith(currentMonth) || f.periode === format(new Date(), "MM/yyyy"))
      .reduce((sum, f) => sum + (f.montant_ttc ?? 0), 0);
    return total;
  }, [factures]);

  const formatCA = (v: number) => {
    if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k€`;
    return `${v.toFixed(0)}€`;
  };

  const stats = [
    { label: "Bénéficiaires actifs", value: beneficiairesActifs, icon: Heart, color: "stat-blue" },
    { label: "Employés actifs", value: employesActifs, icon: Users, color: "stat-green" },
    { label: "Interventions du jour", value: interventionsJour, icon: CalendarCheck, color: "stat-orange" },
    { label: "Taux d'occupation", value: `${tauxOccupation}%`, icon: TrendingUp, color: "stat-purple" },
    { label: "Anomalies détectées", value: anomalies, icon: AlertTriangle, color: "stat-red" },
    { label: "CA du mois", value: formatCA(caMois), icon: Euro, color: "stat-green" },
  ];

  // ── Weekly hours chart (current week from real data) ──
  const weeklyHours = useMemo(() => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
    return days.map(day => {
      const dk = format(day, "yyyy-MM-dd");
      const dayEvs = (planningEvents ?? []).filter(e => e.date === dk);
      const planifiees = dayEvs.reduce((sum, ev) => sum + (timeToMinutes(ev.fin) - timeToMinutes(ev.debut)) / 60, 0);
      const realisees = dayEvs
        .filter(ev => ev.debut_reel && ev.fin_reelle)
        .reduce((sum, ev) => sum + (timeToMinutes(ev.fin_reelle!) - timeToMinutes(ev.debut_reel!)) / 60, 0);
      return {
        jour: format(day, "EEE", { locale: fr }).replace(".", ""),
        planifiees: Math.round(planifiees * 10) / 10,
        realisees: Math.round(realisees * 10) / 10,
      };
    });
  }, [planningEvents]);

  // ── Service type distribution (from beneficiaires by service) ──
  const serviceTypes = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of beneficiaires ?? []) {
      const svc = b.service || "Non défini";
      counts[svc] = (counts[svc] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({
        name,
        value,
        color: PIE_COLORS[i % PIE_COLORS.length],
      }));
  }, [beneficiaires]);

  // ── Monthly evolution (last 6 months from real data) ──
  const monthlyEvolution = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i));
    return months.map(m => {
      const prefix = format(m, "yyyy-MM");
      const monthBenefs = new Set(
        (planningEvents ?? []).filter(e => e.date.startsWith(prefix)).map(e => e.beneficiaire)
      );
      const heures = (planningEvents ?? [])
        .filter(e => e.date.startsWith(prefix))
        .reduce((sum, ev) => sum + (timeToMinutes(ev.fin) - timeToMinutes(ev.debut)) / 60, 0);
      return {
        mois: format(m, "MMM", { locale: fr }),
        beneficiaires: monthBenefs.size,
        heures: Math.round(heures),
      };
    });
  }, [planningEvents]);

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vue d'ensemble de l'activité — {todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[stat.color]}`}>
                <stat.icon className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 data-table-wrapper p-5">
          <h3 className="font-semibold text-foreground mb-4">Heures planifiées vs réalisées (semaine en cours)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyHours} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="jour" tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 50%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 50%)" unit="h" />
              <Tooltip formatter={(value: number) => [`${value}h`, ""]} />
              <Bar dataKey="planifiees" fill="hsl(199, 89%, 38%)" radius={[4, 4, 0, 0]} name="Planifiées" />
              <Bar dataKey="realisees" fill="hsl(172, 66%, 40%)" radius={[4, 4, 0, 0]} name="Réalisées" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="data-table-wrapper p-5">
          <h3 className="font-semibold text-foreground mb-4">Répartition par service</h3>
          {serviceTypes.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={serviceTypes} innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={4}>
                    {serviceTypes.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {serviceTypes.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                    {s.name} ({s.value})
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">Aucune donnée</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="data-table-wrapper p-5">
          <h3 className="font-semibold text-foreground mb-4">Évolution mensuelle (6 derniers mois)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 50%)" />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="hsl(199, 89%, 38%)" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="hsl(172, 66%, 40%)" unit="h" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="beneficiaires" stroke="hsl(199, 89%, 38%)" strokeWidth={2} dot={{ r: 3 }} name="Bénéficiaires" />
              <Line yAxisId="right" type="monotone" dataKey="heures" stroke="hsl(172, 66%, 40%)" strokeWidth={2} dot={{ r: 3 }} name="Heures" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="data-table-wrapper p-5">
          <h3 className="font-semibold text-foreground mb-4">Interventions du jour</h3>
          {todayEvents.length > 0 ? (
            <div className="space-y-3 max-h-[220px] overflow-y-auto">
              {todayEvents.map((ev) => (
                <div key={ev.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    ev.statut === "Terminée" ? "bg-success" : ev.statut === "En cours" ? "bg-warning" : "bg-info"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ev.beneficiaire}</p>
                    <p className="text-xs text-muted-foreground">{ev.employe} · {ev.debut?.slice(0,5)} - {ev.fin?.slice(0,5)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    ev.statut === "Terminée" ? "badge-active" : ev.statut === "En cours" ? "badge-pending" : "bg-info/10 text-info"
                  }`}>
                    {ev.statut}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">Aucune intervention aujourd'hui</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
