import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, CheckCircle, AlertTriangle } from "lucide-react";

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: "8 caractères minimum" },
  { test: (p: string) => /[A-Z]/.test(p), label: "1 majuscule" },
  { test: (p: string) => /[a-z]/.test(p), label: "1 minuscule" },
  { test: (p: string) => /\d/.test(p), label: "1 chiffre" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: "1 caractère spécial" },
];

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsRecovery(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const allValid = PASSWORD_RULES.every((r) => r.test(password));
    if (!allValid) { setError("Le mot de passe ne respecte pas la politique de sécurité."); return; }
    setSubmitting(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) setError(err.message);
    else { setSuccess(true); setTimeout(() => navigate("/"), 2000); }
    setSubmitting(false);
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Lien de réinitialisation invalide ou expiré.</p>
            <Button className="mt-4" onClick={() => navigate("/auth")}>Retour à la connexion</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle style={{ fontFamily: "DM Sans" }}>Nouveau mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <Alert variant="destructive" className="mb-4"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
          {success && <Alert className="mb-4 border-green-200 bg-green-50"><CheckCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-800">Mot de passe mis à jour ! Redirection...</AlertDescription></Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nouveau mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="password" placeholder="••••••••" className="pl-9" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-1 mt-2">
                {PASSWORD_RULES.map((rule) => (
                  <div key={rule.label} className={`flex items-center gap-2 text-xs ${rule.test(password) ? "text-green-600" : "text-muted-foreground"}`}>
                    <CheckCircle className="h-3 w-3" />
                    {rule.label}
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Mise à jour..." : "Mettre à jour"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
