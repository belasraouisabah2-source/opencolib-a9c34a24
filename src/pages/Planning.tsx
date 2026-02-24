import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlanningEvents, useEmployes } from "@/hooks/useSupabaseData";

const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const weekDates = ["24/02", "25/02", "26/02", "27/02", "28/02", "01/03", "02/03"];
const dateKeys = ["2026-02-24", "2026-02-25", "2026-02-26", "2026-02-27", "2026-02-28", "2026-03-01", "2026-03-02"];

const statusIcon = (statut: string) => {
  if (statut === "Terminée") return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
  if (statut === "En cours") return <Play className="w-3.5 h-3.5 text-warning" />;
  return <Clock className="w-3.5 h-3.5 text-info" />;
};

const statusBg = (statut: string) => {
  if (statut === "Terminée") return "bg-success/10 border-success/20";
  if (statut === "En cours") return "bg-warning/10 border-warning/20";
  return "bg-info/10 border-info/20";
};

const Planning = () => {
  const [selectedEmploye, setSelectedEmploye] = useState("LEFEBVRE Sophie");
  const { data: planningEvents } = usePlanningEvents();
  const { data: employes } = useEmployes();

  const filteredEvents = (planningEvents ?? []).filter(e => e.employe === selectedEmploye);

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="page-title">Planning Employés</h1>
          <p className="text-sm text-muted-foreground mt-1">Semaine 9 — Février 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" className="h-8">Auj.</Button>
          <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(employes ?? []).map(e => {
          const name = `${e.nom} ${e.prenom}`;
          return (
            <button
              key={e.id}
              onClick={() => setSelectedEmploye(name)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedEmploye === name
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {e.prenom} {e.nom}
            </button>
          );
        })}
      </div>

      <div className="data-table-wrapper">
        <div className="grid grid-cols-7 border-b">
          {daysOfWeek.map((day, i) => (
            <div key={day} className={`p-3 text-center border-r last:border-r-0 ${i >= 5 ? "bg-muted/30" : ""}`}>
              <p className="text-xs font-medium text-muted-foreground">{day}.</p>
              <p className="text-sm font-semibold text-foreground">{weekDates[i]}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 min-h-[400px]">
          {dateKeys.map((dateKey, i) => {
            const dayEvents = filteredEvents.filter(e => e.date === dateKey);
            return (
              <div key={dateKey} className={`p-2 border-r last:border-r-0 space-y-2 ${i >= 5 ? "bg-muted/20" : ""}`}>
                {dayEvents.map(ev => (
                  <div key={ev.id} className={`p-2 rounded-lg border text-xs space-y-1 cursor-pointer hover:shadow-sm transition-shadow ${statusBg(ev.statut)}`}>
                    <div className="flex items-center gap-1">
                      {statusIcon(ev.statut)}
                      <span className="font-semibold text-foreground uppercase truncate">{ev.beneficiaire.split(" ")[0]}</span>
                    </div>
                    <p className="text-muted-foreground">{ev.debut} - {ev.fin}</p>
                    {ev.debut_reel && (
                      <p className="text-[10px] text-muted-foreground/70">
                        Réel: {ev.debut_reel}{ev.fin_reelle ? ` - ${ev.fin_reelle}` : ""}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Planning;
