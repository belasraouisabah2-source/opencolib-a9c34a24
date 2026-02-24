import { Plus, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const secteurs = [
  { id: "SEC001", nom: "Paris Nord-Est", service: "SAAD Paris Nord", nbEmployes: 8, nbBeneficiaires: 22, etat: "Actif" },
  { id: "SEC002", nom: "Paris Sud-Ouest", service: "SSIAD Paris Sud", nbEmployes: 6, nbBeneficiaires: 18, etat: "Actif" },
  { id: "SEC003", nom: "Lyon Presqu'île", service: "SAAD Lyon Centre", nbEmployes: 5, nbBeneficiaires: 15, etat: "Actif" },
  { id: "SEC004", nom: "Paris Bastille", service: "SAAD Paris Est", nbEmployes: 7, nbBeneficiaires: 20, etat: "Actif" },
  { id: "SEC005", nom: "Marseille Vieux-Port", service: "SPASAD Marseille", nbEmployes: 4, nbBeneficiaires: 10, etat: "Archivé" },
  { id: "SEC006", nom: "Paris Montmartre", service: "SAAD Paris Nord", nbEmployes: 6, nbBeneficiaires: 16, etat: "Actif" },
];

const Secteurs = () => {
  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="page-title">Secteurs</h1>
          <p className="text-sm text-muted-foreground mt-1">{secteurs.length} secteurs configurés</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau secteur
        </Button>
      </div>

      <div className="data-table-wrapper">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un secteur..." className="pl-9 h-9 bg-secondary border-0" />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Nom du secteur</TableHead>
              <TableHead>Service rattaché</TableHead>
              <TableHead className="text-center">Employés</TableHead>
              <TableHead className="text-center">Bénéficiaires</TableHead>
              <TableHead>État</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {secteurs.map((s) => (
              <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-mono text-sm text-muted-foreground">{s.id}</TableCell>
                <TableCell className="font-medium">{s.nom}</TableCell>
                <TableCell className="text-muted-foreground">{s.service}</TableCell>
                <TableCell className="text-center">{s.nbEmployes}</TableCell>
                <TableCell className="text-center">{s.nbBeneficiaires}</TableCell>
                <TableCell>
                  <span className={s.etat === "Actif" ? "badge-active" : "badge-archived"}>{s.etat}</span>
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

export default Secteurs;
