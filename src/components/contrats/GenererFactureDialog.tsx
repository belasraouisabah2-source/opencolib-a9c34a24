import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Calculator, Clock, AlertTriangle } from "lucide-react";

interface GenererFactureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrat: any | null;
}

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h + (m || 0) / 60;
}

function calcHours(debut: string, fin: string, debutReel: string | null, finReelle: string | null): number {
  const start = debutReel ? parseTime(debutReel) : parseTime(debut);
  const end = finReelle ? parseTime(finReelle) : parseTime(fin);
  return Math.max(0, end - start);
}

const GenererFactureDialog = ({ open, onOpenChange, contrat }: GenererFactureDialogProps) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");
  const [mois, setMois] = useState(String(new Date().getMonth()));
  const [annee, setAnnee] = useState(String(new Date().getFullYear()));
  const [dateEmission, setDateEmission] = useState(new Date().toISOString().slice(0, 10));
  const [dateEcheance, setDateEcheance] = useState("");
  const [montantHt, setMontantHt] = useState("0");
  const [tva, setTva] = useState("0");
  const [montantTtc, setMontantTtc] = useState("0");
  const [statut, setStatut] = useState("En attente");

  // Calculated data
  const [totalHeures, setTotalHeures] = useState(0);
  const [nbInterventions, setNbInterventions] = useState(0);
  const [tarifMoyen, setTarifMoyen] = useState(0);
  const [calcLoading, setCalcLoading] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  useEffect(() => {
    if (open && contrat) {
      setCode(`FAC-${Date.now().toString().slice(-6)}`);
      const now = new Date();
      setMois(String(now.getMonth()));
      setAnnee(String(now.getFullYear()));
      setDateEmission(now.toISOString().slice(0, 10));
      setDateEcheance("");
      setMontantHt("0");
      setTva("0");
      setMontantTtc("0");
      setStatut("En attente");
      setTotalHeures(0);
      setNbInterventions(0);
      setTarifMoyen(0);
      setHasCalculated(false);
    }
  }, [open, contrat]);

  // Auto-calc TTC
  useEffect(() => {
    const ht = parseFloat(montantHt) || 0;
    const t = parseFloat(tva) || 0;
    setMontantTtc((ht + t).toFixed(2));
  }, [montantHt, tva]);

  const calculerMontant = useCallback(async () => {
    if (!contrat) return;
    setCalcLoading(true);

    const moisNum = parseInt(mois);
    const anneeNum = parseInt(annee);
    const dateDebut = `${anneeNum}-${String(moisNum + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(anneeNum, moisNum + 1, 0).getDate();
    const dateFin = `${anneeNum}-${String(moisNum + 1).padStart(2, "0")}-${lastDay}`;

    // Fetch completed planning events for this beneficiary in the period
    // Use broader filter then normalize names client-side to handle "DUPONT Marie" vs "Marie DUPONT"
    const { data: allEvents, error: evtError } = await supabase
      .from("planning_events")
      .select("*")
      .eq("statut", "Terminée")
      .gte("date", dateDebut)
      .lte("date", dateFin);

    const normalizeName = (s: string) => s.trim().toLowerCase().split(/\s+/).sort().join(" ");
    const benefKey = normalizeName(contrat.beneficiaire_nom);
    const events = (allEvents ?? []).filter(e => normalizeName(e.beneficiaire) === benefKey);

    if (evtError) {
      toast({ title: "Erreur", description: evtError.message, variant: "destructive" });
      setCalcLoading(false);
      return;
    }

    // Fetch contract line tariffs
    const { data: lignes } = await supabase
      .from("contrat_lignes")
      .select("tarif_horaire, duree_heures")
      .eq("contrat_id", contrat.id);

    // Calculate average tariff from contract lines
    let avgTarif = 0;
    if (lignes && lignes.length > 0) {
      const totalDuree = lignes.reduce((s, l) => s + Number(l.duree_heures), 0);
      const totalMontant = lignes.reduce((s, l) => s + Number(l.duree_heures) * Number(l.tarif_horaire), 0);
      avgTarif = totalDuree > 0 ? totalMontant / totalDuree : Number(lignes[0].tarif_horaire);
    }

    // Calculate total real hours
    const heures = (events ?? []).reduce((sum, e) => {
      return sum + calcHours(e.debut, e.fin, e.debut_reel, e.fin_reelle);
    }, 0);

    const ht = Math.round(heures * avgTarif * 100) / 100;

    setTotalHeures(Math.round(heures * 100) / 100);
    setNbInterventions((events ?? []).length);
    setTarifMoyen(Math.round(avgTarif * 100) / 100);
    setMontantHt(ht.toFixed(2));
    setHasCalculated(true);
    setCalcLoading(false);
  }, [contrat, mois, annee]);

  const periode = `${MONTHS[parseInt(mois)]} ${annee}`;

  const handleSubmit = async () => {
    if (!code) {
      toast({ title: "Erreur", description: "Le numéro de facture est requis", variant: "destructive" });
      return;
    }
    if (!hasCalculated) {
      toast({ title: "Attention", description: "Veuillez d'abord calculer le montant", variant: "destructive" });
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
      toast({ title: "Facture créée", description: `La facture ${code} a été créée pour ${periode}` });
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
          Contrat <span className="font-mono font-medium">{contrat.code}</span> — <span className="font-medium">{contrat.beneficiaire_nom}</span>
        </p>

        <div className="space-y-4">
          {/* Period selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Mois</Label>
              <Select value={mois} onValueChange={(v) => { setMois(v); setHasCalculated(false); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i} value={String(i)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Année</Label>
              <Select value={annee} onValueChange={(v) => { setAnnee(v); setHasCalculated(false); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2025, 2026, 2027].map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calculate button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={calculerMontant}
            disabled={calcLoading}
          >
            <Calculator className="w-4 h-4 mr-2" />
            {calcLoading ? "Calcul en cours..." : "Calculer depuis le planning"}
          </Button>

          {/* Calculation results */}
          {hasCalculated && (
            <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Résultat du calcul — {periode}
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Interventions</div>
                  <div className="font-semibold">{nbInterventions}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Heures réelles</div>
                  <div className="font-semibold">{totalHeures}h</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Tarif moyen/h</div>
                  <div className="font-semibold">{tarifMoyen.toFixed(2)} €</div>
                </div>
              </div>
              {nbInterventions === 0 && (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Aucune intervention terminée pour cette période</span>
                </div>
              )}
            </div>
          )}

          {/* Invoice details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>N° Facture *</Label>
              <Input value={code} onChange={e => setCode(e.target.value)} />
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

          <div className="grid grid-cols-3 gap-4">
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
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading || !hasCalculated}>
            {loading ? "Création..." : "Créer la facture"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenererFactureDialog;
