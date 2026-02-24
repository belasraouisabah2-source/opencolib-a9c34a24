import { Plus, Search, Download, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { beneficiaires } from "@/data/mockData";

const Beneficiaires = () => {
  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="page-title">Bénéficiaires</h1>
          <p className="text-sm text-muted-foreground mt-1">{beneficiaires.length} bénéficiaires enregistrés</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau bénéficiaire
          </Button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un bénéficiaire..." className="pl-9 h-9 bg-secondary border-0" />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Civilité</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date de naissance</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>État</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {beneficiaires.map((b) => (
              <TableRow key={b.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="text-muted-foreground">{b.civilite}</TableCell>
                <TableCell className="font-medium">{b.nom}</TableCell>
                <TableCell>{b.prenom}</TableCell>
                <TableCell className="text-muted-foreground">{b.service}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(b.dateNaissance).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell className="text-muted-foreground">{b.telephone}</TableCell>
                <TableCell>
                  <span className={b.etat === "Actif" ? "badge-active" : "badge-archived"}>{b.etat}</span>
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

export default Beneficiaires;
