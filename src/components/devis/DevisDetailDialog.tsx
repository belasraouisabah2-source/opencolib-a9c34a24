import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface DevisDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devis: any | null;
}

const DevisDetailDialog = ({ open, onOpenChange, devis }: DevisDetailDialogProps) => {
  const [lignes, setLignes] = useState<any[]>([]);

  useEffect(() => {
    if (open && devis) {
      supabase.from("devis_lignes").select("*").eq("devis_id", devis.id).order("created_at").then(({ data }) => {
        setLignes(data ?? []);
      });
    }
  }, [open, devis]);

  if (!devis) return null;

  const statusClass = (s: string) => {
    if (s === "Accepté") return "bg-green-100 text-green-800";
    if (s === "Envoyé") return "bg-blue-100 text-blue-800";
    if (s === "Refusé") return "bg-destructive/10 text-destructive";
    return "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Devis {devis.code}
            <Badge className={statusClass(devis.statut)}>{devis.statut}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Bénéficiaire :</span> <span className="font-medium">{devis.beneficiaire_nom}</span></div>
            <div><span className="text-muted-foreground">Date création :</span> <span className="font-medium">{devis.date_creation}</span></div>
            <div><span className="text-muted-foreground">Validité :</span> <span className="font-medium">{devis.date_validite}</span></div>
            <div><span className="text-muted-foreground">Montant total :</span> <span className="font-semibold">{Number(devis.montant_total).toFixed(2)} €</span></div>
          </div>

          {devis.notes && (
            <div className="text-sm">
              <span className="text-muted-foreground">Notes :</span>
              <p className="mt-1">{devis.notes}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Services proposés</h3>
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

export default DevisDetailDialog;
