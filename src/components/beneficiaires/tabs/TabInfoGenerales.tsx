import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";

interface Props {
  beneficiaire: Record<string, any>;
  onUpdate: (data: Record<string, any>) => void;
}

const GIR_OPTIONS = ["GIR 1", "GIR 2", "GIR 3", "GIR 4", "GIR 5", "GIR 6"];
const SITUATION_OPTIONS = ["Célibataire", "Marié(e)", "Pacsé(e)", "Veuf/Veuve", "Divorcé(e)"];

const TabInfoGenerales = ({ beneficiaire, onUpdate }: Props) => {
  const [form, setForm] = useState({
    numero_ss: beneficiaire.numero_ss || "",
    situation_familiale: beneficiaire.situation_familiale || "",
    medecin_traitant: beneficiaire.medecin_traitant || "",
    allergies: beneficiaire.allergies || "",
    pathologies: beneficiaire.pathologies || "",
    gir: beneficiaire.gir || "",
  });

  const handleSave = () => {
    onUpdate({ id: beneficiaire.id, ...form });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">État civil</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Numéro de sécurité sociale</Label>
            <Input value={form.numero_ss} onChange={e => setForm(f => ({ ...f, numero_ss: e.target.value }))} placeholder="1 XX XX XX XXX XXX XX" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Situation familiale</Label>
            <Select value={form.situation_familiale} onValueChange={v => setForm(f => ({ ...f, situation_familiale: v }))}>
              <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
              <SelectContent>
                {SITUATION_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Informations médicales</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Médecin traitant</Label>
            <Input value={form.medecin_traitant} onChange={e => setForm(f => ({ ...f, medecin_traitant: e.target.value }))} placeholder="Dr. ..." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Degré d'autonomie (GIR)</Label>
            <Select value={form.gir} onValueChange={v => setForm(f => ({ ...f, gir: v }))}>
              <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
              <SelectContent>
                {GIR_OPTIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Allergies</Label>
            <Input value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} placeholder="Aucune connue" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Pathologies</Label>
            <Input value={form.pathologies} onChange={e => setForm(f => ({ ...f, pathologies: e.target.value }))} placeholder="Aucune connue" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="sm" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" /> Sauvegarder
        </Button>
      </div>
    </div>
  );
};

export default TabInfoGenerales;
