import { useState, useMemo } from "react";
import { Plus, Search, Download, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEmployes, useInsertEmploye, useUpdateEmploye, useDeleteEmploye, useServices } from "@/hooks/useSupabaseData";
import EntityFormDialog, { FieldConfig } from "@/components/crud/EntityFormDialog";
import DeleteDialog from "@/components/crud/DeleteDialog";

const Employes = () => {
  const { data: employes, isLoading } = useEmployes();
  const { data: services } = useServices();
  const insertMutation = useInsertEmploye();
  const updateMutation = useUpdateEmploye();
  const deleteMutation = useDeleteEmploye();

  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, any> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fields: FieldConfig[] = useMemo(() => [
    { name: "code", label: "Code", required: true, placeholder: "EM006" },
    { name: "civilite", label: "Civilité", type: "select", options: [
      { label: "Mme", value: "Mme" },
      { label: "M.", value: "M." },
    ]},
    { name: "nom", label: "Nom", required: true, placeholder: "NOM" },
    { name: "prenom", label: "Prénom", required: true, placeholder: "Prénom" },
    { name: "service", label: "Service", type: "select", options: (services ?? []).map(s => ({ label: s.nom, value: s.nom })), placeholder: "Sélectionner un service" },
    { name: "poste", label: "Poste", placeholder: "Aide à domicile" },
    { name: "contrat", label: "Contrat", type: "select", options: [
      { label: "CDI", value: "CDI" },
      { label: "CDD", value: "CDD" },
    ]},
    { name: "date_embauche", label: "Date d'embauche", type: "date" },
    { name: "telephone", label: "Téléphone", type: "tel", placeholder: "06 12 34 56 78" },
    { name: "etat", label: "État", type: "select", required: true, options: [
      { label: "Actif", value: "Actif" },
      { label: "Archivé", value: "Archivé" },
    ]},
  ], [services]);

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
          <h1 className="page-title">Employés</h1>
          <p className="text-sm text-muted-foreground mt-1">{employes?.length ?? 0} employés enregistrés</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exporter</Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Nouvel employé</Button>
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
            {isLoading ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">Chargement...</TableCell></TableRow>
            ) : employes?.map((e) => (
              <TableRow key={e.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="text-muted-foreground">{e.civilite}</TableCell>
                <TableCell className="font-medium">{e.nom}</TableCell>
                <TableCell>{e.prenom}</TableCell>
                <TableCell className="text-muted-foreground">{e.service}</TableCell>
                <TableCell className="text-muted-foreground">{e.poste}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">{e.contrat}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{e.date_embauche ? new Date(e.date_embauche).toLocaleDateString("fr-FR") : "-"}</TableCell>
                <TableCell>
                  <span className={e.etat === "Actif" ? "badge-active" : "badge-archived"}>{e.etat}</span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(e)}><Pencil className="w-4 h-4 mr-2" />Modifier</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(e.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
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
        title={editItem ? "Modifier l'employé" : "Nouvel employé"}
        fields={fields}
        defaultValues={editItem ? { code: editItem.code, civilite: editItem.civilite || "", nom: editItem.nom, prenom: editItem.prenom, service: editItem.service || "", poste: editItem.poste || "", contrat: editItem.contrat || "", date_embauche: editItem.date_embauche || "", telephone: editItem.telephone || "", etat: editItem.etat } : { etat: "Actif" }}
        onSubmit={handleSubmit}
        loading={insertMutation.isPending || updateMutation.isPending}
      />

      <DeleteDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleteMutation.isPending} />
    </div>
  );
};

export default Employes;
