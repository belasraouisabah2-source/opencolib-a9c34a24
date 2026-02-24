import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import DeleteDialog from "@/components/crud/DeleteDialog";

interface Props {
  beneficiaireId: string;
}

const emptyForm = {
  date_debut: "", date_fin: "", service: "", organisme: "",
  nb_heures: "0", nb_heures_restant: "0", heures_normales: "0", heures_dimanches_feries: "0",
};

const TabPrisesEnCharge = ({ beneficiaireId }: Props) => {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: prises = [], isLoading } = useQuery({
    queryKey: ["beneficiaire_prises_en_charge", beneficiaireId],
    queryFn: async () => {
      const { data, error } = await supabase.from("beneficiaire_prises_en_charge" as any).select("*").eq("beneficiaire_id", beneficiaireId).order("date_debut", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (row: any) => {
      const payload = {
        ...row,
        nb_heures: Number(row.nb_heures),
        nb_heures_restant: Number(row.nb_heures_restant),
        heures_normales: Number(row.heures_normales),
        heures_dimanches_feries: Number(row.heures_dimanches_feries),
      };
      if (editItem) {
        const { error } = await supabase.from("beneficiaire_prises_en_charge" as any).update(payload).eq("id", editItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("beneficiaire_prises_en_charge" as any).insert({ ...payload, beneficiaire_id: beneficiaireId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["beneficiaire_prises_en_charge", beneficiaireId] });
      toast({ title: editItem ? "Prise en charge modifiée" : "Prise en charge ajoutée" });
      setFormOpen(false);
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("beneficiaire_prises_en_charge" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["beneficiaire_prises_en_charge", beneficiaireId] });
      toast({ title: "Prise en charge supprimée" });
      setDeleteId(null);
    },
  });

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      date_debut: item.date_debut || "", date_fin: item.date_fin || "",
      service: item.service || "", organisme: item.organisme || "",
      nb_heures: String(item.nb_heures), nb_heures_restant: String(item.nb_heures_restant),
      heures_normales: String(item.heures_normales), heures_dimanches_feries: String(item.heures_dimanches_feries),
    });
    setFormOpen(true);
  };

  const handleSubmit = () => {
    if (!form.date_debut) { toast({ title: "Date début requise", variant: "destructive" }); return; }
    saveMutation.mutate(form);
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("fr-FR") : "-";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{prises.length} prise(s) en charge</p>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" />Ajouter</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-4">Chargement...</p>
      ) : prises.length === 0 ? (
        <p className="text-muted-foreground text-center py-8 text-sm">Aucune prise en charge</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Début</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Organisme</TableHead>
              <TableHead className="text-right">Heures</TableHead>
              <TableHead className="text-right">Restant</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prises.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell>{fmtDate(p.date_debut)}</TableCell>
                <TableCell>{fmtDate(p.date_fin)}</TableCell>
                <TableCell>{p.service || "-"}</TableCell>
                <TableCell className="text-muted-foreground">{p.organisme || "-"}</TableCell>
                <TableCell className="text-right font-medium">{p.nb_heures}h</TableCell>
                <TableCell className="text-right font-medium">{p.nb_heures_restant}h</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editItem ? "Modifier la prise en charge" : "Nouvelle prise en charge"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Date début *</Label>
              <Input type="date" value={form.date_debut} onChange={e => setForm(f => ({ ...f, date_debut: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date fin</Label>
              <Input type="date" value={form.date_fin} onChange={e => setForm(f => ({ ...f, date_fin: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Service</Label>
              <Input value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))} placeholder="Aide ménagère, etc." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Organisme</Label>
              <Input value={form.organisme} onChange={e => setForm(f => ({ ...f, organisme: e.target.value }))} placeholder="Assurance, CPAM..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nb heures total</Label>
              <Input type="number" value={form.nb_heures} onChange={e => setForm(f => ({ ...f, nb_heures: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nb heures restant</Label>
              <Input type="number" value={form.nb_heures_restant} onChange={e => setForm(f => ({ ...f, nb_heures_restant: e.target.value }))} />
            </div>
          </div>

          <Card className="mt-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">Gestion des heures</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Heures normales</Label>
                <Input type="number" value={form.heures_normales} onChange={e => setForm(f => ({ ...f, heures_normales: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Heures dim. & jours fériés</Label>
                <Input type="number" value={form.heures_dimanches_feries} onChange={e => setForm(f => ({ ...f, heures_dimanches_feries: e.target.value }))} />
              </div>
            </CardContent>
          </Card>

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

export default TabPrisesEnCharge;
