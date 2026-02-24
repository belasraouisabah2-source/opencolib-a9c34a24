import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Phone, Mail, AlertTriangle, Heart } from "lucide-react";
import DeleteDialog from "@/components/crud/DeleteDialog";

const LIENS = ["Conjoint(e)", "Enfant", "Parent", "Frère/Sœur", "Ami(e)", "Voisin(e)", "Autre"];

interface Props {
  beneficiaireId: string;
}

const emptyForm = {
  nom: "", prenom: "", lien_parente: "", telephone_fixe: "", telephone_mobile: "",
  email: "", adresse: "", personne_urgence: false, personne_confiance: false,
};

const TabEntourage = ({ beneficiaireId }: Props) => {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: entourage = [], isLoading } = useQuery({
    queryKey: ["beneficiaire_entourage", beneficiaireId],
    queryFn: async () => {
      const { data, error } = await supabase.from("beneficiaire_entourage" as any).select("*").eq("beneficiaire_id", beneficiaireId).order("nom");
      if (error) throw error;
      return data as any[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (row: any) => {
      if (editItem) {
        const { error } = await supabase.from("beneficiaire_entourage" as any).update(row).eq("id", editItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("beneficiaire_entourage" as any).insert({ ...row, beneficiaire_id: beneficiaireId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["beneficiaire_entourage", beneficiaireId] });
      toast({ title: editItem ? "Contact modifié" : "Contact ajouté" });
      setFormOpen(false);
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("beneficiaire_entourage" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["beneficiaire_entourage", beneficiaireId] });
      toast({ title: "Contact supprimé" });
      setDeleteId(null);
    },
  });

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      nom: item.nom, prenom: item.prenom, lien_parente: item.lien_parente || "",
      telephone_fixe: item.telephone_fixe || "", telephone_mobile: item.telephone_mobile || "",
      email: item.email || "", adresse: item.adresse || "",
      personne_urgence: item.personne_urgence, personne_confiance: item.personne_confiance,
    });
    setFormOpen(true);
  };

  const handleSubmit = () => {
    if (!form.nom || !form.prenom) { toast({ title: "Nom et prénom requis", variant: "destructive" }); return; }
    saveMutation.mutate(form);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{entourage.length} contact(s)</p>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" />Ajouter</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-4">Chargement...</p>
      ) : entourage.length === 0 ? (
        <p className="text-muted-foreground text-center py-8 text-sm">Aucun contact enregistré</p>
      ) : (
        <div className="space-y-3">
          {entourage.map((c: any) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{c.prenom} {c.nom}</p>
                    <p className="text-xs text-muted-foreground">{c.lien_parente}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      {c.telephone_mobile && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.telephone_mobile}</span>}
                      {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                    </div>
                    <div className="flex gap-3 mt-2">
                      {c.personne_urgence && <span className="flex items-center gap-1 text-xs text-destructive"><AlertTriangle className="w-3 h-3" />Urgence</span>}
                      {c.personne_confiance && <span className="flex items-center gap-1 text-xs text-primary"><Heart className="w-3 h-3" />Confiance</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editItem ? "Modifier le contact" : "Nouveau contact"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Nom *</Label>
              <Input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Prénom *</Label>
              <Input value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Lien de parenté</Label>
              <Select value={form.lien_parente} onValueChange={v => setForm(f => ({ ...f, lien_parente: v }))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>{LIENS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tél. fixe</Label>
              <Input value={form.telephone_fixe} onChange={e => setForm(f => ({ ...f, telephone_fixe: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tél. mobile</Label>
              <Input value={form.telephone_mobile} onChange={e => setForm(f => ({ ...f, telephone_mobile: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Adresse</Label>
              <Input value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.personne_urgence} onCheckedChange={v => setForm(f => ({ ...f, personne_urgence: !!v }))} />
              <Label className="text-xs">Personne à prévenir en cas d'urgence</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.personne_confiance} onCheckedChange={v => setForm(f => ({ ...f, personne_confiance: !!v }))} />
              <Label className="text-xs">Personne de confiance</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} />
    </div>
  );
};

export default TabEntourage;
