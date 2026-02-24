import { useState, useMemo } from "react";
import { Plus, Search, Download, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useFactures, useInsertFacture, useUpdateFacture, useDeleteFacture, useBeneficiaires } from "@/hooks/useSupabaseData";
import EntityFormDialog, { FieldConfig } from "@/components/crud/EntityFormDialog";
import DeleteDialog from "@/components/crud/DeleteDialog";

const statusClass = (s: string) => {
  if (s === "Payée") return "badge-active";
  if (s === "En attente") return "badge-pending";
  return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive";
};

const Facturation = () => {
  const { data: factures, isLoading } = useFactures();
  const { data: beneficiaires } = useBeneficiaires();
  const insertMutation = useInsertFacture();
  const updateMutation = useUpdateFacture();
  const deleteMutation = useDeleteFacture();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, any> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = (factures ?? []).filter(f =>
    [f.code, f.beneficiaire, f.periode, f.statut].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const fields: FieldConfig[] = useMemo(() => [
    { name: "code", label: "N° Facture", required: true, placeholder: "FAC-2026-006" },
    { name: "beneficiaire", label: "Bénéficiaire", type: "select", required: true, options: (beneficiaires ?? []).map(b => ({ label: `${b.nom} ${b.prenom}`, value: `${b.nom} ${b.prenom}` })), placeholder: "Sélectionner un bénéficiaire" },
    { name: "periode", label: "Période", required: true, placeholder: "Février 2026" },
    { name: "montant_ht", label: "Montant HT (€)", required: true, placeholder: "1000.00" },
    { name: "tva", label: "TVA (€)", required: true, placeholder: "200.00" },
    { name: "montant_ttc", label: "Montant TTC (€)", required: true, placeholder: "1200.00" },
    { name: "statut", label: "Statut", type: "select", required: true, options: [
      { label: "En attente", value: "En attente" },
      { label: "Payée", value: "Payée" },
      { label: "Impayée", value: "Impayée" },
    ]},
  ], [beneficiaires]);

  const openCreate = () => { setEditItem(null); setFormOpen(true); };
  const openEdit = (item: Record<string, any>) => { setEditItem(item); setFormOpen(true); };

  const handleSubmit = (data: Record<string, string>) => {
    const payload = { ...data, montant_ht: parseFloat(data.montant_ht) || 0, tva: parseFloat(data.tva) || 0, montant_ttc: parseFloat(data.montant_ttc) || 0 };
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
          <h1 className="page-title">Facturation</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} factures</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exporter</Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Nouvelle facture</Button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher une facture..." className="pl-9 h-9 bg-secondary border-0" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Facture</TableHead>
              <TableHead>Bénéficiaire</TableHead>
              <TableHead>Période</TableHead>
              <TableHead className="text-right">Montant HT</TableHead>
              <TableHead className="text-right">TVA</TableHead>
              <TableHead className="text-right">Total TTC</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Chargement...</TableCell></TableRow>
            ) : filtered.map((f) => (
              <TableRow key={f.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-mono text-sm text-muted-foreground">{f.code}</TableCell>
                <TableCell className="font-medium">{f.beneficiaire}</TableCell>
                <TableCell className="text-muted-foreground">{f.periode}</TableCell>
                <TableCell className="text-right">{Number(f.montant_ht).toFixed(2)} €</TableCell>
                <TableCell className="text-right text-muted-foreground">{Number(f.tva).toFixed(2)} €</TableCell>
                <TableCell className="text-right font-medium">{Number(f.montant_ttc).toFixed(2)} €</TableCell>
                <TableCell>
                  <span className={statusClass(f.statut)}>{f.statut}</span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(f)}><Pencil className="w-4 h-4 mr-2" />Modifier</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(f.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
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
        title={editItem ? "Modifier la facture" : "Nouvelle facture"}
        fields={fields}
        defaultValues={editItem ? { code: editItem.code, beneficiaire: editItem.beneficiaire, periode: editItem.periode, montant_ht: String(editItem.montant_ht), tva: String(editItem.tva), montant_ttc: String(editItem.montant_ttc), statut: editItem.statut } : { statut: "En attente" }}
        onSubmit={handleSubmit}
        loading={insertMutation.isPending || updateMutation.isPending}
      />

      <DeleteDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleteMutation.isPending} />
    </div>
  );
};

export default Facturation;
