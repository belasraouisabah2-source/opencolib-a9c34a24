import { useState } from "react";
import { Plus, Search, Download, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useClients, useInsertClient, useUpdateClient, useDeleteClient } from "@/hooks/useSupabaseData";
import EntityFormDialog, { FieldConfig } from "@/components/crud/EntityFormDialog";
import DeleteDialog from "@/components/crud/DeleteDialog";

const fields: FieldConfig[] = [
  { name: "code", label: "Code", required: true, placeholder: "CL006" },
  { name: "nom", label: "Nom du client", required: true, placeholder: "Nom de l'organisme" },
  { name: "date_creation", label: "Date de création", type: "date", required: true },
  { name: "etat", label: "État", type: "select", required: true, options: [
    { label: "Actif", value: "Actif" },
    { label: "Archivé", value: "Archivé" },
  ]},
];

const Clients = () => {
  const { data: clients, isLoading } = useClients();
  const insertMutation = useInsertClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, any> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = (clients ?? []).filter(c =>
    [c.code, c.nom, c.etat].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreate = () => { setEditItem(null); setFormOpen(true); };
  const openEdit = (item: Record<string, any>) => { setEditItem(item); setFormOpen(true); };

  const handleSubmit = (data: Record<string, string>) => {
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, ...data }, { onSuccess: () => setFormOpen(false) });
    } else {
      insertMutation.mutate(data, { onSuccess: () => setFormOpen(false) });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} clients enregistrés</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exporter</Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Nouveau client</Button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un client..." className="pl-9 h-9 bg-secondary border-0" value={search} onChange={e => setSearch(e.target.value)} />
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
            ) : filtered.map((c) => (
              <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-mono text-sm text-muted-foreground">{c.code}</TableCell>
                <TableCell className="font-medium">{c.nom}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(c.date_creation).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>
                  <span className={c.etat === "Actif" ? "badge-active" : "badge-archived"}>{c.etat}</span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(c)}><Pencil className="w-4 h-4 mr-2" />Modifier</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(c.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editItem ? "Modifier le client" : "Nouveau client"}
        fields={fields}
        defaultValues={editItem ? { code: editItem.code, nom: editItem.nom, date_creation: editItem.date_creation, etat: editItem.etat } : { etat: "Actif" }}
        onSubmit={handleSubmit}
        loading={insertMutation.isPending || updateMutation.isPending}
      />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Clients;
