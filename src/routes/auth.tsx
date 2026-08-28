import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { cn } from "@/lib/utils";

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

function passwordScore(value: string) {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return score;
}

const scoreLabels = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];

function PasswordStrength({ value }: { value: string }) {
  const score = passwordScore(value);
  if (!value) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < score ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Segurança: {scoreLabels[score]}</p>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  minLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 rounded-xl pr-11"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

type Mode = "login" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: "/dashboard", replace: true });
        return;
      }
      setCheckingSession(false);
    });
  }, [navigate]);

  const step1Valid = useMemo(
    () => name.trim().length >= 3 && /^\S+@\S+\.\S+$/.test(signupEmail),
    [name, signupEmail],
  );
  const step2Valid = useMemo(
    () =>
      passwordScore(signupPassword) >= 3 && signupPassword === confirmPassword && terms,
    [signupPassword, confirmPassword, terms],
  );

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(
        error.message.toLowerCase().includes("confirm")
          ? "Confirma o teu email antes de entrar."
          : "Email ou palavra-passe incorrectos.",
      );
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    if (!step2Valid) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name.trim() },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(
        error.message.toLowerCase().includes("already")
          ? "Já existe uma conta com este email. Entra em vez de criar."
          : error.message,
      );
      return;
    }
    if (data.session) {
      navigate({ to: "/dashboard", replace: true });
      return;
    }
    setSignedUp(true);
    toast.success("Conta criada. Confirma o teu email para entrar.");
  }

  async function sendRecovery() {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Escreve o teu email primeiro.");
      return;
    }
    setRecovering(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setRecovering(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Enviámos um link de recuperação para o teu email.");
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div className="glow-backdrop pointer-events-none absolute inset-x-0 top-0 h-96" />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-10 px-5 py-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <Logo showParent />
            <div className="lg:hidden">
              <ThemeToggle />
            </div>
          </div>

          <div className="mt-10 hidden lg:block">
            <h2 className="font-display text-4xl font-bold leading-tight tracking-tight">
              Documentos profissionais,
              <br />
              prontos em minutos.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Cria trabalhos académicos, CVs, relatórios e cartas com estrutura correcta, custo
              transparente em créditos e exportação em PDF ou DOCX.
            </p>
            <ul className="mt-8 space-y-3.5">
              {[
                "Preço calculado antes de gerar — sem surpresas",
                "Capa, índice, objectivos, referências e anexos opcionais",
                "Exportação PDF e DOCX com formatação limpa",
                "Histórico de documentos e de créditos sempre acessível",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                    <Check className="size-3.5" />
                  </span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Sessão protegida. Os teus documentos são privados.
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-4 hidden justify-end lg:flex">
            <ThemeToggle />
          </div>

          <div className="glass shadow-elevated w-full rounded-3xl p-6 md:p-8">
            {signedUp ? (
              <div className="text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <MailCheck className="size-6" />
                </span>
                <h1 className="mt-5 font-display text-2xl font-bold">Verifica o teu email</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enviámos um link de confirmação para <strong>{signupEmail}</strong>. Depois de
                  confirmar, volta aqui para entrar.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 h-11 w-full rounded-xl"
                  onClick={() => {
                    setSignedUp(false);
                    setMode("login");
                    setEmail(signupEmail);
                    setStep(1);
                  }}
                >
                  Voltar ao início de sessão
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <Sparkles className="size-3.5" />
                  {mode === "login" ? "Bem-vindo de volta" : "Criar conta Dokvera"}
                </div>
                <h1 className="mt-2 font-display text-2xl font-bold">
                  {mode === "login" ? "Entrar na tua conta" : "Começa em dois passos"}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {mode === "login"
                    ? "Usa as tuas credenciais para aceder."
                    : "Confirmamos os teus dados antes de concluir o registo."}
                </p>

                <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  Entrar com email
                  <span className="h-px flex-1 bg-border" />
                </div>

                <Tabs
                  value={mode}
                  onValueChange={(v) => {
                    setMode(v as Mode);
                    setStep(1);
                  }}
                >
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
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu@exemplo.com"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <PasswordField
                        id="login-password"
                        label="Palavra-passe"
                        value={password}
                        onChange={setPassword}
                        autoComplete="current-password"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={sendRecovery}
                          disabled={recovering}
                          className="text-xs font-medium text-primary underline-offset-4 hover:underline disabled:opacity-60"
                        >
                          {recovering ? "A enviar…" : "Esqueci-me da palavra-passe"}
                        </button>
                      </div>
                      <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl">
                        {loading ? <Loader2 className="size-4 animate-spin" /> : "Entrar"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <div className="mt-5">
                      <div className="mb-5 flex items-center gap-3">
                        {[1, 2].map((s) => (
                          <div key={s} className="flex flex-1 items-center gap-2">
                            <span
                              className={cn(
                                "flex size-6 items-center justify-center rounded-full text-[11px] font-semibold",
                                step >= s
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {s}
                            </span>
                            <span
                              className={cn(
                                "h-1 flex-1 rounded-full",
                                step > s ? "bg-primary" : "bg-border",
                              )}
                            />
                          </div>
                        ))}
                      </div>

                      {step === 1 ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="signup-name">Nome completo</Label>
                            <Input
                              id="signup-name"
                              required
                              autoComplete="name"
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
                              autoComplete="email"
                              value={signupEmail}
                              onChange={(e) => setSignupEmail(e.target.value)}
                              placeholder="tu@exemplo.com"
                              className="h-11 rounded-xl"
                            />
                          </div>
                          <Button
                            type="button"
                            disabled={!step1Valid}
                            onClick={() => setStep(2)}
                            className="h-11 w-full gap-2 rounded-xl"
                          >
                            Continuar
                            <ArrowRight className="size-4" />
                          </Button>
                          {!step1Valid && (name || signupEmail) ? (
                            <p className="text-xs text-muted-foreground">
                              Escreve o nome completo e um email válido.
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <form onSubmit={signUp} className="space-y-4">
                          <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 text-xs">
                            <p className="font-semibold">{name}</p>
                            <p className="mt-0.5 text-muted-foreground">{signupEmail}</p>
                          </div>
                          <PasswordField
                            id="signup-password"
                            label="Palavra-passe"
                            value={signupPassword}
                            onChange={setSignupPassword}
                            autoComplete="new-password"
                            minLength={8}
                          />
                          <PasswordStrength value={signupPassword} />
                          <PasswordField
                            id="signup-confirm"
                            label="Confirmar palavra-passe"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            autoComplete="new-password"
                            minLength={8}
                          />
                          {confirmPassword && confirmPassword !== signupPassword ? (
                            <p className="text-xs text-destructive">
                              As palavras-passe não coincidem.
                            </p>
                          ) : null}
                          <label className="flex items-start gap-2.5 text-xs text-muted-foreground">
                            <Checkbox
                              checked={terms}
                              onCheckedChange={(v) => setTerms(v === true)}
                              className="mt-0.5"
                            />
                            <span>
                              Aceito os termos de utilização e a política de privacidade do Dokvera.
                            </span>
                          </label>
                          <div className="flex gap-2.5">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setStep(1)}
                              className="h-11 gap-1.5 rounded-xl px-4"
                            >
                              <ArrowLeft className="size-4" />
                              Voltar
                            </Button>
                            <Button
                              type="submit"
                              disabled={loading || !step2Valid}
                              className="h-11 flex-1 rounded-xl"
                            >
                              {loading ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                "Criar conta"
                              )}
                            </Button>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            A palavra-passe precisa de 8+ caracteres, com maiúscula e número.
                          </p>
                        </form>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}

            <p className="mt-6 text-center text-xs text-muted-foreground">
              <Link to="/" className="underline-offset-4 hover:underline">
                Voltar à página inicial
              </Link>
            </p>
          </div>

          <p className="mt-5 text-center text-xs text-muted-foreground">Dokvera by Ruqzora</p>
        </div>
      </div>
    </div>
  );
}
