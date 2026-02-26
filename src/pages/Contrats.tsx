import { useState } from "react";
import { Search, Download, MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useContrats } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import DeleteDialog from "@/components/crud/DeleteDialog";
import ContratDetailDialog from "@/components/contrats/ContratDetailDialog";

const statusClass = (s: string) => {
  if (s === "Actif") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (s === "Suspendu") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  if (s === "Résilié") return "bg-destructive/10 text-destructive";
  if (s === "Terminé") return "bg-muted text-muted-foreground";
  return "";
};

const Contrats = () => {
  const { data: contrats, isLoading } = useContrats();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [detailItem, setDetailItem] = useState<any | null>(null);

  const filtered = (contrats ?? []).filter(c =>
    [c.code, c.beneficiaire_nom, c.statut].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    const { error } = await supabase.from("contrats").delete().eq("id", deleteId as any);
    setDeleteLoading(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["contrats"] });
      toast({ title: "Contrat supprimé" });
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="page-title">Contrats</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} contrat(s)</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exporter</Button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher un contrat..." className="pl-9 h-9 bg-secondary border-0" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Contrat</TableHead>
              <TableHead>Bénéficiaire</TableHead>
              <TableHead>Signature</TableHead>
              <TableHead>Début</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>Paiement</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">Chargement...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">Aucun contrat — Transformez un devis accepté en contrat depuis la page Devis</TableCell></TableRow>
            ) : filtered.map((c) => (
              <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailItem(c)}>
                <TableCell className="font-mono text-sm text-muted-foreground">{c.code}</TableCell>
                <TableCell className="font-medium">{c.beneficiaire_nom}</TableCell>
                <TableCell className="text-muted-foreground">{c.date_signature}</TableCell>
                <TableCell className="text-muted-foreground">{c.date_debut}</TableCell>
                <TableCell className="text-muted-foreground">{c.date_fin || "—"}</TableCell>
                <TableCell className="text-right font-medium">{Number(c.montant_total).toFixed(2)} €</TableCell>
                <TableCell className="text-muted-foreground">{c.modalites_paiement || "—"}</TableCell>
                <TableCell>
                  <Badge className={statusClass(c.statut)}>{c.statut}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <button className="p-1 rounded hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDetailItem(c); }}><Eye className="w-4 h-4 mr-2" />Voir</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteId(c.id); }} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ContratDetailDialog
        open={!!detailItem}
        onOpenChange={(o) => !o && setDetailItem(null)}
        contrat={detailItem}
      />

      <DeleteDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleteLoading} />
    </div>
  );
};

export default Contrats;
