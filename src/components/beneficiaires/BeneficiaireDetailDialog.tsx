import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users, CalendarOff, FileCheck } from "lucide-react";
import TabInfoGenerales from "./tabs/TabInfoGenerales";
import TabEntourage from "./tabs/TabEntourage";
import TabAbsences from "./tabs/TabAbsences";
import TabPrisesEnCharge from "./tabs/TabPrisesEnCharge";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiaire: Record<string, any> | null;
  onUpdate: (data: Record<string, any>) => void;
}

const BeneficiaireDetailDialog = ({ open, onOpenChange, beneficiaire, onUpdate }: Props) => {
  const [tab, setTab] = useState("general");

  if (!beneficiaire) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {beneficiaire.civilite} {beneficiaire.prenom} {beneficiaire.nom}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="gap-1.5 text-xs">
              <User className="w-3.5 h-3.5" /> Infos générales
            </TabsTrigger>
            <TabsTrigger value="entourage" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" /> Entourage
            </TabsTrigger>
            <TabsTrigger value="absences" className="gap-1.5 text-xs">
              <CalendarOff className="w-3.5 h-3.5" /> Absences
            </TabsTrigger>
            <TabsTrigger value="prises" className="gap-1.5 text-xs">
              <FileCheck className="w-3.5 h-3.5" /> Prise en charge
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4">
            <TabInfoGenerales beneficiaire={beneficiaire} onUpdate={onUpdate} />
          </TabsContent>
          <TabsContent value="entourage" className="mt-4">
            <TabEntourage beneficiaireId={beneficiaire.id} />
          </TabsContent>
          <TabsContent value="absences" className="mt-4">
            <TabAbsences beneficiaireId={beneficiaire.id} />
          </TabsContent>
          <TabsContent value="prises" className="mt-4">
            <TabPrisesEnCharge beneficiaireId={beneficiaire.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BeneficiaireDetailDialog;
