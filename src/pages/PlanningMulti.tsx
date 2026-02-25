import { useState, useMemo, useCallback, useRef, useEffect, DragEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  CheckCircle2,
  Play,
  Menu,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlanningEvents, useUpdatePlanningEvent, useEmployes, useServices, useSecteurs } from "@/hooks/useSupabaseData";
import { addDays, startOfWeek, format, getISOWeek, parse, differenceInMinutes } from "date-fns";
import { fr } from "date-fns/locale";

// ── helpers ──

const statusColor = (statut: string) => {
  if (statut === "Terminée") return "bg-success/80";
  if (statut === "En cours") return "bg-warning/80";
  return "bg-info/80";
};

const fmtTime = (t: string | null) => (t ? t.slice(0, 5) : null);

const timeToMinutes = (t: string): number => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

// ── Day Timeline View ──

const HOUR_WIDTH = 80;
const ROW_HEIGHT = 48;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const DayTimelineView = ({
  date,
  employees,
  events,
  search,
  onMoveEvent,
}: {
  date: Date;
  employees: any[];
  events: any[];
  search: string;
  onMoveEvent: (eventId: string, newEmploye: string, newDebut: string, newFin: string) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dateKey = format(date, "yyyy-MM-dd");

  const filteredEmployees = useMemo(() => {
    const term = search.toLowerCase();
    return employees
      .filter((e) => `${e.nom} ${e.prenom}`.toLowerCase().includes(term))
      .sort((a, b) => a.nom.localeCompare(b.nom) || a.prenom.localeCompare(b.prenom));
  }, [employees, search]);

  const dayEvents = useMemo(
    () => events.filter((e) => e.date === dateKey),
    [events, dateKey]
  );

  // Current time marker
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isToday = format(now, "yyyy-MM-dd") === dateKey;

  // Scroll to ~7h on mount
  useEffect(() => {
    containerRef.current?.scrollTo({ left: 7 * HOUR_WIDTH, behavior: "smooth" });
  }, [dateKey]);

  return (
    <div className="data-table-wrapper overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-2 border-b bg-muted/30 text-sm font-semibold text-foreground">
        {format(date, "EEEE dd MMMM yyyy", { locale: fr })}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Employee column */}
        <div className="w-48 shrink-0 border-r bg-card">
          {/* Corner cell */}
          <div className="h-10 border-b flex items-center px-3 text-xs font-semibold text-muted-foreground">
            Intervenant
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: `calc(100vh - 300px)` }}>
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center px-3 border-b text-sm font-medium text-foreground truncate"
                style={{ height: ROW_HEIGHT }}
              >
                {emp.nom.toUpperCase()} {emp.prenom}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div ref={containerRef} className="flex-1 overflow-auto">
          {/* Hour headers */}
          <div className="flex border-b sticky top-0 bg-card z-10" style={{ width: 24 * HOUR_WIDTH }}>
            {HOURS.map((h) => (
              <div
                key={h}
                className="text-center text-xs font-medium text-muted-foreground border-r shrink-0 flex items-center justify-center"
                style={{ width: HOUR_WIDTH, height: 40 }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="relative" data-timeline style={{ width: 24 * HOUR_WIDTH }}>
            {/* Grid lines */}
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute top-0 bottom-0 border-r border-border/30"
                style={{ left: h * HOUR_WIDTH }}
              />
            ))}

            {/* Current time line */}
            {isToday && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-destructive z-20"
                style={{ left: (nowMinutes / 60) * HOUR_WIDTH }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-destructive -translate-x-1 -translate-y-1" />
              </div>
            )}

            {/* Employee rows */}
            {filteredEmployees.map((emp, rowIdx) => {
              const empName = `${emp.nom} ${emp.prenom}`;
              const empEvents = dayEvents.filter((e) => e.employe === empName);
              return (
                <div
                  key={emp.id}
                  className={`relative border-b ${rowIdx % 2 === 0 ? "" : "bg-muted/20"}`}
                  style={{ height: ROW_HEIGHT }}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const data = e.dataTransfer.getData("application/json");
                    if (!data) return;
                    const { eventId, durationMin } = JSON.parse(data);
                    // Calculate drop time from X position relative to timeline
                    const timelineEl = e.currentTarget.closest("[data-timeline]");
                    if (!timelineEl) return;
                    const rect = timelineEl.getBoundingClientRect();
                    const scrollLeft = (timelineEl as HTMLElement).parentElement?.scrollLeft ?? 0;
                    const x = e.clientX - rect.left + scrollLeft;
                    let startMin = Math.round((x / HOUR_WIDTH) * 60 / 15) * 15; // snap to 15min
                    startMin = Math.max(0, Math.min(startMin, 24 * 60 - durationMin));
                    const endMin = startMin + durationMin;
                    const newDebut = `${String(Math.floor(startMin / 60)).padStart(2, "0")}:${String(startMin % 60).padStart(2, "0")}:00`;
                    const newFin = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}:00`;
                    onMoveEvent(eventId, empName, newDebut, newFin);
                  }}
                >
                  {empEvents.map((ev) => {
                    const startMin = timeToMinutes(ev.debut);
                    const endMin = timeToMinutes(ev.fin);
                    const left = (startMin / 60) * HOUR_WIDTH;
                    const width = Math.max(((endMin - startMin) / 60) * HOUR_WIDTH, 30);
                    const isDraggable = ev.statut === "Planifiée";
                    return (
                      <div
                        key={ev.id}
                        draggable={isDraggable}
                        onDragStart={(e) => {
                          if (!isDraggable) { e.preventDefault(); return; }
                          e.dataTransfer.setData("application/json", JSON.stringify({
                            eventId: ev.id,
                            durationMin: endMin - startMin,
                          }));
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        title={`${ev.beneficiaire} — ${fmtTime(ev.debut)} à ${fmtTime(ev.fin)}`}
                        className={`absolute top-1.5 rounded-md px-2 text-[11px] font-semibold text-white flex items-center truncate shadow-sm ${statusColor(ev.statut)} ${isDraggable ? "cursor-grab active:cursor-grabbing hover:shadow-md" : "cursor-default"}`}
                        style={{
                          left,
                          width,
                          height: ROW_HEIGHT - 12,
                        }}
                      >
                        {ev.beneficiaire}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Week Side-by-Side View ──

const WeekCalendarCard = ({
  employee,
  events,
  weekDays,
  weekNum,
}: {
  employee: any;
  events: any[];
  weekDays: Date[];
  weekNum: number;
}) => {
  const empName = `${employee.nom} ${employee.prenom}`;
  const empEvents = events.filter((e) => e.employe === empName);

  return (
    <div className="data-table-wrapper flex-1 min-w-[280px] overflow-hidden">
      <div className="px-3 py-2 border-b bg-muted/30 text-sm font-semibold text-foreground truncate">
        {employee.prenom} {employee.nom.toUpperCase()}
        <span className="ml-2 text-xs font-normal text-muted-foreground">S{weekNum}</span>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="p-1 text-center border-r last:border-r-0">
            <p className="text-[10px] font-medium text-muted-foreground">
              {format(day, "EEE", { locale: fr })}.
            </p>
            <p className="text-xs font-semibold text-foreground">{format(day, "dd")}</p>
          </div>
        ))}
      </div>
      {/* Events */}
      <div className="grid grid-cols-7 min-h-[100px]">
        {weekDays.map((day, i) => {
          const dk = format(day, "yyyy-MM-dd");
          const dayEvs = empEvents.filter((e) => e.date === dk);
          const isWeekend = i >= 5;
          return (
            <div
              key={dk}
              className={`p-1 border-r last:border-r-0 border-b space-y-0.5 ${isWeekend ? "bg-muted/20" : ""}`}
            >
              {dayEvs.map((ev) => (
                <div
                  key={ev.id}
                  className={`p-1 rounded text-[10px] truncate ${statusColor(ev.statut)} text-white`}
                  title={`${ev.beneficiaire} ${fmtTime(ev.debut)}-${fmtTime(ev.fin)}`}
                >
                  {fmtTime(ev.debut)} {ev.beneficiaire.split(" ")[0]}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Main Component ──

const PlanningMulti = () => {
  const [viewTab, setViewTab] = useState<"jour" | "semaine">("jour");
  const [dayOffset, setDayOffset] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [serviceFilter, setServiceFilter] = useState("all");
  const [secteurFilter, setSecteurFilter] = useState("all");

  // Week view: how many calendars and which employees
  const [nbCalendars, setNbCalendars] = useState(2);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  const { data: planningEvents } = usePlanningEvents();
  const updateEvent = useUpdatePlanningEvent();
  const { data: employes } = useEmployes();
  const { data: services } = useServices();
  const { data: secteurs } = useSecteurs();

  const allEvents = planningEvents ?? [];
  const allEmployees = useMemo(() => {
    let list = employes ?? [];
    if (serviceFilter !== "all") list = list.filter((e) => e.service === serviceFilter);
    return list.sort((a, b) => a.nom.localeCompare(b.nom));
  }, [employes, serviceFilter]);

  // Day view date
  const today = new Date();
  const currentDay = addDays(today, dayOffset);

  // Week view dates
  const baseMonday = startOfWeek(today, { weekStartsOn: 1 });
  const weekStart = addDays(baseMonday, weekOffset * 7);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const weekNum = getISOWeek(weekStart);

  // Ensure selectedEmployees has the right count
  const effectiveSelected = useMemo(() => {
    const result: any[] = [];
    for (let i = 0; i < nbCalendars; i++) {
      const empId = selectedEmployees[i];
      const found = allEmployees.find((e) => e.id === empId);
      if (found) {
        result.push(found);
      } else if (allEmployees[i]) {
        result.push(allEmployees[i]);
      }
    }
    return result;
  }, [selectedEmployees, nbCalendars, allEmployees]);

  const handleSelectEmployee = useCallback(
    (index: number, empId: string) => {
      setSelectedEmployees((prev) => {
        const next = [...prev];
        next[index] = empId;
        return next;
      });
    },
    []
  );

  const goToday = () => {
    if (viewTab === "jour") setDayOffset(0);
    else setWeekOffset(0);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="page-title">Planning Multi-Employés</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {viewTab === "jour"
              ? format(currentDay, "EEEE dd MMMM yyyy", { locale: fr })
              : `Semaine ${weekNum} — ${format(weekStart, "MMMM yyyy", { locale: fr })}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as any)}>
            <TabsList className="h-9">
              <TabsTrigger value="jour" className="text-xs">Jour</TabsTrigger>
              <TabsTrigger value="semaine" className="text-xs">Semaine</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => viewTab === "jour" ? setDayOffset((o) => o - 1) : setWeekOffset((o) => o - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={goToday}>Auj.</Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => viewTab === "jour" ? setDayOffset((o) => o + 1) : setWeekOffset((o) => o + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les services</SelectItem>
            {(services ?? []).map((s) => (
              <SelectItem key={s.id} value={s.nom}>{s.nom}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {viewTab === "jour" && (
          <div className="relative ml-auto">
            {searchOpen ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Rechercher un intervenant..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 h-9"
                  autoFocus
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSearchOpen(false); setSearch(""); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSearchOpen(true)}>
                <Search className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {viewTab === "semaine" && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">Calendriers :</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setNbCalendars((n) => Math.max(2, n - 1))} disabled={nbCalendars <= 2}>
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold w-4 text-center">{nbCalendars}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setNbCalendars((n) => Math.min(4, n + 1))} disabled={nbCalendars >= 4}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Views */}
      {viewTab === "jour" ? (
        <DayTimelineView
          date={currentDay}
          employees={allEmployees}
          events={allEvents}
          search={search}
          onMoveEvent={(eventId, newEmploye, newDebut, newFin) => {
            updateEvent.mutate({ id: eventId, employe: newEmploye, debut: newDebut, fin: newFin } as any);
          }}
        />
      ) : (
        <div className="space-y-3">
          {/* Employee selectors */}
          <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${nbCalendars}, minmax(0, 1fr))` }}>
            {effectiveSelected.map((emp, idx) => (
              <Select
                key={idx}
                value={emp.id}
                onValueChange={(v) => handleSelectEmployee(idx, v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {allEmployees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.prenom} {e.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
          {/* Calendars side by side */}
          <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${nbCalendars}, minmax(0, 1fr))` }}>
            {effectiveSelected.map((emp, idx) => (
              <WeekCalendarCard
                key={`${emp.id}-${idx}`}
                employee={emp}
                events={allEvents}
                weekDays={weekDays}
                weekNum={weekNum}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningMulti;
