import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface FactureDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facture: any | null;
  contrats: any[];
}

const statusClass = (s: string) => {
  if (s === "Payée") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (s === "En attente") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  if (s === "Impayée") return "bg-destructive/10 text-destructive";
  return "";
};

const FactureDetailDialog = ({ open, onOpenChange, facture, contrats }: FactureDetailDialogProps) => {
  if (!facture) return null;

  const linkedContrat = contrats.find(c => c.id === facture.contrat_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Facture {facture.code}
            <Badge className={statusClass(facture.statut)}>{facture.statut}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Bénéficiaire :</span> <span className="font-medium">{facture.beneficiaire}</span></div>
            <div><span className="text-muted-foreground">Période :</span> <span className="font-medium">{facture.periode}</span></div>
            <div><span className="text-muted-foreground">Date d'émission :</span> <span className="font-medium">{facture.date_emission || "—"}</span></div>
            <div><span className="text-muted-foreground">Date d'échéance :</span> <span className="font-medium">{facture.date_echeance || "—"}</span></div>
          </div>

          {linkedContrat && (
            <div className="p-3 rounded-lg bg-muted/50 border text-sm">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Contrat lié : {linkedContrat.code}</span>
              </div>
              <div className="text-muted-foreground">
                {linkedContrat.beneficiaire_nom} — {linkedContrat.date_debut} → {linkedContrat.date_fin || "indéterminée"}
                {linkedContrat.devis_id && <span className="ml-2">(issu d'un devis)</span>}
              </div>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 text-sm">
              <div className="p-3 border-b border-r">
                <div className="text-muted-foreground text-xs">Montant HT</div>
                <div className="font-medium mt-0.5">{Number(facture.montant_ht).toFixed(2)} €</div>
              </div>
              <div className="p-3 border-b border-r">
                <div className="text-muted-foreground text-xs">TVA</div>
                <div className="font-medium mt-0.5">{Number(facture.tva).toFixed(2)} €</div>
              </div>
              <div className="p-3 border-b">
                <div className="text-muted-foreground text-xs">Total TTC</div>
                <div className="font-semibold mt-0.5">{Number(facture.montant_ttc).toFixed(2)} €</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FactureDetailDialog;
