import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import DeleteDialog from "@/components/crud/DeleteDialog";

const MOTIFS = ["Hospitalisation", "Vacances", "Autre"];

interface Props {
  beneficiaireId: string;
}

const emptyForm = { date_debut: "", date_fin: "", motif: "Autre", commentaire: "" };

const TabAbsences = ({ beneficiaireId }: Props) => {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: absences = [], isLoading } = useQuery({
    queryKey: ["beneficiaire_absences", beneficiaireId],
    queryFn: async () => {
      const { data, error } = await supabase.from("beneficiaire_absences" as any).select("*").eq("beneficiaire_id", beneficiaireId).order("date_debut", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (row: any) => {
      if (editItem) {
        const { error } = await supabase.from("beneficiaire_absences" as any).update(row).eq("id", editItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("beneficiaire_absences" as any).insert({ ...row, beneficiaire_id: beneficiaireId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["beneficiaire_absences", beneficiaireId] });
      toast({ title: editItem ? "Absence modifiée" : "Absence ajoutée" });
      setFormOpen(false);
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("beneficiaire_absences" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["beneficiaire_absences", beneficiaireId] });
      toast({ title: "Absence supprimée" });
      setDeleteId(null);
    },
  });

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({ date_debut: item.date_debut, date_fin: item.date_fin, motif: item.motif, commentaire: item.commentaire || "" });
    setFormOpen(true);
  };

  const handleSubmit = () => {
    if (!form.date_debut || !form.date_fin) { toast({ title: "Dates requises", variant: "destructive" }); return; }
    saveMutation.mutate(form);
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("fr-FR") : "-";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{absences.length} absence(s)</p>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" />Ajouter</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-4">Chargement...</p>
      ) : absences.length === 0 ? (
        <p className="text-muted-foreground text-center py-8 text-sm">Aucune absence enregistrée</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Début</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Motif</TableHead>
              <TableHead>Commentaire</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {absences.map((a: any) => (
              <TableRow key={a.id}>
                <TableCell>{fmtDate(a.date_debut)}</TableCell>
                <TableCell>{fmtDate(a.date_fin)}</TableCell>
                <TableCell>{a.motif}</TableCell>
                <TableCell className="text-muted-foreground text-xs max-w-[200px] truncate">{a.commentaire || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(a)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Modifier l'absence" : "Nouvelle absence"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Date début *</Label>
              <Input type="date" value={form.date_debut} onChange={e => setForm(f => ({ ...f, date_debut: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date fin *</Label>
              <Input type="date" value={form.date_fin} onChange={e => setForm(f => ({ ...f, date_fin: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Motif</Label>
              <Select value={form.motif} onValueChange={v => setForm(f => ({ ...f, motif: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MOTIFS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Commentaire</Label>
              <Textarea value={form.commentaire} onChange={e => setForm(f => ({ ...f, commentaire: e.target.value }))} rows={2} />
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

export default TabAbsences;
