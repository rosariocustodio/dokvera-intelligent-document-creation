import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

const title = "Entrar no Dokvera — cria a tua conta";
const description =
  "Entra ou cria a tua conta Dokvera para criar e organizar documentos académicos e profissionais.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [signedUp, setSignedUp] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Email ou palavra-passe incorrectos.");
      return;
    }
    navigate({ to: "/dashboard" });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/dashboard" });
      return;
    }
    setSignedUp(true);
    toast.success("Conta criada. Confirma o teu email para entrar.");
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="glow-backdrop pointer-events-none absolute inset-x-0 top-0 h-96" />
      <header className="relative z-10 mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-10">
        <div className="glass shadow-elevated w-full max-w-md rounded-3xl p-7 md:p-8">
          <h1 className="font-display text-2xl font-bold">Bem-vindo ao Dokvera</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cria e organiza os teus documentos num só lugar.
          </p>

          <div className="mt-6">
            <GoogleSignInButton className="w-full" />
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou com email
            <span className="h-px flex-1 bg-border" />
          </div>

          {signedUp ? (
            <div className="rounded-2xl border border-border/70 bg-card p-5 text-sm">
              <p className="font-semibold">Verifica o teu email</p>
              <p className="mt-1.5 text-muted-foreground">
                Enviámos um link de confirmação para <strong>{email}</strong>. Depois de confirmar,
                volta aqui para entrar.
              </p>
            </div>
          ) : (
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg">
                  Criar conta
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={signIn} className="mt-5 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@exemplo.com"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Palavra-passe</Label>
                    <Input
                      id="login-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl">
                    {loading ? <Loader2 className="size-4 animate-spin" /> : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={signUp} className="mt-5 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome completo</Label>
                    <Input
                      id="signup-name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="O teu nome"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@exemplo.com"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Palavra-passe</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl">
                    {loading ? <Loader2 className="size-4 animate-spin" /> : "Criar conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="underline-offset-4 hover:underline">
              Voltar à página inicial
            </Link>
          </p>
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-xs text-muted-foreground">
        Dokvera by Ruqzora
      </footer>
    </div>
  );
}
