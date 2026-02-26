import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface ContratDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrat: any | null;
}

const statusClass = (s: string) => {
  if (s === "Actif") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (s === "Suspendu") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  if (s === "Résilié") return "bg-destructive/10 text-destructive";
  if (s === "Terminé") return "bg-muted text-muted-foreground";
  return "";
};

const ContratDetailDialog = ({ open, onOpenChange, contrat }: ContratDetailDialogProps) => {
  const [lignes, setLignes] = useState<any[]>([]);

  useEffect(() => {
    if (open && contrat) {
      supabase.from("contrat_lignes").select("*").eq("contrat_id", contrat.id).order("created_at").then(({ data }) => {
        setLignes(data ?? []);
      });
    }
  }, [open, contrat]);

  if (!contrat) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Contrat {contrat.code}
            <Badge className={statusClass(contrat.statut)}>{contrat.statut}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Bénéficiaire :</span> <span className="font-medium">{contrat.beneficiaire_nom}</span></div>
            <div><span className="text-muted-foreground">Date de signature :</span> <span className="font-medium">{contrat.date_signature}</span></div>
            <div><span className="text-muted-foreground">Début :</span> <span className="font-medium">{contrat.date_debut}</span></div>
            <div><span className="text-muted-foreground">Fin :</span> <span className="font-medium">{contrat.date_fin || "Indéterminée"}</span></div>
            <div><span className="text-muted-foreground">Montant :</span> <span className="font-semibold">{Number(contrat.montant_total).toFixed(2)} €</span></div>
            <div><span className="text-muted-foreground">Paiement :</span> <span className="font-medium">{contrat.modalites_paiement || "—"}</span></div>
          </div>

          {contrat.clauses && (
            <div className="text-sm">
              <span className="text-muted-foreground">Clauses :</span>
              <p className="mt-1 whitespace-pre-wrap">{contrat.clauses}</p>
            </div>
          )}

          {contrat.notes && (
            <div className="text-sm">
              <span className="text-muted-foreground">Notes :</span>
              <p className="mt-1">{contrat.notes}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Services contractualisés</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Fréquence</TableHead>
                  <TableHead className="text-right">Durée (h)</TableHead>
                  <TableHead className="text-right">Tarif/h</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lignes.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Aucune ligne</TableCell></TableRow>
                ) : lignes.map(l => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.service}</TableCell>
                    <TableCell className="text-muted-foreground">{l.frequence || "—"}</TableCell>
                    <TableCell className="text-right">{Number(l.duree_heures).toFixed(1)}</TableCell>
                    <TableCell className="text-right">{Number(l.tarif_horaire).toFixed(2)} €</TableCell>
                    <TableCell className="text-right font-medium">{Number(l.montant).toFixed(2)} €</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContratDetailDialog;
