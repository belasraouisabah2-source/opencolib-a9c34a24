import {
  Users,
  Heart,
  CalendarCheck,
  Clock,
  TrendingUp,
  AlertTriangle,
  Euro,
  FileWarning,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { dashboardStats, planningEvents } from "@/data/mockData";
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

const stats = [
  { label: "Bénéficiaires actifs", value: dashboardStats.beneficiairesActifs, icon: Heart, color: "stat-blue", trend: "+3", up: true },
  { label: "Employés actifs", value: dashboardStats.employesActifs, icon: Users, color: "stat-green", trend: "+1", up: true },
  { label: "Interventions du jour", value: dashboardStats.interventionsJour, icon: CalendarCheck, color: "stat-orange", trend: "-2", up: false },
  { label: "Taux d'occupation", value: `${dashboardStats.tauxOccupation}%`, icon: TrendingUp, color: "stat-purple", trend: "+5%", up: true },
  { label: "Anomalies détectées", value: dashboardStats.anomalies, icon: AlertTriangle, color: "stat-red", trend: "-1", up: true },
  { label: "CA du mois", value: `${(dashboardStats.chiffreAffairesMois / 1000).toFixed(0)}k€`, icon: Euro, color: "stat-green", trend: "+8%", up: true },
];

const weeklyHours = [
  { jour: "Lun", planifiees: 52, realisees: 49 },
  { jour: "Mar", planifiees: 58, realisees: 56 },
  { jour: "Mer", planifiees: 45, realisees: 44 },
  { jour: "Jeu", planifiees: 60, realisees: 57 },
  { jour: "Ven", planifiees: 55, realisees: 53 },
  { jour: "Sam", planifiees: 25, realisees: 24 },
  { jour: "Dim", planifiees: 17, realisees: 15 },
];

const serviceTypes = [
  { name: "SAD", value: 45, color: "hsl(199, 89%, 38%)" },
  { name: "SSIAD", value: 30, color: "hsl(172, 66%, 40%)" },
  { name: "SPASAD", value: 25, color: "hsl(260, 60%, 55%)" },
];

const monthlyEvolution = [
  { mois: "Sep", beneficiaires: 120, heures: 2800 },
  { mois: "Oct", beneficiaires: 128, heures: 3100 },
  { mois: "Nov", beneficiaires: 132, heures: 3200 },
  { mois: "Déc", beneficiaires: 135, heures: 2900 },
  { mois: "Jan", beneficiaires: 138, heures: 3300 },
  { mois: "Fév", beneficiaires: 142, heures: 3400 },
];

const colorMap: Record<string, string> = {
  "stat-blue": "bg-info/10 text-info",
  "stat-green": "bg-success/10 text-success",
  "stat-orange": "bg-warning/10 text-warning",
  "stat-red": "bg-destructive/10 text-destructive",
  "stat-purple": "bg-accent/10 text-accent",
};

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de l'activité — Février 2026</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[stat.color]}`}>
                <stat.icon className="w-4.5 h-4.5" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? "text-success" : "text-destructive"}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly hours */}
        <div className="lg:col-span-2 data-table-wrapper p-5">
          <h3 className="font-semibold text-foreground mb-4">Heures planifiées vs réalisées (semaine)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyHours} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="jour" tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 50%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 50%)" />
              <Tooltip />
              <Bar dataKey="planifiees" fill="hsl(199, 89%, 38%)" radius={[4, 4, 0, 0]} name="Planifiées" />
              <Bar dataKey="realisees" fill="hsl(172, 66%, 40%)" radius={[4, 4, 0, 0]} name="Réalisées" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Service types */}
        <div className="data-table-wrapper p-5">
          <h3 className="font-semibold text-foreground mb-4">Répartition par type</h3>
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
          <div className="flex justify-center gap-4 mt-2">
            {serviceTypes.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evolution + Recent interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="data-table-wrapper p-5">
          <h3 className="font-semibold text-foreground mb-4">Évolution mensuelle</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 50%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 50%)" />
              <Tooltip />
              <Line type="monotone" dataKey="beneficiaires" stroke="hsl(199, 89%, 38%)" strokeWidth={2} dot={{ r: 3 }} name="Bénéficiaires" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="data-table-wrapper p-5">
          <h3 className="font-semibold text-foreground mb-4">Interventions du jour</h3>
          <div className="space-y-3">
            {planningEvents.filter(e => e.date === "2026-02-24").map((ev) => (
              <div key={ev.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  ev.statut === "Terminée" ? "bg-success" : ev.statut === "En cours" ? "bg-warning" : "bg-info"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{ev.beneficiaire}</p>
                  <p className="text-xs text-muted-foreground">{ev.employe} · {ev.debut} - {ev.fin}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  ev.statut === "Terminée" ? "badge-active" : ev.statut === "En cours" ? "badge-pending" : "bg-info/10 text-info"
                }`}>
                  {ev.statut}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
