import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface GenererFactureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrat: any | null;
}

const GenererFactureDialog = ({ open, onOpenChange, contrat }: GenererFactureDialogProps) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");
  const [periode, setPeriode] = useState("");
  const [dateEmission, setDateEmission] = useState(new Date().toISOString().slice(0, 10));
  const [dateEcheance, setDateEcheance] = useState("");
  const [montantHt, setMontantHt] = useState("");
  const [tva, setTva] = useState("0");
  const [montantTtc, setMontantTtc] = useState("");
  const [statut, setStatut] = useState("En attente");

  useEffect(() => {
    if (open && contrat) {
      setCode(`FAC-${Date.now().toString().slice(-6)}`);
      const now = new Date();
      setPeriode(`${now.toLocaleString("fr-FR", { month: "long" })} ${now.getFullYear()}`);
      setDateEmission(now.toISOString().slice(0, 10));
      setDateEcheance("");
      setMontantHt(String(contrat.montant_total || 0));
      setTva("0");
      setMontantTtc(String(contrat.montant_total || 0));
      setStatut("En attente");
    }
  }, [open, contrat]);

  // Auto-calc TTC
  useEffect(() => {
    const ht = parseFloat(montantHt) || 0;
    const t = parseFloat(tva) || 0;
    setMontantTtc((ht + t).toFixed(2));
  }, [montantHt, tva]);

  const handleSubmit = async () => {
    if (!code || !periode) {
      toast({ title: "Erreur", description: "Le code et la période sont requis", variant: "destructive" });
      return;
    }
    setLoading(true);

    const { error } = await supabase.from("factures").insert({
      code,
      beneficiaire: contrat.beneficiaire_nom,
      beneficiaire_id: contrat.beneficiaire_id,
      contrat_id: contrat.id,
      devis_id: contrat.devis_id,
      periode,
      date_emission: dateEmission,
      date_echeance: dateEcheance || null,
      montant_ht: parseFloat(montantHt) || 0,
      tva: parseFloat(tva) || 0,
      montant_ttc: parseFloat(montantTtc) || 0,
      statut,
    } as any);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["factures"] });
      toast({ title: "Facture créée", description: `La facture ${code} a été créée pour le contrat ${contrat.code}` });
      onOpenChange(false);
    }
    setLoading(false);
  };

  if (!contrat) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Générer une facture</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Créer une facture à partir du contrat <span className="font-mono font-medium">{contrat.code}</span> pour <span className="font-medium">{contrat.beneficiaire_nom}</span>
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>N° Facture *</Label>
              <Input value={code} onChange={e => setCode(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Période *</Label>
              <Input value={periode} onChange={e => setPeriode(e.target.value)} placeholder="Mars 2026" />
            </div>
            <div className="space-y-1.5">
              <Label>Date d'émission</Label>
              <Input type="date" value={dateEmission} onChange={e => setDateEmission(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Date d'échéance</Label>
              <Input type="date" value={dateEcheance} onChange={e => setDateEcheance(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Montant HT (€)</Label>
              <Input value={montantHt} onChange={e => setMontantHt(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>TVA (€)</Label>
              <Input value={tva} onChange={e => setTva(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Total TTC (€)</Label>
              <Input value={montantTtc} readOnly className="bg-muted" />
            </div>
            <div className="space-y-1.5">
              <Label>Statut</Label>
              <Select value={statut} onValueChange={setStatut}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="Payée">Payée</SelectItem>
                  <SelectItem value="Impayée">Impayée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Création..." : "Créer la facture"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenererFactureDialog;
