import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Plus, X, Users } from "lucide-react";

const ALL_ROLES = [
  { value: "admin", label: "Administrateur" },
  { value: "responsable_service", label: "Responsable de service" },
  { value: "responsable_secteur", label: "Responsable de secteur" },
  { value: "coordinateur", label: "Coordinateur" },
  { value: "comptable", label: "Comptable" },
  { value: "rh", label: "RH" },
  { value: "intervenant", label: "Intervenant" },
] as const;

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  display_name: string | null;
  roles: string[];
}

const roleLabelMap = Object.fromEntries(ALL_ROLES.map((r) => [r.value, r.label]));

const roleColorMap: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  responsable_service: "bg-primary/10 text-primary border-primary/20",
  responsable_secteur: "bg-accent/80 text-accent-foreground border-accent",
  coordinateur: "bg-secondary text-secondary-foreground border-secondary",
  comptable: "bg-muted text-muted-foreground border-border",
  rh: "bg-primary/10 text-primary border-primary/20",
  intervenant: "bg-muted text-muted-foreground border-border",
};

const AdminUsers = () => {
  const { hasRole } = useAuth();
  const qc = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({});

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?action=list`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? "Erreur");
      }
      return response.json();
    },
    enabled: hasRole("admin"),
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?action=add-role`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id, role }),
        }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? "Erreur");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Rôle ajouté avec succès" });
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?action=remove-role`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id, role }),
        }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? "Erreur");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Rôle retiré avec succès" });
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  if (!hasRole("admin")) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-semibold">Accès refusé</h2>
            <p className="text-muted-foreground mt-2">Cette page est réservée aux administrateurs.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground text-sm">Assignez les rôles aux comptes utilisateurs</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Utilisateurs ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Chargement...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Rôles</TableHead>
                  <TableHead>Ajouter un rôle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const availableRoles = ALL_ROLES.filter((r) => !u.roles.includes(r.value));
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.display_name ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.email_confirmed_at ? "default" : "secondary"}>
                          {u.email_confirmed_at ? "Confirmé" : "En attente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {u.roles.length === 0 && <span className="text-muted-foreground text-xs">Aucun rôle</span>}
                          {u.roles.map((role) => (
                            <Badge key={role} variant="outline" className={`gap-1 ${roleColorMap[role] ?? ""}`}>
                              {roleLabelMap[role] ?? role}
                              <button
                                onClick={() => removeRoleMutation.mutate({ user_id: u.id, role })}
                                className="ml-0.5 hover:text-destructive transition-colors"
                                title="Retirer ce rôle"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {availableRoles.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Select
                              value={selectedRole[u.id] ?? ""}
                              onValueChange={(v) => setSelectedRole((prev) => ({ ...prev, [u.id]: v }))}
                            >
                              <SelectTrigger className="w-[200px] h-8 text-xs">
                                <SelectValue placeholder="Sélectionner..." />
                              </SelectTrigger>
                              <SelectContent>
                                {availableRoles.map((r) => (
                                  <SelectItem key={r.value} value={r.value}>
                                    {r.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              disabled={!selectedRole[u.id]}
                              onClick={() => {
                                if (selectedRole[u.id]) {
                                  addRoleMutation.mutate({ user_id: u.id, role: selectedRole[u.id] });
                                  setSelectedRole((prev) => {
                                    const next = { ...prev };
                                    delete next[u.id];
                                    return next;
                                  });
                                }
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Ajouter
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
