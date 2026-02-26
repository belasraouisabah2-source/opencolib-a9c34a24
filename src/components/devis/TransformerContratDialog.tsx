import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface TransformerContratDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devis: any | null;
  prisesEnCharge: any[];
}

const TransformerContratDialog = ({ open, onOpenChange, devis, prisesEnCharge }: TransformerContratDialogProps) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [dateSignature, setDateSignature] = useState(new Date().toISOString().slice(0, 10));
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [modalitesPaiement, setModalitesPaiement] = useState("Prélèvement automatique");
  const [clauses, setClauses] = useState("");
  const [priseEnChargeId, setPriseEnChargeId] = useState("");

  useEffect(() => {
    if (open && devis) {
      setDateSignature(new Date().toISOString().slice(0, 10));
      setDateDebut("");
      setDateFin("");
      setModalitesPaiement("Prélèvement automatique");
      setClauses("");
      setPriseEnChargeId("");
    }
  }, [open, devis]);

  const today = new Date().toISOString().slice(0, 10);
  const filteredPEC = prisesEnCharge.filter(p =>
    p.beneficiaire_id === devis?.beneficiaire_id &&
    p.date_debut <= today &&
    (!p.date_fin || p.date_fin >= today)
  );

  const handleSubmit = async () => {
    if (!dateDebut) {
      toast({ title: "Erreur", description: "La date de début est requise", variant: "destructive" });
      return;
    }
    setLoading(true);

    const code = `CTR-${Date.now().toString().slice(-6)}`;

    // Create contrat
    const { data: contrat, error } = await supabase.from("contrats").insert({
      code,
      devis_id: devis.id,
      beneficiaire_id: devis.beneficiaire_id,
      beneficiaire_nom: devis.beneficiaire_nom,
      montant_total: devis.montant_total,
      date_signature: dateSignature,
      date_debut: dateDebut,
      date_fin: dateFin || null,
      modalites_paiement: modalitesPaiement || null,
      clauses: clauses || null,
      prise_en_charge_id: priseEnChargeId || null,
      notes: devis.notes,
    } as any).select().single();

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Copy devis lines to contrat lines
    const { data: lignes } = await supabase.from("devis_lignes").select("*").eq("devis_id", devis.id);
    if (lignes && lignes.length > 0) {
      const contratLignes = lignes.map(l => ({
        contrat_id: contrat.id,
        service: l.service,
        description: l.description,
        frequence: l.frequence,
        duree_heures: l.duree_heures,
        tarif_horaire: l.tarif_horaire,
        montant: l.montant,
      }));
      await supabase.from("contrat_lignes").insert(contratLignes as any);
    }

    // Update devis status to reflect transformation
    await supabase.from("devis").update({ statut: "Accepté" } as any).eq("id", devis.id);

    queryClient.invalidateQueries({ queryKey: ["contrats"] });
    queryClient.invalidateQueries({ queryKey: ["devis"] });
    toast({ title: "Contrat créé", description: `Le contrat ${code} a été créé à partir du devis ${devis.code}` });
    setLoading(false);
    onOpenChange(false);
  };

  if (!devis) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Transformer en contrat</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Créer un contrat à partir du devis <span className="font-mono font-medium">{devis.code}</span> pour <span className="font-medium">{devis.beneficiaire_nom}</span> ({Number(devis.montant_total).toFixed(2)} €)
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date de signature *</Label>
              <Input type="date" value={dateSignature} onChange={e => setDateSignature(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Date de début *</Label>
              <Input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Date de fin</Label>
              <Input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Modalités de paiement</Label>
              <Select value={modalitesPaiement} onValueChange={setModalitesPaiement}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prélèvement automatique">Prélèvement automatique</SelectItem>
                  <SelectItem value="Virement">Virement</SelectItem>
                  <SelectItem value="Chèque">Chèque</SelectItem>
                  <SelectItem value="CESU">CESU</SelectItem>
                  <SelectItem value="Espèces">Espèces</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Prise en charge associée</Label>
            <Select value={priseEnChargeId} onValueChange={setPriseEnChargeId}>
              <SelectTrigger><SelectValue placeholder="Aucune (optionnel)" /></SelectTrigger>
              <SelectContent>
                {filteredPEC.length === 0 ? (
                  <div className="px-2 py-2 text-sm text-muted-foreground">Aucune prise en charge pour ce bénéficiaire</div>
                ) : filteredPEC.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.organisme || "PEC"} — {p.date_debut} → {p.date_fin || "..."} ({p.nb_heures}h)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Clauses spécifiques</Label>
            <Textarea value={clauses} onChange={e => setClauses(e.target.value)} placeholder="Conditions particulières, clauses de résiliation..." rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Création..." : "Créer le contrat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransformerContratDialog;
