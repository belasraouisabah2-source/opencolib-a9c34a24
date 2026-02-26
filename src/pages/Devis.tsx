import { useState } from "react";
import { Plus, Search, Download, MoreHorizontal, Pencil, Trash2, Eye, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useDevis, useBeneficiaires } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import DeleteDialog from "@/components/crud/DeleteDialog";
import DevisFormDialog from "@/components/devis/DevisFormDialog";
import DevisDetailDialog from "@/components/devis/DevisDetailDialog";
import TransformerContratDialog from "@/components/devis/TransformerContratDialog";
import { useQuery } from "@tanstack/react-query";

const statusVariant = (s: string) => {
  switch (s) {
    case "Brouillon": return "secondary";
    case "Envoyé": return "default";
    case "Accepté": return "default";
    case "Refusé": return "destructive";
    default: return "secondary";
  }
};

const statusClass = (s: string) => {
  if (s === "Accepté") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (s === "Envoyé") return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  if (s === "Refusé") return "bg-destructive/10 text-destructive";
  return "";
};

const Devis = () => {
  const { data: devis, isLoading } = useDevis();
  const { data: beneficiaires } = useBeneficiaires();
  const queryClient = useQueryClient();

  // Fetch prises en charge for transformer dialog
  const { data: prisesEnCharge } = useQuery({
    queryKey: ["beneficiaire_prises_en_charge"],
    queryFn: async () => {
      const { data, error } = await supabase.from("beneficiaire_prises_en_charge").select("*");
      if (error) throw error;
      return data;
    },
  });

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [detailItem, setDetailItem] = useState<any | null>(null);
  const [contratDevis, setContratDevis] = useState<any | null>(null);

  const filtered = (devis ?? []).filter(d =>
    [d.code, d.beneficiaire_nom, d.statut].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreate = () => { setEditItem(null); setFormOpen(true); };
  const openEdit = (item: any) => { setEditItem(item); setFormOpen(true); };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    const { error } = await supabase.from("devis").delete().eq("id", deleteId as any);
    setDeleteLoading(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["devis"] });
      toast({ title: "Devis supprimé" });
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="page-title">Devis</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} devis</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exporter</Button>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Nouveau devis</Button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un devis..." className="pl-9 h-9 bg-secondary border-0" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Devis</TableHead>
              <TableHead>Bénéficiaire</TableHead>
              <TableHead>Date création</TableHead>
              <TableHead>Validité</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Chargement...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Aucun devis</TableCell></TableRow>
            ) : filtered.map((d) => (
              <TableRow key={d.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailItem(d)}>
                <TableCell className="font-mono text-sm text-muted-foreground">{d.code}</TableCell>
                <TableCell className="font-medium">{d.beneficiaire_nom}</TableCell>
                <TableCell className="text-muted-foreground">{d.date_creation}</TableCell>
                <TableCell className="text-muted-foreground">{d.date_validite}</TableCell>
                <TableCell className="text-right font-medium">{Number(d.montant_total).toFixed(2)} €</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(d.statut)} className={statusClass(d.statut)}>{d.statut}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <button className="p-1 rounded hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDetailItem(d); }}><Eye className="w-4 h-4 mr-2" />Voir</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(d); }}><Pencil className="w-4 h-4 mr-2" />Modifier</DropdownMenuItem>
                      {(d.statut === "Accepté" || d.statut === "Envoyé") && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setContratDevis(d); }}>
                          <FileCheck className="w-4 h-4 mr-2" />Transformer en contrat
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteId(d.id); }} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DevisFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editItem={editItem}
        beneficiaires={beneficiaires ?? []}
      />

      <DevisDetailDialog
        open={!!detailItem}
        onOpenChange={(o) => !o && setDetailItem(null)}
        devis={detailItem}
      />

      <TransformerContratDialog
        open={!!contratDevis}
        onOpenChange={(o) => !o && setContratDevis(null)}
        devis={contratDevis}
        prisesEnCharge={prisesEnCharge ?? []}
      />

      <DeleteDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleteLoading} />
    </div>
  );
};

export default Devis;
