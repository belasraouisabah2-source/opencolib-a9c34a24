import { Plus, Search, Download, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const factures = [
  { id: "FAC-2026-001", beneficiaire: "DUPONT Marie", periode: "Janvier 2026", montantHT: 1250.00, tva: 250.00, montantTTC: 1500.00, statut: "Payée" },
  { id: "FAC-2026-002", beneficiaire: "MARTIN Jean", periode: "Janvier 2026", montantHT: 980.00, tva: 196.00, montantTTC: 1176.00, statut: "En attente" },
  { id: "FAC-2026-003", beneficiaire: "BERNARD Suzanne", periode: "Janvier 2026", montantHT: 1540.00, tva: 308.00, montantTTC: 1848.00, statut: "Payée" },
  { id: "FAC-2026-004", beneficiaire: "PETIT Robert", periode: "Janvier 2026", montantHT: 720.00, tva: 144.00, montantTTC: 864.00, statut: "Impayée" },
  { id: "FAC-2026-005", beneficiaire: "DUPONT Marie", periode: "Février 2026", montantHT: 1100.00, tva: 220.00, montantTTC: 1320.00, statut: "En attente" },
];

const statusClass = (s: string) => {
  if (s === "Payée") return "badge-active";
  if (s === "En attente") return "badge-pending";
  return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive";
};

const Facturation = () => {
  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="page-title">Facturation</h1>
          <p className="text-sm text-muted-foreground mt-1">{factures.length} factures</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle facture
          </Button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher une facture..." className="pl-9 h-9 bg-secondary border-0" />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Facture</TableHead>
              <TableHead>Bénéficiaire</TableHead>
              <TableHead>Période</TableHead>
              <TableHead className="text-right">Montant HT</TableHead>
              <TableHead className="text-right">TVA</TableHead>
              <TableHead className="text-right">Total TTC</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {factures.map((f) => (
              <TableRow key={f.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-mono text-sm text-muted-foreground">{f.id}</TableCell>
                <TableCell className="font-medium">{f.beneficiaire}</TableCell>
                <TableCell className="text-muted-foreground">{f.periode}</TableCell>
                <TableCell className="text-right">{f.montantHT.toFixed(2)} €</TableCell>
                <TableCell className="text-right text-muted-foreground">{f.tva.toFixed(2)} €</TableCell>
                <TableCell className="text-right font-medium">{f.montantTTC.toFixed(2)} €</TableCell>
                <TableCell>
                  <span className={statusClass(f.statut)}>{f.statut}</span>
                </TableCell>
                <TableCell>
                  <button className="p-1 rounded hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Facturation;
