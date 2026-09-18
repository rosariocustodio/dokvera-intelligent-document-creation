import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  getStoredLanguage,
  setStoredLanguage,
  TRANSLATIONS,
  type Language,
} from "@/lib/landing-i18n";
import { cn } from "@/lib/utils";

const title = "Autenticação — Dokvera";
const description = "Entrar ou criar conta na plataforma Dokvera.";

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
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 rounded-xl pr-11 text-xs"
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
  const [lang, setLangState] = useState<Language>("PT");

  useEffect(() => {
    setLangState(getStoredLanguage());
  }, []);

  const changeLanguage = (newLang: Language) => {
    setLangState(newLang);
    setStoredLanguage(newLang);
  };

  const t = TRANSLATIONS[lang].auth;

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
          ? (lang === "PT" ? "Confirme o seu email antes de entrar." : "Please confirm your email before signing in.")
          : (lang === "PT" ? "Email ou palavra-passe incorretos." : "Incorrect email or password."),
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
          ? (lang === "PT" ? "Já existe uma conta com este email. Entre em vez de criar." : "An account already exists with this email.")
          : error.message,
      );
      return;
    }
    if (data.session) {
      navigate({ to: "/dashboard", replace: true });
      return;
    }
    setSignedUp(true);
    toast.success(lang === "PT" ? "Conta criada. Confirme o seu email para entrar." : "Account created. Confirm your email to sign in.");
  }

  async function sendRecovery() {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error(lang === "PT" ? "Escreva o seu email primeiro." : "Enter your email first.");
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
    toast.success(lang === "PT" ? "Enviamos um link de recuperação para o seu email." : "We sent a recovery link to your email.");
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background flex flex-col justify-between selection:bg-primary/20 selection:text-primary antialiased">
      {/* Subtle Background Glow */}
      <div className="glow-backdrop pointer-events-none absolute inset-x-0 top-0 h-96 opacity-40" />

      {/* Top Header */}
      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Logo showParent />

        <div className="flex items-center gap-3">
          {/* PT / EN Language Toggle */}
          <div className="flex items-center rounded-xl border border-border/70 bg-muted/40 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => changeLanguage("PT")}
              className={cn(
                "rounded-lg px-2.5 py-1 transition-all cursor-pointer",
                lang === "PT"
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              PT
            </button>
            <button
              type="button"
              onClick={() => changeLanguage("EN")}
              className={cn(
                "rounded-lg px-2.5 py-1 transition-all cursor-pointer",
                lang === "EN"
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              EN
            </button>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Centered Minimalist Auth Card */}
      <main className="relative z-10 mx-auto w-full max-w-md px-5 py-8 my-auto">
        <div className="rounded-3xl border border-border/70 bg-card/90 p-7 sm:p-9 shadow-soft space-y-6 backdrop-blur-xl">
          {signedUp ? (
            <div className="text-center space-y-4 py-2">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MailCheck className="size-6" />
              </span>
              <h1 className="font-display text-xl font-bold text-foreground">{t.verifyEmailTitle}</h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.verifyEmailDesc} <strong className="text-foreground">{signupEmail}</strong>.
              </p>
              <Button
                variant="outline"
                className="mt-4 h-11 w-full rounded-2xl text-xs font-semibold"
                onClick={() => {
                  setSignedUp(false);
                  setMode("login");
                  setEmail(signupEmail);
                  setStep(1);
                }}
              >
                {t.backToLogin}
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center space-y-1.5">
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  {mode === "login" ? t.titleLogin : t.titleSignup}
                </h1>
              </div>

              {/* MODE = LOGIN */}
              {mode === "login" ? (
                <form onSubmit={signIn} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email" className="text-xs font-semibold text-foreground">
                      {t.emailLabel}
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="h-11 rounded-xl text-xs"
                    />
                  </div>

                  <PasswordField
                    id="login-password"
                    label={t.passwordLabel}
                    value={password}
                    onChange={setPassword}
                    autoComplete="current-password"
                  />

                  <div className="flex justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={sendRecovery}
                      disabled={recovering}
                      className="text-xs font-medium text-primary hover:underline underline-offset-4 disabled:opacity-60"
                    >
                      {recovering ? t.sending : t.forgotPassword}
                    </button>
                  </div>

                  <Button type="submit" disabled={loading} size="lg" className="h-11 w-full rounded-2xl font-bold text-xs shadow-glow">
                    {loading ? <Loader2 className="size-4 animate-spin" /> : t.loginBtn}
                  </Button>

                  <div className="pt-4 text-center border-t border-border/50">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        setStep(1);
                      }}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t.toggleToSignup}
                    </button>
                  </div>
                </form>
              ) : (
                /* MODE = SIGNUP */
                <div className="pt-2">
                  {step === 1 ? (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-name" className="text-xs font-semibold text-foreground">
                          {t.fullNameLabel}
                        </Label>
                        <Input
                          id="signup-name"
                          required
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t.fullNamePlaceholder}
                          className="h-11 rounded-xl text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="signup-email" className="text-xs font-semibold text-foreground">
                          {t.emailLabel}
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder={t.emailPlaceholder}
                          className="h-11 rounded-xl text-xs"
                        />
                      </div>

                      <Button
                        type="button"
                        disabled={!step1Valid}
                        onClick={() => setStep(2)}
                        size="lg"
                        className="h-11 w-full gap-2 rounded-2xl font-bold text-xs shadow-glow"
                      >
                        {t.continue}
                        <ArrowRight className="size-4" />
                      </Button>

                      <div className="pt-4 text-center border-t border-border/50">
                        <button
                          type="button"
                          onClick={() => setMode("login")}
                          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {t.toggleToLogin}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={signUp} className="space-y-4">
                      <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
                        <p className="font-bold text-foreground">{name}</p>
                        <p className="text-muted-foreground">{signupEmail}</p>
                      </div>

                      <PasswordField
                        id="signup-password"
                        label={t.passwordLabel}
                        value={signupPassword}
                        onChange={setSignupPassword}
                        autoComplete="new-password"
                        minLength={8}
                      />

                      <PasswordField
                        id="signup-confirm"
                        label={t.confirmPasswordLabel}
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        autoComplete="new-password"
                        minLength={8}
                      />

                      <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer pt-1">
                        <Checkbox
                          checked={terms}
                          onCheckedChange={(v) => setTerms(v === true)}
                          className="mt-0.5"
                        />
                        <span>{t.terms}</span>
                      </label>

                      <div className="flex gap-2.5 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="h-11 gap-1.5 rounded-2xl px-4 text-xs font-semibold"
                        >
                          <ArrowLeft className="size-4" />
                          {t.back}
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading || !step2Valid}
                          className="h-11 flex-1 rounded-2xl font-bold text-xs shadow-glow"
                        >
                          {loading ? <Loader2 className="size-4 animate-spin" /> : t.signupBtn}
                        </Button>
                      </div>

                      <div className="pt-4 text-center border-t border-border/50">
                        <button
                          type="button"
                          onClick={() => {
                            setMode("login");
                            setStep(1);
                          }}
                          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {t.toggleToLogin}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:underline">
            {t.backToHome}
          </Link>
        </p>
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-6 text-center text-xs text-muted-foreground border-t border-border/40">
        Dokvera by Ruqzora
      </footer>
    </div>
  );
}
