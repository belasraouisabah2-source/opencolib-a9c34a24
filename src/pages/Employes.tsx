import { Plus, Search, Download, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { employes } from "@/data/mockData";

const Employes = () => {
  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="page-title">Employés</h1>
          <p className="text-sm text-muted-foreground mt-1">{employes.length} employés enregistrés</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nouvel employé
          </Button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un employé..." className="pl-9 h-9 bg-secondary border-0" />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Civilité</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Contrat</TableHead>
              <TableHead>Date d'embauche</TableHead>
              <TableHead>État</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employes.map((e) => (
              <TableRow key={e.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="text-muted-foreground">{e.civilite}</TableCell>
                <TableCell className="font-medium">{e.nom}</TableCell>
                <TableCell>{e.prenom}</TableCell>
                <TableCell className="text-muted-foreground">{e.service}</TableCell>
                <TableCell className="text-muted-foreground">{e.poste}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">{e.contrat}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{new Date(e.dateEmbauche).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>
                  <span className={e.etat === "Actif" ? "badge-active" : "badge-archived"}>{e.etat}</span>
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

export default Employes;
