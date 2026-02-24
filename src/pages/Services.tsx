import { useState, useMemo } from "react";
import { Plus, Search, Download, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useServices, useInsertService, useUpdateService, useDeleteService, useClients } from "@/hooks/useSupabaseData";
import EntityFormDialog, { FieldConfig } from "@/components/crud/EntityFormDialog";
import DeleteDialog from "@/components/crud/DeleteDialog";

const Services = () => {
  const { data: services, isLoading } = useServices();
  const { data: clients } = useClients();
  const insertMutation = useInsertService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, any> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fields: FieldConfig[] = useMemo(() => [
    { name: "code", label: "Code", required: true, placeholder: "SV006" },
    { name: "nom", label: "Nom du service", required: true, placeholder: "Nom du service" },
    { name: "client_nom", label: "Client", type: "select", required: true, options: (clients ?? []).map(c => ({ label: c.nom, value: c.nom })) },
    { name: "type", label: "Type", type: "select", required: true, options: [
      { label: "SAD", value: "SAD" },
      { label: "SSIAD", value: "SSIAD" },
      { label: "SPASAD", value: "SPASAD" },
    ]},
    { name: "date_creation", label: "Date de création", type: "date", required: true },
    { name: "etat", label: "État", type: "select", required: true, options: [
      { label: "Activé", value: "Activé" },
      { label: "Archivé", value: "Archivé" },
    ]},
  ], [clients]);

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
    if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="page-title">Services</h1>
          <p className="text-sm text-muted-foreground mt-1">{services?.length ?? 0} services configurés</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exporter</Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Nouveau service</Button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un service..." className="pl-9 h-9 bg-secondary border-0" />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Nom du service</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead>État</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Chargement...</TableCell></TableRow>
            ) : services?.map((s) => (
              <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-mono text-sm text-muted-foreground">{s.code}</TableCell>
                <TableCell className="font-medium">{s.nom}</TableCell>
                <TableCell className="text-muted-foreground">{s.client_nom}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">{s.type}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{new Date(s.date_creation).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>
                  <span className={s.etat === "Activé" ? "badge-active" : "badge-archived"}>{s.etat}</span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(s)}><Pencil className="w-4 h-4 mr-2" />Modifier</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(s.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
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
        title={editItem ? "Modifier le service" : "Nouveau service"}
        fields={fields}
        defaultValues={editItem ? { code: editItem.code, nom: editItem.nom, client_nom: editItem.client_nom, type: editItem.type, date_creation: editItem.date_creation, etat: editItem.etat } : { etat: "Activé" }}
        onSubmit={handleSubmit}
        loading={insertMutation.isPending || updateMutation.isPending}
      />

      <DeleteDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleteMutation.isPending} />
    </div>
  );
};

export default Services;
