import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Heart, Users, CalendarCheck, X, AlertTriangle, Clock, CalendarOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useBeneficiaires, useEmployes, usePlanningEvents, useBeneficiaireAbsences } from "@/hooks/useSupabaseData";
import { format } from "date-fns";

// ── Search types ──

interface SearchResult {
  type: "beneficiaire" | "employe" | "intervention";
  label: string;
  sub: string;
  link: string;
}

const iconMap = {
  beneficiaire: Heart,
  employe: Users,
  intervention: CalendarCheck,
};

const typeLabel = {
  beneficiaire: "Bénéficiaire",
  employe: "Employé",
  intervention: "Intervention",
};

// ── Notification types ──

interface Notification {
  id: string;
  type: "anomalie" | "absence" | "non_pointee";
  title: string;
  description: string;
  link: string;
}

const notifIcon = {
  anomalie: AlertTriangle,
  absence: CalendarOff,
  non_pointee: Clock,
};

const notifColor = {
  anomalie: "text-destructive bg-destructive/10",
  absence: "text-warning bg-warning/10",
  non_pointee: "text-info bg-info/10",
};

const timeToMinutes = (t: string): number => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

const Topbar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: beneficiaires } = useBeneficiaires();
  const { data: employes } = useEmployes();
  const { data: planningEvents } = usePlanningEvents();
  const { data: absences } = useBeneficiaireAbsences();

  // Close dropdowns on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Search results ──
  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const items: SearchResult[] = [];

    for (const b of beneficiaires ?? []) {
      const full = `${b.prenom} ${b.nom}`.toLowerCase();
      if (full.includes(q) || b.code.toLowerCase().includes(q)) {
        items.push({ type: "beneficiaire", label: `${b.prenom} ${b.nom}`, sub: `${b.code} · ${b.etat}`, link: "/beneficiaires" });
      }
      if (items.length >= 20) break;
    }
    for (const e of employes ?? []) {
      const full = `${e.prenom} ${e.nom}`.toLowerCase();
      if (full.includes(q) || e.code.toLowerCase().includes(q)) {
        items.push({ type: "employe", label: `${e.prenom} ${e.nom}`, sub: `${e.code} · ${e.poste ?? e.service ?? ""}`, link: "/employes" });
      }
      if (items.length >= 30) break;
    }
    for (const ev of planningEvents ?? []) {
      const searchable = `${ev.beneficiaire} ${ev.employe} ${ev.code}`.toLowerCase();
      if (searchable.includes(q)) {
        items.push({ type: "intervention", label: `${ev.code} — ${ev.beneficiaire}`, sub: `${ev.date} · ${ev.employe} · ${ev.statut}`, link: "/planning" });
      }
      if (items.length >= 40) break;
    }
    return items.slice(0, 12);
  }, [query, beneficiaires, employes, planningEvents]);

  const handleSelect = useCallback((r: SearchResult) => {
    setQuery(""); setSearchOpen(false);
    navigate(r.link);
  }, [navigate]);

  // ── Notifications ──
  const notifications = useMemo<Notification[]>(() => {
    const notifs: Notification[] = [];
    const today = format(new Date(), "yyyy-MM-dd");

    // 1. Anomalies : interventions terminées avec écart >15min
    for (const ev of planningEvents ?? []) {
      if (ev.statut !== "Terminée" || !ev.debut_reel || !ev.fin_reelle) continue;
      const prevuDuration = timeToMinutes(ev.fin) - timeToMinutes(ev.debut);
      const reelDuration = timeToMinutes(ev.fin_reelle) - timeToMinutes(ev.debut_reel);
      const diff = Math.abs(prevuDuration - reelDuration);
      if (diff > 15) {
        notifs.push({
          id: `anomalie-${ev.id}`,
          type: "anomalie",
          title: `Écart de ${diff}min — ${ev.code}`,
          description: `${ev.beneficiaire} · ${ev.employe} · ${ev.date}`,
          link: "/controle-heures",
        });
      }
    }

    // 2. Absences en cours
    for (const abs of absences ?? []) {
      if (abs.date_debut <= today && abs.date_fin >= today) {
        const benef = (beneficiaires ?? []).find(b => b.id === abs.beneficiaire_id);
        const name = benef ? `${benef.prenom} ${benef.nom}` : "Bénéficiaire";
        notifs.push({
          id: `absence-${abs.id}`,
          type: "absence",
          title: `${name} — absent(e)`,
          description: `${abs.motif} · du ${abs.date_debut} au ${abs.date_fin}`,
          link: "/beneficiaires",
        });
      }
    }

    // 3. Interventions non pointées (passées, statut Planifiée)
    for (const ev of planningEvents ?? []) {
      if (ev.date < today && ev.statut === "Planifiée") {
        notifs.push({
          id: `nonpointee-${ev.id}`,
          type: "non_pointee",
          title: `Non pointée — ${ev.code}`,
          description: `${ev.beneficiaire} · ${ev.employe} · ${ev.date}`,
          link: "/controle-heures",
        });
      }
    }

    return notifs.slice(0, 30);
  }, [planningEvents, absences, beneficiaires]);

  const notifCount = notifications.length;

  return (
    <header className="erp-topbar">
      <div className="flex items-center gap-4 flex-1">
        {/* Search */}
        <div ref={searchRef} className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <Input
            placeholder="Rechercher un bénéficiaire, employé, intervention..."
            className="pl-9 pr-8 bg-secondary border-0 h-9 text-sm"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => { if (query.length >= 2) setSearchOpen(true); }}
          />
          {query && (
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted" onClick={() => { setQuery(""); setSearchOpen(false); }}>
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
          {searchOpen && query.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {results.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">Aucun résultat pour « {query} »</div>
              ) : (
                <div className="py-1">
                  {results.map((r, i) => {
                    const Icon = iconMap[r.type];
                    return (
                      <button key={`${r.type}-${i}`} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left" onClick={() => handleSelect(r)}>
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-muted-foreground" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{r.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.sub}</p>
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground/60 uppercase shrink-0">{typeLabel[r.type]}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setNotifOpen((o) => !o)}
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
                {notifCount > 99 ? "99+" : notifCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-popover border border-border rounded-lg shadow-lg z-50">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                <span className="text-xs text-muted-foreground">{notifCount} alerte{notifCount > 1 ? "s" : ""}</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-sm text-muted-foreground text-center">Aucune alerte</div>
                ) : (
                  notifications.map((n) => {
                    const Icon = notifIcon[n.type];
                    return (
                      <button
                        key={n.id}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b last:border-b-0"
                        onClick={() => { setNotifOpen(false); navigate(n.link); }}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${notifColor[n.type]}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{n.description}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-border" />
        <span className="text-sm text-muted-foreground">Service Paris Nord</span>
      </div>
    </header>
  );
};

export default Topbar;
