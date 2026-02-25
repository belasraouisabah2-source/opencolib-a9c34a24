import { useState, useMemo, useCallback, DragEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Play,
  X,
  CalendarDays,
  GripVertical,
  User,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlanningEvents, useUpdatePlanningEvent, useEmployes, useServices, useSecteurs } from "@/hooks/useSupabaseData";
import { addDays, startOfWeek, format, getISOWeek, parseISO, differenceInMinutes, parse } from "date-fns";
import { fr } from "date-fns/locale";

// ── helpers ──

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

const fmtTime = (t: string | null) => {
  if (!t) return null;
  // handle "HH:MM:SS" or "HH:MM"
  return t.slice(0, 5);
};

const timeDiffHours = (start: string, end: string): number => {
  const s = parse(start, "HH:mm:ss", new Date());
  const e = parse(end, "HH:mm:ss", new Date());
  return differenceInMinutes(e, s) / 60;
};

// ── component ──

const Planning = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [nbWeeks, setNbWeeks] = useState(1);
  const [selectedEmploye, setSelectedEmploye] = useState<string>("");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [secteurFilter, setSecteurFilter] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"employe" | "beneficiaire">("employe");
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState<string>("");

  const { data: planningEvents } = usePlanningEvents();
  const { data: employes } = useEmployes();
  const { data: services } = useServices();
  const { data: secteurs } = useSecteurs();
  const updateEvent = useUpdatePlanningEvent();

  // ── drag & drop handlers ──
  const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>, ev: any) => {
    if (ev.statut !== "Planifiée") {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", ev.id);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>, dateKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDate(dateKey);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverDate(null);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>, dateKey: string) => {
    e.preventDefault();
    setDragOverDate(null);
    const eventId = e.dataTransfer.getData("text/plain");
    if (!eventId) return;
    const ev = (planningEvents ?? []).find(x => x.id === eventId);
    if (!ev || ev.statut !== "Planifiée" || ev.date === dateKey) return;
    updateEvent.mutate({ id: eventId, date: dateKey } as any);
    if (selectedEvent?.id === eventId) {
      setSelectedEvent({ ...selectedEvent, date: dateKey });
    }
  }, [planningEvents, updateEvent, selectedEvent]);

  // ── filtered employees ──
  const filteredEmployes = useMemo(() => {
    let list = employes ?? [];
    if (serviceFilter !== "all") list = list.filter(e => e.service === serviceFilter);
    if (secteurFilter !== "all") {
      // no direct secteur on employe, skip filter if not applicable
    }
    return list;
  }, [employes, serviceFilter, secteurFilter]);

  // auto-select first employee
  const activeEmploye = useMemo(() => {
    if (selectedEmploye && filteredEmployes.some(e => `${e.nom} ${e.prenom}` === selectedEmploye)) {
      return selectedEmploye;
    }
    if (filteredEmployes.length > 0) {
      const first = filteredEmployes[0];
      return `${first.nom} ${first.prenom}`;
    }
    return "";
  }, [selectedEmploye, filteredEmployes]);

  // ── date range ──
  const today = new Date();
  const baseMonday = startOfWeek(today, { weekStartsOn: 1 });
  const startDate = addDays(baseMonday, weekOffset * 7);

  const weeks = useMemo(() => {
    const result: { weekNum: number; days: Date[] }[] = [];
    for (let w = 0; w < nbWeeks; w++) {
      const monday = addDays(startDate, w * 7);
      const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
      result.push({ weekNum: getISOWeek(monday), days });
    }
    return result;
  }, [startDate, nbWeeks]);

  const allDays = useMemo(() => weeks.flatMap(w => w.days), [weeks]);
  const dateKeys = useMemo(() => allDays.map(d => format(d, "yyyy-MM-dd")), [allDays]);

  // ── filtered events (depends on view mode) ──
  const uniqueBeneficiaires = useMemo(() => {
    const names = new Set((planningEvents ?? []).map(e => e.beneficiaire));
    return Array.from(names).sort();
  }, [planningEvents]);

  const activeBeneficiaire = useMemo(() => {
    if (selectedBeneficiaire && uniqueBeneficiaires.includes(selectedBeneficiaire)) return selectedBeneficiaire;
    return uniqueBeneficiaires[0] ?? "";
  }, [selectedBeneficiaire, uniqueBeneficiaires]);

  const filteredEvents = useMemo(() => {
    if (viewMode === "beneficiaire") {
      return (planningEvents ?? []).filter(e => e.beneficiaire === activeBeneficiaire);
    }
    return (planningEvents ?? []).filter(e => e.employe === activeEmploye);
  }, [planningEvents, activeEmploye, activeBeneficiaire, viewMode]);

  // ── cumul heures ──
  const cumulHeures = useMemo(() => {
    let total = 0;
    for (const ev of filteredEvents) {
      if (dateKeys.includes(ev.date)) {
        total += timeDiffHours(ev.debut, ev.fin);
      }
    }
    return total;
  }, [filteredEvents, dateKeys]);

  const goToday = () => setWeekOffset(0);

  const handleEventClick = useCallback((ev: any) => {
    setSelectedEvent(ev);
    setPanelOpen(true);
  }, []);

  const switchToBeneficiaireView = useCallback((beneficiaire: string) => {
    setSelectedBeneficiaire(beneficiaire);
    setViewMode("beneficiaire");
    setSelectedEvent(null);
  }, []);

  const switchToEmployeView = useCallback(() => {
    setViewMode("employe");
    setSelectedEvent(null);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="module-header">
        <div className="flex items-center gap-3">
          {viewMode === "beneficiaire" && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={switchToEmployeView}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="page-title">
              {viewMode === "employe" ? "Planning Employés" : "Planning Bénéficiaire"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {nbWeeks > 1
                ? `Semaines ${weeks.map(w => w.weekNum).join(", ")} — ${format(startDate, "MMMM yyyy", { locale: fr })}`
                : `Semaine ${weeks[0]?.weekNum} — ${format(startDate, "MMMM yyyy", { locale: fr })}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(o => o - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={goToday}>Auj.</Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(o => o + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={String(nbWeeks)} onValueChange={v => setNbWeeks(Number(v))}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 semaine</SelectItem>
            <SelectItem value="2">2 semaines</SelectItem>
            <SelectItem value="3">3 semaines</SelectItem>
            <SelectItem value="4">4 semaines</SelectItem>
          </SelectContent>
        </Select>

        {viewMode === "employe" ? (
          <>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les services</SelectItem>
                {(services ?? []).map(s => (
                  <SelectItem key={s.id} value={s.nom}>{s.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={secteurFilter} onValueChange={setSecteurFilter}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Secteur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les secteurs</SelectItem>
                {(secteurs ?? []).map(s => (
                  <SelectItem key={s.id} value={s.nom}>{s.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={activeEmploye} onValueChange={setSelectedEmploye}>
              <SelectTrigger className="w-[220px] h-9">
                <SelectValue placeholder="Sélectionner un employé" />
              </SelectTrigger>
              <SelectContent>
                {filteredEmployes.map(e => {
                  const name = `${e.nom} ${e.prenom}`;
                  return <SelectItem key={e.id} value={name}>{e.prenom} {e.nom}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </>
        ) : (
          <Select value={activeBeneficiaire} onValueChange={setSelectedBeneficiaire}>
            <SelectTrigger className="w-[250px] h-9">
              <SelectValue placeholder="Sélectionner un bénéficiaire" />
            </SelectTrigger>
            <SelectContent>
              {uniqueBeneficiaires.map(b => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="ml-auto flex items-center gap-2 text-sm">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Nb hrs période :</span>
          <span className="font-bold text-primary">{cumulHeures.toFixed(1)}h</span>
        </div>
      </div>

      {/* Main area: calendar + optional side panel */}
      <div className="flex gap-4">
        {/* Calendar */}
        <div className={`data-table-wrapper flex-1 min-w-0 transition-all ${selectedEvent && panelOpen ? "" : ""}`}>
          {weeks.map((week) => (
            <div key={week.weekNum}>
              {/* Week header */}
              {nbWeeks > 1 && (
                <div className="px-3 py-1.5 bg-muted/50 border-b text-xs font-semibold text-muted-foreground">
                  Semaine {week.weekNum}
                </div>
              )}
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b">
                {week.days.map((day, i) => {
                  const isWeekend = i >= 5;
                  return (
                    <div
                      key={day.toISOString()}
                      className={`p-2 text-center border-r last:border-r-0 ${isWeekend ? "bg-muted/30" : ""}`}
                    >
                      <p className="text-xs font-medium text-muted-foreground">
                        {format(day, "EEE", { locale: fr })}.
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {format(day, "dd/MM")}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-7 min-h-[120px]">
                {week.days.map((day, i) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const dayEvents = filteredEvents.filter(e => e.date === dateKey);
                  const isWeekend = i >= 5;
                  const isDragOver = dragOverDate === dateKey;
                  return (
                    <div
                      key={dateKey}
                      onDragOver={(e) => handleDragOver(e, dateKey)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, dateKey)}
                      className={`p-1.5 border-r last:border-r-0 border-b space-y-1 transition-colors ${isWeekend ? "bg-muted/20" : ""} ${isDragOver ? "bg-primary/10 ring-1 ring-inset ring-primary/30" : ""}`}
                    >
                      {dayEvents.map(ev => {
                        const isDraggable = ev.statut === "Planifiée";
                        return (
                          <div
                            key={ev.id}
                            draggable={isDraggable}
                            onDragStart={(e) => handleDragStart(e, ev)}
                            onClick={() => handleEventClick(ev)}
                            className={`p-1.5 rounded-lg border text-xs space-y-0.5 transition-shadow ${statusBg(ev.statut)} ${selectedEvent?.id === ev.id ? "ring-2 ring-primary" : ""} ${isDraggable ? "cursor-grab active:cursor-grabbing hover:shadow-md" : "cursor-pointer hover:shadow-sm"}`}
                          >
                            <div className="flex items-center gap-1">
                              {isDraggable && <GripVertical className="w-3 h-3 text-muted-foreground/50 shrink-0" />}
                              {statusIcon(ev.statut)}
                              <span className="font-semibold text-foreground uppercase truncate">
                                {viewMode === "beneficiaire"
                                  ? ev.employe.split(" ").pop()
                                  : ev.beneficiaire.split(" ")[0]}
                              </span>
                            </div>
                            <p className="text-muted-foreground">
                              {fmtTime(ev.debut)} - {fmtTime(ev.fin)}
                            </p>
                            {ev.statut === "En cours" && ev.debut_reel && (
                              <p className="text-[10px] text-muted-foreground/70">
                                Début réel: {fmtTime(ev.debut_reel)}
                              </p>
                            )}
                            {ev.statut === "Terminée" && ev.debut_reel && (
                              <p className="text-[10px] text-muted-foreground/70">
                                Réel: {fmtTime(ev.debut_reel)}{ev.fin_reelle ? ` - ${fmtTime(ev.fin_reelle)}` : ""}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Side panel */}
        {selectedEvent && panelOpen && (
          <div className="w-72 shrink-0 data-table-wrapper p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground">Détail intervention</h3>
              <button onClick={() => setPanelOpen(false)} className="p-1 rounded hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Bénéficiaire</p>
                <p className="font-medium text-foreground">{selectedEvent.beneficiaire}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Employé</p>
                <p className="font-medium text-foreground">{selectedEvent.employe}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Date</p>
                <p className="font-medium text-foreground">
                  {format(parseISO(selectedEvent.date), "EEEE dd/MM/yyyy", { locale: fr })}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground text-xs">Début prévu</p>
                  <p className="font-medium text-foreground">{fmtTime(selectedEvent.debut)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Fin prévue</p>
                  <p className="font-medium text-foreground">{fmtTime(selectedEvent.fin)}</p>
                </div>
              </div>
              {(selectedEvent.debut_reel || selectedEvent.fin_reelle) && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-muted-foreground text-xs">Début réel</p>
                    <p className="font-medium text-foreground">{fmtTime(selectedEvent.debut_reel) ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Fin réelle</p>
                    <p className="font-medium text-foreground">{fmtTime(selectedEvent.fin_reelle) ?? "-"}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-xs">Statut</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {statusIcon(selectedEvent.statut)}
                  <span className="font-medium text-foreground">{selectedEvent.statut}</span>
                </div>
              </div>
            </div>

            {viewMode === "employe" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => switchToBeneficiaireView(selectedEvent.beneficiaire)}
              >
                <User className="w-4 h-4 mr-2" />
                Planning Bénéficiaire
              </Button>
            )}

            {viewMode === "beneficiaire" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSelectedEmploye(selectedEvent.employe);
                  switchToEmployeView();
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Planning Employé
              </Button>
            )}

            {selectedEvent.statut === "Planifiée" && (
              <p className="text-[10px] text-muted-foreground italic">
                Drag & drop possible (intervention non débutée)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Planning;
