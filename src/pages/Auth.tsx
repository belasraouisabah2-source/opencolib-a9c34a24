import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Mail, User, AlertTriangle, CheckCircle } from "lucide-react";

const MAX_LOGIN_ATTEMPTS = 5;

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: "8 caractères minimum" },
  { test: (p: string) => /[A-Z]/.test(p), label: "1 majuscule" },
  { test: (p: string) => /[a-z]/.test(p), label: "1 minuscule" },
  { test: (p: string) => /\d/.test(p), label: "1 chiffre" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: "1 caractère spécial" },
];

const Auth = () => {
  const { user, loading, signIn, signUp, resetPassword, failedAttempts, lockedUntil } = useAuth();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await signIn(email, password);
    if (err) setError(err);
    setSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const allValid = PASSWORD_RULES.every((r) => r.test(password));
    if (!allValid) {
      setError("Le mot de passe ne respecte pas la politique de sécurité.");
      return;
    }
    setSubmitting(true);
    const { error: err } = await signUp(email, password, displayName);
    if (err) setError(err);
    else setSuccess("Un email de confirmation a été envoyé. Vérifiez votre boîte de réception.");
    setSubmitting(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await resetPassword(email);
    if (err) setError(err);
    else setSuccess("Un email de réinitialisation a été envoyé.");
    setSubmitting(false);
  };

  if (showForgot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-foreground font-bold text-xl" style={{ fontFamily: "DM Sans" }}>O</span>
            </div>
            <CardTitle className="text-xl" style={{ fontFamily: "DM Sans" }}>Mot de passe oublié</CardTitle>
            <CardDescription>Saisissez votre email pour recevoir un lien de réinitialisation</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <Alert variant="destructive" className="mb-4"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
            {success && <Alert className="mb-4 border-success/30 bg-success/10"><CheckCircle className="h-4 w-4 text-success" /><AlertDescription className="text-success">{success}</AlertDescription></Alert>}
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="forgot-email" type="email" placeholder="votre@email.com" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Envoi..." : "Envoyer le lien"}</Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => { setShowForgot(false); setError(null); setSuccess(null); }}>Retour à la connexion</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <span className="text-primary-foreground font-bold text-xl" style={{ fontFamily: "DM Sans" }}>O</span>
          </div>
          <CardTitle className="text-xl" style={{ fontFamily: "DM Sans" }}>OpenColib</CardTitle>
          <CardDescription>Plateforme de gestion d'aide à domicile</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <Alert variant="destructive" className="mb-4"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
          {success && <Alert className="mb-4 border-success/30 bg-success/10"><CheckCircle className="h-4 w-4 text-success" /><AlertDescription className="text-success">{success}</AlertDescription></Alert>}
          {isLocked && <Alert variant="destructive" className="mb-4"><Lock className="h-4 w-4" /><AlertDescription>Compte verrouillé suite à trop de tentatives. Réessayez dans quelques minutes.</AlertDescription></Alert>}

          <Tabs value={tab} onValueChange={(v) => { setTab(v); setError(null); setSuccess(null); }}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="login-email" type="email" placeholder="votre@email.com" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="login-password" type="password" placeholder="••••••••" className="pl-9" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>
                {failedAttempts > 0 && <p className="text-xs text-destructive">{failedAttempts}/{MAX_LOGIN_ATTEMPTS} tentatives échouées</p>}
                <Button type="submit" className="w-full" disabled={submitting || isLocked}>{submitting ? "Connexion..." : "Se connecter"}</Button>
                <Button type="button" variant="link" className="w-full text-sm" onClick={() => { setShowForgot(true); setError(null); setSuccess(null); }}>Mot de passe oublié ?</Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nom complet</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="signup-name" placeholder="Jean Dupont" className="pl-9" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="signup-email" type="email" placeholder="votre@email.com" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="signup-password" type="password" placeholder="••••••••" className="pl-9" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-1 mt-2">
                    {PASSWORD_RULES.map((rule) => (
                      <div key={rule.label} className={`flex items-center gap-2 text-xs ${rule.test(password) ? "text-success" : "text-muted-foreground"}`}>
                        <CheckCircle className="h-3 w-3" />
                        {rule.label}
                      </div>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Inscription..." : "S'inscrire"}</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
