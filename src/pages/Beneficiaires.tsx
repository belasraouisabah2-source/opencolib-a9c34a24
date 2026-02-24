import { useState, useMemo } from "react";
import { Plus, Search, Download, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useBeneficiaires, useInsertBeneficiaire, useUpdateBeneficiaire, useDeleteBeneficiaire, useClients, useServices } from "@/hooks/useSupabaseData";
import EntityFormDialog, { FieldConfig } from "@/components/crud/EntityFormDialog";
import DeleteDialog from "@/components/crud/DeleteDialog";

const Beneficiaires = () => {
  const { data: beneficiaires, isLoading } = useBeneficiaires();
  const { data: clients } = useClients();
  const { data: services } = useServices();
  const insertMutation = useInsertBeneficiaire();
  const updateMutation = useUpdateBeneficiaire();
  const deleteMutation = useDeleteBeneficiaire();

  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, any> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fields: FieldConfig[] = useMemo(() => [
    { name: "code", label: "Code", required: true, placeholder: "BN006" },
    { name: "civilite", label: "Civilité", type: "select", options: [
      { label: "Mme", value: "Mme" },
      { label: "M.", value: "M." },
    ]},
    { name: "nom", label: "Nom", required: true, placeholder: "NOM" },
    { name: "prenom", label: "Prénom", required: true, placeholder: "Prénom" },
    { name: "client", label: "Client", type: "select", options: (clients ?? []).map(c => ({ label: c.nom, value: c.nom })), placeholder: "Sélectionner un client" },
    { name: "service", label: "Service", type: "select", options: (services ?? []).map(s => ({ label: s.nom, value: s.nom })), placeholder: "Sélectionner un service" },
    { name: "date_naissance", label: "Date de naissance", type: "date" },
    { name: "adresse", label: "Adresse", placeholder: "Adresse complète" },
    { name: "telephone", label: "Téléphone", type: "tel", placeholder: "01 23 45 67 89" },
    { name: "etat", label: "État", type: "select", required: true, options: [
      { label: "Actif", value: "Actif" },
      { label: "Archivé", value: "Archivé" },
    ]},
  ], [clients, services]);

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
          <h1 className="page-title">Bénéficiaires</h1>
          <p className="text-sm text-muted-foreground mt-1">{beneficiaires?.length ?? 0} bénéficiaires enregistrés</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exporter</Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Nouveau bénéficiaire</Button>
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
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Chargement...</TableCell></TableRow>
            ) : beneficiaires?.map((b) => (
              <TableRow key={b.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="text-muted-foreground">{b.civilite}</TableCell>
                <TableCell className="font-medium">{b.nom}</TableCell>
                <TableCell>{b.prenom}</TableCell>
                <TableCell className="text-muted-foreground">{b.service}</TableCell>
                <TableCell className="text-muted-foreground">{b.date_naissance ? new Date(b.date_naissance).toLocaleDateString("fr-FR") : "-"}</TableCell>
                <TableCell className="text-muted-foreground">{b.telephone}</TableCell>
                <TableCell>
                  <span className={b.etat === "Actif" ? "badge-active" : "badge-archived"}>{b.etat}</span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(b)}><Pencil className="w-4 h-4 mr-2" />Modifier</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(b.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
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
        title={editItem ? "Modifier le bénéficiaire" : "Nouveau bénéficiaire"}
        fields={fields}
        defaultValues={editItem ? { code: editItem.code, civilite: editItem.civilite || "", nom: editItem.nom, prenom: editItem.prenom, client: editItem.client || "", service: editItem.service || "", date_naissance: editItem.date_naissance || "", adresse: editItem.adresse || "", telephone: editItem.telephone || "", etat: editItem.etat } : { etat: "Actif" }}
        onSubmit={handleSubmit}
        loading={insertMutation.isPending || updateMutation.isPending}
      />

      <DeleteDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleteMutation.isPending} />
    </div>
  );
};

export default Beneficiaires;
