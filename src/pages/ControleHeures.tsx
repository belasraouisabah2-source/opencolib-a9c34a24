import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { planningEvents } from "@/data/mockData";

const calcDuree = (d: string, f: string) => {
  const [dh, dm] = d.split(":").map(Number);
  const [fh, fm] = f.split(":").map(Number);
  const mins = (fh * 60 + fm) - (dh * 60 + dm);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${m.toString().padStart(2, "0")}`;
};

const calcEcart = (planifie: string, reel: string) => {
  const [ph, pm] = planifie.split(":").map(Number);
  const [rh, rm] = reel.split(":").map(Number);
  const diff = (rh * 60 + rm) - (ph * 60 + pm);
  if (diff === 0) return "0 min";
  return `${diff > 0 ? "+" : ""}${diff} min`;
};

const completed = planningEvents.filter(e => e.statut === "Terminée");

const ControleHeures = () => {
  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="page-title">Contrôle des heures</h1>
          <p className="text-sm text-muted-foreground mt-1">Validation des heures planifiées vs réalisées</p>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." className="pl-9 h-9 bg-secondary border-0" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employé</TableHead>
                <TableHead>Bénéficiaire</TableHead>
                <TableHead className="bg-muted/30">Début planifié</TableHead>
                <TableHead className="bg-muted/30">Fin planifié</TableHead>
                <TableHead className="bg-muted/30">Durée planifié</TableHead>
                <TableHead>Début réalisé</TableHead>
                <TableHead>Fin réalisé</TableHead>
                <TableHead>Durée réalisé</TableHead>
                <TableHead className="bg-muted/30">Écart</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completed.map((e) => {
                const dureePlan = calcDuree(e.debut, e.fin);
                const dureeReel = e.debutReel && e.finReelle ? calcDuree(e.debutReel, e.finReelle) : "-";
                const ecartDebut = e.debutReel ? calcEcart(e.debut, e.debutReel) : "-";
                const hasAnomaly = e.debutReel && Math.abs(parseInt(calcEcart(e.debut, e.debutReel)) || 0) > 10;

                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.employe}</TableCell>
                    <TableCell>{e.beneficiaire}</TableCell>
                    <TableCell className="bg-muted/20 text-muted-foreground">{e.debut}</TableCell>
                    <TableCell className="bg-muted/20 text-muted-foreground">{e.fin}</TableCell>
                    <TableCell className="bg-muted/20 text-muted-foreground">{dureePlan}</TableCell>
                    <TableCell>{e.debutReel}</TableCell>
                    <TableCell>{e.finReelle}</TableCell>
                    <TableCell>{dureeReel}</TableCell>
                    <TableCell className="bg-muted/20">
                      <span className={hasAnomaly ? "text-destructive font-medium" : "text-muted-foreground"}>
                        {ecartDebut}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={hasAnomaly ? "badge-pending" : "badge-active"}>
                        {hasAnomaly ? "Anomalie" : "Validé"}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ControleHeures;
