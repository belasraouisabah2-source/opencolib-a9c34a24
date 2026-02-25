import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Heart, Users, CalendarCheck, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useBeneficiaires, useEmployes, usePlanningEvents } from "@/hooks/useSupabaseData";

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

const Topbar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: beneficiaires } = useBeneficiaires();
  const { data: employes } = useEmployes();
  const { data: planningEvents } = usePlanningEvents();

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const items: SearchResult[] = [];

    for (const b of beneficiaires ?? []) {
      const full = `${b.prenom} ${b.nom}`.toLowerCase();
      if (full.includes(q) || b.code.toLowerCase().includes(q)) {
        items.push({
          type: "beneficiaire",
          label: `${b.prenom} ${b.nom}`,
          sub: `${b.code} · ${b.etat}`,
          link: "/beneficiaires",
        });
      }
      if (items.length >= 20) break;
    }

    for (const e of employes ?? []) {
      const full = `${e.prenom} ${e.nom}`.toLowerCase();
      if (full.includes(q) || e.code.toLowerCase().includes(q)) {
        items.push({
          type: "employe",
          label: `${e.prenom} ${e.nom}`,
          sub: `${e.code} · ${e.poste ?? e.service ?? ""}`,
          link: "/employes",
        });
      }
      if (items.length >= 30) break;
    }

    for (const ev of planningEvents ?? []) {
      const searchable = `${ev.beneficiaire} ${ev.employe} ${ev.code}`.toLowerCase();
      if (searchable.includes(q)) {
        items.push({
          type: "intervention",
          label: `${ev.code} — ${ev.beneficiaire}`,
          sub: `${ev.date} · ${ev.employe} · ${ev.statut}`,
          link: "/planning",
        });
      }
      if (items.length >= 40) break;
    }

    return items.slice(0, 12);
  }, [query, beneficiaires, employes, planningEvents]);

  const handleSelect = useCallback((r: SearchResult) => {
    setQuery("");
    setOpen(false);
    navigate(r.link);
  }, [navigate]);

  return (
    <header className="erp-topbar">
      <div className="flex items-center gap-4 flex-1">
        <div ref={containerRef} className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <Input
            placeholder="Rechercher un bénéficiaire, employé, intervention..."
            className="pl-9 pr-8 bg-secondary border-0 h-9 text-sm"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => { if (query.length >= 2) setOpen(true); }}
          />
          {query && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted"
              onClick={() => { setQuery(""); setOpen(false); }}
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}

          {/* Results dropdown */}
          {open && query.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {results.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  Aucun résultat pour « {query} »
                </div>
              ) : (
                <div className="py-1">
                  {results.map((r, i) => {
                    const Icon = iconMap[r.type];
                    return (
                      <button
                        key={`${r.type}-${i}`}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left"
                        onClick={() => handleSelect(r)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{r.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.sub}</p>
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground/60 uppercase shrink-0">
                          {typeLabel[r.type]}
                        </span>
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
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
        </button>
        <div className="w-px h-8 bg-border" />
        <span className="text-sm text-muted-foreground">Service Paris Nord</span>
      </div>
    </header>
  );
};

export default Topbar;
