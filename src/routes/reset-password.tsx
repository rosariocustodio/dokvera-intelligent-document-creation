import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const title = "Definir nova palavra-passe — Dokvera";
const description = "Cria uma nova palavra-passe para a tua conta Dokvera.";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // Use ref to avoid closure issues in onAuthStateChange
  const isRecoveryFlowRef = useRef(isRecoveryFlow);
  isRecoveryFlowRef.current = isRecoveryFlow;

  useEffect(() => {
    // Check for existing session first
    supabase.auth.getSession().then(({ data }) => {
      const hasSession = Boolean(data.session);
      // If there's a session but we're not in a recovery flow, redirect to dashboard
      if (hasSession && !isRecoveryFlowRef.current) {
        navigate({ to: "/dashboard", replace: true });
        return;
      }
      setReady(hasSession);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // User clicked recovery link - this is the recovery flow
        setIsRecoveryFlow(true);
        setReady(true);
        // Mark that we're in recovery mode so other routes can block access
        sessionStorage.setItem("inPasswordRecovery", "true");
      } else if ((event === "SIGNED_IN" || event === "USER_UPDATED") && isRecoveryFlowRef.current) {
        // Password was updated (updateUser triggers USER_UPDATED), recovery flow complete
        setIsRecoveryFlow(false);
        sessionStorage.removeItem("inPasswordRecovery");
      } else if (event === "SIGNED_IN" && !isRecoveryFlowRef.current) {
        // Normal sign in - redirect to dashboard
        navigate({ to: "/dashboard", replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("A palavra-passe precisa de pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As palavras-passe não coincidem.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Palavra-passe atualizada.");
    navigate({ to: "/dashboard", replace: true });
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
          <h1 className="font-display text-2xl font-bold">Nova palavra-passe</h1>
          {ready ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Define uma palavra-passe segura para a tua conta.
              </p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Palavra-passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar palavra-passe</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
                <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : "Guardar palavra-passe"}
                </Button>
              </form>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Abre esta página através do link de recuperação enviado para o teu email. O link é
              válido por tempo limitado.
            </p>
          )}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/auth" className="underline-offset-4 hover:underline">
              Voltar ao início de sessão
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
