import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useActesSoins, useServices } from "@/hooks/useSupabaseData";

interface LigneDevis {
  id?: string;
  service: string;
  description: string;
  frequence: string;
  duree_heures: number;
  tarif_horaire: number;
  montant: number;
}

interface DevisFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem: any | null;
  beneficiaires: any[];
}

const emptyLigne = (): LigneDevis => ({
  service: "",
  description: "",
  frequence: "",
  duree_heures: 1,
  tarif_horaire: 0,
  montant: 0,
});

const DevisFormDialog = ({ open, onOpenChange, editItem, beneficiaires }: DevisFormDialogProps) => {
  const queryClient = useQueryClient();
  const { data: servicesData } = useServices();
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");
  const [beneficiaireId, setBeneficiaireId] = useState("");
  const [dateCreation, setDateCreation] = useState(new Date().toISOString().slice(0, 10));
  const [dateValidite, setDateValidite] = useState("");
  const [statut, setStatut] = useState("Brouillon");
  const [notes, setNotes] = useState("");
  const [lignes, setLignes] = useState<LigneDevis[]>([emptyLigne()]);

  // Determine the service type from the selected beneficiary's service
  const selectedBeneficiaire = beneficiaires.find(b => b.id === beneficiaireId);
  const serviceType = useMemo(() => {
    if (!selectedBeneficiaire?.service || !servicesData) return null;
    const svc = servicesData.find(s => s.nom === selectedBeneficiaire.service);
    return svc?.type || null;
  }, [selectedBeneficiaire, servicesData]);

  // Fetch actes/soins filtered by service type
  const { data: actesSoins } = useActesSoins(serviceType || undefined);

  useEffect(() => {
    if (!open) return;
    if (editItem) {
      setCode(editItem.code);
      setBeneficiaireId(editItem.beneficiaire_id || "");
      setDateCreation(editItem.date_creation);
      setDateValidite(editItem.date_validite);
      setStatut(editItem.statut);
      setNotes(editItem.notes || "");
      supabase.from("devis_lignes").select("*").eq("devis_id", editItem.id).order("created_at").then(({ data }) => {
        if (data && data.length > 0) {
          setLignes(data.map(l => ({
            id: l.id,
            service: l.service,
            description: l.description || "",
            frequence: l.frequence || "",
            duree_heures: Number(l.duree_heures),
            tarif_horaire: Number(l.tarif_horaire),
            montant: Number(l.montant),
          })));
        } else {
          setLignes([emptyLigne()]);
        }
      });
    } else {
      setCode(`DEV-${Date.now().toString().slice(-6)}`);
      setBeneficiaireId("");
      setDateCreation(new Date().toISOString().slice(0, 10));
      setDateValidite("");
      setStatut("Brouillon");
      setNotes("");
      setLignes([emptyLigne()]);
    }
  }, [open, editItem]);

  // Reset lignes when beneficiary changes (different service type = different actes)
  const handleBeneficiaireChange = (id: string) => {
    setBeneficiaireId(id);
    if (!editItem) {
      setLignes([emptyLigne()]);
    }
  };

  const updateLigne = (index: number, field: keyof LigneDevis, value: any) => {
    setLignes(prev => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;
      if (field === "duree_heures" || field === "tarif_horaire") {
        updated[index].montant = updated[index].duree_heures * updated[index].tarif_horaire;
      }
      // Auto-fill tarif and description when selecting an acte/soin
      if (field === "service" && actesSoins) {
        const acte = actesSoins.find(a => a.nom === value);
        if (acte) {
          updated[index].tarif_horaire = Number(acte.tarif_defaut);
          updated[index].description = acte.description || "";
          updated[index].montant = updated[index].duree_heures * Number(acte.tarif_defaut);
        }
      }
      return updated;
    });
  };

  const addLigne = () => setLignes(prev => [...prev, emptyLigne()]);
  const removeLigne = (index: number) => setLignes(prev => prev.filter((_, i) => i !== index));

  const montantTotal = lignes.reduce((sum, l) => sum + l.montant, 0);

  const handleSubmit = async () => {
    if (!beneficiaireId || !dateValidite) {
      toast({ title: "Erreur", description: "Bénéficiaire et date de validité requis", variant: "destructive" });
      return;
    }
    setLoading(true);
    const ben = beneficiaires.find(b => b.id === beneficiaireId);
    const payload = {
      code,
      beneficiaire_id: beneficiaireId,
      beneficiaire_nom: ben ? `${ben.nom} ${ben.prenom}` : "",
      date_creation: dateCreation,
      date_validite: dateValidite,
      statut,
      notes: notes || null,
      montant_total: montantTotal,
    };

    let devisId = editItem?.id;

    if (editItem) {
      const { error } = await supabase.from("devis").update(payload as any).eq("id", editItem.id);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); setLoading(false); return; }
      await supabase.from("devis_lignes").delete().eq("devis_id", editItem.id);
    } else {
      const { data, error } = await supabase.from("devis").insert(payload as any).select().single();
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); setLoading(false); return; }
      devisId = data.id;
    }

    if (lignes.length > 0 && lignes.some(l => l.service)) {
      const lignesPayload = lignes.filter(l => l.service).map(l => ({
        devis_id: devisId,
        service: l.service,
        description: l.description || null,
        frequence: l.frequence || null,
        duree_heures: l.duree_heures,
        tarif_horaire: l.tarif_horaire,
        montant: l.montant,
      }));
      await supabase.from("devis_lignes").insert(lignesPayload as any);
    }

    queryClient.invalidateQueries({ queryKey: ["devis"] });
    toast({ title: editItem ? "Devis modifié" : "Devis créé" });
    setLoading(false);
    onOpenChange(false);
  };

  // Group actes/soins by categorie
  const groupedActes = useMemo(() => {
    if (!actesSoins) return {};
    return actesSoins.reduce((acc: Record<string, typeof actesSoins>, item) => {
      const cat = item.categorie || "Autre";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  }, [actesSoins]);

  const serviceTypeLabel = serviceType === "SSIAD" ? "Soins" : serviceType === "SPASAD" ? "Actes & Soins" : "Actes";
  const serviceTypeLabelSingular = serviceType === "SSIAD" ? "Soin" : serviceType === "SPASAD" ? "Acte / Soin" : "Acte";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editItem ? "Modifier le devis" : "Nouveau devis"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>N° Devis</Label>
              <Input value={code} onChange={e => setCode(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Bénéficiaire *</Label>
              <Select value={beneficiaireId} onValueChange={handleBeneficiaireChange}>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {beneficiaires.map(b => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.nom} {b.prenom}
                      {b.service && <span className="text-muted-foreground ml-1">({b.service})</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date de création</Label>
              <Input type="date" value={dateCreation} onChange={e => setDateCreation(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Date de validité *</Label>
              <Input type="date" value={dateValidite} onChange={e => setDateValidite(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Statut</Label>
              <Select value={statut} onValueChange={setStatut}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Brouillon">Brouillon</SelectItem>
                  <SelectItem value="Envoyé">Envoyé</SelectItem>
                  <SelectItem value="Accepté">Accepté</SelectItem>
                  <SelectItem value="Refusé">Refusé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Service type indicator */}
          {serviceType && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Type de service :</span>
              <Badge variant="outline">{serviceType}</Badge>
              <span className="text-sm text-muted-foreground">— {serviceTypeLabel} disponibles</span>
            </div>
          )}

          {/* Lignes de devis */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">{serviceTypeLabel} proposé(e)s</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLigne} disabled={!beneficiaireId}>
                <Plus className="w-4 h-4 mr-1" />Ajouter
              </Button>
            </div>

            {!beneficiaireId && (
              <p className="text-sm text-muted-foreground italic">Sélectionnez un bénéficiaire pour voir les {serviceTypeLabel.toLowerCase()} disponibles.</p>
            )}

            {beneficiaireId && lignes.map((ligne, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-3 bg-muted/30">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{serviceTypeLabelSingular}</Label>
                    <Select value={ligne.service} onValueChange={v => updateLigne(i, "service", v)}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(groupedActes).map(([cat, items]) => (
                          <div key={cat}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b mb-1">{cat}</div>
                            {items.map(a => (
                              <SelectItem key={a.id} value={a.nom}>
                                <span>{a.nom}</span>
                                {a.tarif_defaut > 0 && <span className="ml-2 text-muted-foreground text-xs">{Number(a.tarif_defaut).toFixed(2)} €/h</span>}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                        {(!actesSoins || actesSoins.length === 0) && (
                          <div className="px-2 py-2 text-sm text-muted-foreground">Aucun acte/soin configuré pour ce type de service</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Fréquence</Label>
                    <Input value={ligne.frequence} onChange={e => updateLigne(i, "frequence", e.target.value)} placeholder="Ex: 3x/semaine" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Durée (h)</Label>
                    <Input type="number" step="0.5" min="0" value={ligne.duree_heures} onChange={e => updateLigne(i, "duree_heures", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tarif horaire (€)</Label>
                    <Input type="number" step="0.01" min="0" value={ligne.tarif_horaire} onChange={e => updateLigne(i, "tarif_horaire", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Montant (€)</Label>
                    <Input value={ligne.montant.toFixed(2)} disabled className="bg-muted" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Input value={ligne.description} onChange={e => updateLigne(i, "description", e.target.value)} placeholder="Description optionnelle" />
                </div>
                {lignes.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removeLigne(i)}>
                    <Trash2 className="w-3 h-3 mr-1" />Retirer
                  </Button>
                )}
              </div>
            ))}
            {beneficiaireId && (
              <div className="text-right text-lg font-semibold">
                Total : {montantTotal.toFixed(2)} €
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes internes..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DevisFormDialog;
