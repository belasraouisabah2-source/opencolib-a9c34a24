import { Plus, Search, Download, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useClients } from "@/hooks/useSupabaseData";

const Clients = () => {
  const { data: clients, isLoading } = useClients();

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">{clients?.length ?? 0} clients enregistrés</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau client
          </Button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un client..." className="pl-9 h-9 bg-secondary border-0" />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Nom du client</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead>État</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Chargement...</TableCell></TableRow>
            ) : clients?.map((c) => (
              <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-mono text-sm text-muted-foreground">{c.code}</TableCell>
                <TableCell className="font-medium">{c.nom}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(c.date_creation).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>
                  <span className={c.etat === "Actif" ? "badge-active" : "badge-archived"}>{c.etat}</span>
                </TableCell>
                <TableCell>
                  <button className="p-1 rounded hover:bg-muted">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Clients;
