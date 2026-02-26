import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FieldConfig {
  name: string;
  label: string;
  type?: "text" | "date" | "select" | "tel";
  required?: boolean;
  options?: { label: string; value: string }[];
  /** Dynamic options based on current form values (takes priority over options) */
  getOptions?: (values: Record<string, string>) => { label: string; value: string }[];
  placeholder?: string;
}

interface EntityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: FieldConfig[];
  defaultValues?: Record<string, string>;
  onSubmit: (data: Record<string, string>) => void;
  loading?: boolean;
}

const EntityFormDialog = ({
  open,
  onOpenChange,
  title,
  fields,
  defaultValues,
  onSubmit,
  loading,
}: EntityFormDialogProps) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Record<string, string>>({
    defaultValues: defaultValues ?? {},
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues ?? {});
    }
  }, [open, defaultValues, reset]);

  const handleFormSubmit = (data: Record<string, string>) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {fields.map((field) => {
            const currentValues = watch();
            const fieldOptions = field.getOptions ? field.getOptions(currentValues) : field.options;
            return (
              <div key={field.name} className="space-y-1.5">
                <Label htmlFor={field.name}>{field.label}{field.required && " *"}</Label>
                {field.type === "select" ? (
                  <Select
                    value={watch(field.name) || ""}
                    onValueChange={(v) => setValue(field.name, v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder || `Sélectionner...`} />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldOptions?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.name}
                    type={field.type === "tel" ? "tel" : field.type === "date" ? "date" : "text"}
                    placeholder={field.placeholder}
                    {...register(field.name, { required: field.required ? "Champ requis" : false })}
                  />
                )}
                {errors[field.name] && (
                  <p className="text-xs text-destructive">{errors[field.name]?.message as string}</p>
                )}
              </div>
            );
          })}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EntityFormDialog;
