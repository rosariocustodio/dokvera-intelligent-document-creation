import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Sparkles,
  Shield,
  Loader2,
  LogOut,
  Save,
  Globe,
  Building2,
  Phone,
  Mail,
  Linkedin,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "@/hooks/use-session";
import { profileQuery } from "@/lib/queries";
import { listCountries, DEFAULT_COUNTRY, getCountryConfig, type CountryCode } from "@/lib/countries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Definições — Dokvera" },
      { name: "description", content: "Gerencie seu perfil executivo e preferências do Dokvera." },
      { property: "og:title", content: "Definições — Dokvera" },
      { property: "og:description", content: "Perfil e preferências da conta." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

export function SettingsPage() {
  const { user } = useSession();
  const userId = user?.id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({ ...profileQuery(userId), enabled: Boolean(userId) });

  const [activeTab, setActiveTab] = useState<"profile" | "defaults" | "ai" | "security">("profile");
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [institution, setInstitution] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [aiTone, setAiTone] = useState("executive");
  const [citationNorm, setCitationNorm] = useState("apa");
  const [autoFitA4, setAutoFitA4] = useState(true);

  const countryConfig = getCountryConfig(country);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setCountry((profile.country as CountryCode) ?? DEFAULT_COUNTRY);
      const meta = (profile.metadata ?? {}) as Record<string, unknown>;
      setHeadline((meta.headline as string) ?? "");
      setPhone((meta.phone as string) ?? "");
      setCity((meta.city as string) ?? "");
      setInstitution((meta.institution as string) ?? "");
      setLinkedin((meta.linkedin as string) ?? "");
      setAiTone((meta.aiTone as string) ?? "executive");
      setCitationNorm((meta.citationNorm as string) ?? "apa");
      setAutoFitA4(meta.autoFitA4 !== false);
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const metadata = {
        headline: headline.trim(),
        phone: phone.trim(),
        city: city.trim(),
        institution: institution.trim(),
        linkedin: linkedin.trim(),
        aiTone,
        citationNorm,
        autoFitA4,
      };

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          country,
          metadata,
        } as never)
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Definições guardadas com sucesso!");
    },
    onError: (e: Error) => toast.error(`Erro ao guardar definições: ${e.message}`),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const displayName = fullName.trim() || profile?.full_name || user?.email || "Utilizador";

  return (
    <div className="space-y-8 pb-24">
      <PageHeader
        title="Definições do Estúdio"
        subtitle="Gerencie o seu perfil executivo, preferências de IA e padrões da conta."
      />

      {/* HEADER CARD: PERFIL EXECUTIVO & RESUMO DA CONTA */}
      <section className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-primary/20 shadow-md">
              {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={displayName} /> : null}
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg font-display">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display text-foreground">{displayName}</h2>
                <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary">
                  SaaS Pro
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Mail className="size-3.5 text-muted-foreground/70" />
                {user?.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground border-border/60">
                  {countryConfig.name} ({countryConfig.currencySymbol})
                </Badge>
                <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground border-border/60">
                  {countryConfig.idDocumentShort} / {countryConfig.taxNumberShort}
                </Badge>
              </div>
            </div>
          </div>

          <Button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="h-11 px-6 rounded-xl font-bold text-xs shadow-glow gap-2 cursor-pointer self-stretch sm:self-auto"
          >
            {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Guardar Alterações
          </Button>
        </div>
      </section>

      {/* EXECUTIVE TAB NAVIGATION (ESTILO LINEAR / STRIPE) */}
      <div className="flex flex-wrap gap-2 rounded-2xl bg-muted/60 p-1.5 border border-border/50">
        {[
          { id: "profile", label: "1. Perfil Executivo", icon: User },
          { id: "defaults", label: "2. Dados Predefinidos", icon: Building2 },
          { id: "ai", label: "3. Inteligência Artificial", icon: Sparkles },
          { id: "security", label: "4. Preferências & Sessão", icon: Shield },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer",
                isActive
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className={cn("size-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PERFIL EXECUTIVO */}
      {activeTab === "profile" && (
        <section className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft space-y-6 animate-fade-in">
          <div className="border-b border-border/50 pb-3">
            <h3 className="text-base font-bold font-display text-foreground flex items-center gap-2">
              <User className="size-4.5 text-primary" />
              Perfil & Identidade Profissional
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Os seus dados de identificação profissional e jurisdição oficial.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full-name" className="text-xs font-semibold">Nome Completo</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo oficial"
                className="h-11 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline" className="text-xs font-semibold">Título Profissional (Headline)</Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Ex.: Gestor de Projetos / Analista de Sistemas"
                className="h-11 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="country" className="text-xs font-semibold">País de Residência / Jurisdição</Label>
              <Select value={country} onValueChange={(value) => setCountry(value as CountryCode)}>
                <SelectTrigger id="country" className="h-11 rounded-xl text-xs">
                  <SelectValue placeholder="Escolha o seu país" />
                </SelectTrigger>
                <SelectContent>
                  {listCountries().map((c) => (
                    <SelectItem key={c.code} value={c.code} className="text-xs">
                      {c.name} ({c.currencySymbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                <Globe className="size-3 text-primary" />
                Região ativa: <span className="font-semibold text-foreground">{countryConfig.name}</span>. Ajusta automaticamente a moeda local ({countryConfig.currencyCode}) e a terminologia oficial ({countryConfig.idDocumentShort} / {countryConfig.taxNumberShort}).
              </p>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: DADOS PREDEFINIDOS DO CRIADOR */}
      {activeTab === "defaults" && (
        <section className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft space-y-6 animate-fade-in">
          <div className="border-b border-border/50 pb-3">
            <h3 className="text-base font-bold font-display text-foreground flex items-center gap-2">
              <Building2 className="size-4.5 text-primary" />
              Preenchimento Automático do Criador
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Valores por omissão para acelerar a criação de novos documentos no estúdio.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-semibold flex items-center gap-1.5">
                <Phone className="size-3.5 text-primary" /> Telefone Habitual
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+258 8x xxx xxxx"
                className="h-11 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-xs font-semibold flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" /> Cidade / Província
              </Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex.: Maputo, Moçambique"
                className="h-11 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution" className="text-xs font-semibold flex items-center gap-1.5">
                <Building2 className="size-3.5 text-primary" /> Instituição / Universidade Habitual
              </Label>
              <Input
                id="institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Ex.: Universidade Eduardo Mondlane (UEM)"
                className="h-11 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-xs font-semibold flex items-center gap-1.5">
                <Linkedin className="size-3.5 text-primary" /> Perfil LinkedIn / Portefólio
              </Label>
              <Input
                id="linkedin"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/seuperfil"
                className="h-11 rounded-xl text-xs"
              />
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: PREFERÊNCIAS DE INTELIGÊNCIA ARTIFICIAL */}
      {activeTab === "ai" && (
        <section className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft space-y-6 animate-fade-in">
          <div className="border-b border-border/50 pb-3">
            <h3 className="text-base font-bold font-display text-foreground flex items-center gap-2">
              <Sparkles className="size-4.5 text-primary" />
              Preferências do Motor de IA
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Personalize o tom de voz e as normas de compilação dos seus documentos.
            </p>
          </div>

          <div className="space-y-6">
            {/* Tom de Voz Padrao */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-foreground">Tom de Voz Padrão para Redação</Label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { id: "executive", label: "Liderança Executiva", desc: "Foco em impacto, metas e resultados mensuráveis." },
                  { id: "technical", label: "Especialista Técnico", desc: "Linguagem precisa com vocabulário do setor." },
                  { id: "formal", label: "Formal Corporativo", desc: "Sóbrio, respeitoso e ideal para instituições." },
                  { id: "persuasive", label: "Persuasivo & Confiante", desc: "Envolvente, excelente para candidaturas." },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAiTone(item.id)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition-all cursor-pointer",
                      aiTone === item.id
                        ? "border-primary bg-primary/5 shadow-xs font-bold ring-1 ring-primary/30"
                        : "border-border/70 bg-card hover:border-border"
                    )}
                  >
                    <span className="block text-xs font-bold text-foreground">{item.label}</span>
                    <span className="mt-1 block text-[11px] text-muted-foreground leading-relaxed">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Norma de Citacao */}
            <div className="space-y-3 pt-2 border-t border-border/40">
              <Label className="text-xs font-semibold text-foreground">Norma de Citação Preferida</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "apa", label: "Norma APA" },
                  { id: "abnt", label: "Norma ABNT" },
                  { id: "iso690", label: "Norma ISO 690" },
                  { id: "none", label: "Sem norma específica" },
                ].map((norm) => (
                  <button
                    key={norm.id}
                    type="button"
                    onClick={() => setCitationNorm(norm.id)}
                    className={cn(
                      "h-9 rounded-xl px-4 text-xs font-semibold border transition-all cursor-pointer",
                      citationNorm === norm.id
                        ? "border-primary bg-primary/10 text-primary shadow-xs font-bold"
                        : "border-border/70 bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {norm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-Fit A4 Toggle */}
            <div className="flex items-center justify-between border-t border-border/40 pt-4">
              <div>
                <Label className="text-xs font-bold text-foreground">Motor Auto-Fit A4 Ativo</Label>
                <p className="text-[11px] text-muted-foreground">
                  Ajusta automaticamente respiros e tipografia para garantir 1 página A4 perfeita.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoFitA4(!autoFitA4)}
                className={cn(
                  "h-7 w-12 rounded-full p-1 transition-colors cursor-pointer",
                  autoFitA4 ? "bg-primary" : "bg-muted"
                )}
              >
                <div
                  className={cn(
                    "size-5 rounded-full bg-white transition-transform shadow-sm",
                    autoFitA4 ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: PREFERÊNCIAS & SESSÃO */}
      {activeTab === "security" && (
        <section className="rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-6 sm:p-7 shadow-soft space-y-6 animate-fade-in">
          <div className="border-b border-border/50 pb-3">
            <h3 className="text-base font-bold font-display text-foreground flex items-center gap-2">
              <Shield className="size-4.5 text-primary" />
              Aparência & Sessão Ativa
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gerencie a interface visual e a segurança do seu acesso.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
              <div>
                <p className="text-xs font-bold text-foreground">Aparência do Estúdio</p>
                <p className="text-[11px] text-muted-foreground">Alterne entre o Modo Claro e o Modo Escuro.</p>
              </div>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-destructive/30 bg-card p-4">
              <div>
                <p className="text-xs font-bold text-destructive">Encerrar Sessão</p>
                <p className="text-[11px] text-muted-foreground">Sair da sua conta Dokvera neste dispositivo.</p>
              </div>
              <Button variant="outline" size="sm" className="h-9 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer" onClick={signOut}>
                <LogOut className="mr-1.5 size-4" />
                Sair da Conta
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
