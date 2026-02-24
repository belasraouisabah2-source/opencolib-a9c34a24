import { useState, useMemo } from "react";
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSecteurs, useInsertSecteur, useUpdateSecteur, useDeleteSecteur, useServices } from "@/hooks/useSupabaseData";
import EntityFormDialog, { FieldConfig } from "@/components/crud/EntityFormDialog";
import DeleteDialog from "@/components/crud/DeleteDialog";

const Secteurs = () => {
  const { data: secteurs, isLoading } = useSecteurs();
  const { data: services } = useServices();
  const insertMutation = useInsertSecteur();
  const updateMutation = useUpdateSecteur();
  const deleteMutation = useDeleteSecteur();

  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, any> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fields: FieldConfig[] = useMemo(() => [
    { name: "code", label: "Code", required: true, placeholder: "SEC007" },
    { name: "nom", label: "Nom du secteur", required: true, placeholder: "Nom du secteur" },
    { name: "service", label: "Service rattaché", type: "select", options: (services ?? []).map(s => ({ label: s.nom, value: s.nom })), placeholder: "Sélectionner un service" },
    { name: "nb_employes", label: "Nombre d'employés", placeholder: "0" },
    { name: "nb_beneficiaires", label: "Nombre de bénéficiaires", placeholder: "0" },
    { name: "etat", label: "État", type: "select", required: true, options: [
      { label: "Actif", value: "Actif" },
      { label: "Archivé", value: "Archivé" },
    ]},
  ], [services]);

  const openCreate = () => { setEditItem(null); setFormOpen(true); };
  const openEdit = (item: Record<string, any>) => { setEditItem(item); setFormOpen(true); };

  const handleSubmit = (data: Record<string, string>) => {
    const payload = { ...data, nb_employes: parseInt(data.nb_employes) || 0, nb_beneficiaires: parseInt(data.nb_beneficiaires) || 0 };
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, ...payload }, { onSuccess: () => setFormOpen(false) });
    } else {
      insertMutation.mutate(payload, { onSuccess: () => setFormOpen(false) });
    }
  };

  const handleDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="page-title">Secteurs</h1>
          <p className="text-sm text-muted-foreground mt-1">{secteurs?.length ?? 0} secteurs configurés</p>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Nouveau secteur</Button>
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
        title={editItem ? "Modifier le secteur" : "Nouveau secteur"}
        fields={fields}
        defaultValues={editItem ? { code: editItem.code, nom: editItem.nom, service: editItem.service || "", nb_employes: String(editItem.nb_employes), nb_beneficiaires: String(editItem.nb_beneficiaires), etat: editItem.etat } : { etat: "Actif", nb_employes: "0", nb_beneficiaires: "0" }}
        onSubmit={handleSubmit}
        loading={insertMutation.isPending || updateMutation.isPending}
      />

      <DeleteDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleteMutation.isPending} />
    </div>
  );
};

export default Secteurs;
