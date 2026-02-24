import { Plus, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSecteurs } from "@/hooks/useSupabaseData";

const Secteurs = () => {
  const { data: secteurs, isLoading } = useSecteurs();

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="page-title">Secteurs</h1>
          <p className="text-sm text-muted-foreground mt-1">{secteurs?.length ?? 0} secteurs configurés</p>
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
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Chargement...</TableCell></TableRow>
            ) : secteurs?.map((s) => (
              <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-mono text-sm text-muted-foreground">{s.code}</TableCell>
                <TableCell className="font-medium">{s.nom}</TableCell>
                <TableCell className="text-muted-foreground">{s.service}</TableCell>
                <TableCell className="text-center">{s.nb_employes}</TableCell>
                <TableCell className="text-center">{s.nb_beneficiaires}</TableCell>
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
