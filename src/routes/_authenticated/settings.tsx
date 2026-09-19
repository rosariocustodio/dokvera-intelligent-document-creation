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
  MapPin,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      { title: "Definicoes — Dokvera" },
      { name: "description", content: "Gerencie a sua conta e preferencias no Dokvera." },
      { property: "og:title", content: "Definicoes — Dokvera" },
      { property: "og:description", content: "Perfil e preferencias da conta." },
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
      toast.success("Definicoes guardadas com sucesso!");
    },
    onError: (e: Error) => toast.error(`Erro ao guardar definicoes: ${e.message}`),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const displayName = fullName.trim() || profile?.full_name || user?.email || "Utilizador";

  return (
    <div className="max-w-5xl space-y-8 pb-20">
      <PageHeader
        title="Definicoes da Conta"
        subtitle="Gerencie as informacoes do seu perfil, pais e preferencias de IA."
      />

      {/* PAINEL SUPERIOR: RESUMO DO UTILIZADOR */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <Avatar className="size-14 border border-border shadow-xs">
            {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={displayName} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-base font-display">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-base font-bold font-display text-foreground">{displayName}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Mail className="size-3.5" /> {user?.email}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {countryConfig.name} ({countryConfig.currencySymbol})
            </p>
          </div>
        </div>

        <Button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="h-10 px-5 rounded-xl font-semibold text-xs shadow-sm gap-2 cursor-pointer self-stretch sm:self-auto"
        >
          {save.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          Guardar Alteracoes
        </Button>
      </div>

      {/* NAVEGACAO POR SECTORES (STYLE CLEAN EXECUTIVE) */}
      <div className="flex flex-wrap gap-1 border-b border-border/60 pb-1">
        {[
          { id: "profile", label: "Perfil", icon: User },
          { id: "defaults", label: "Dados Predefinidos", icon: Building2 },
          { id: "ai", label: "Inteligencia Artificial", icon: Sparkles },
          { id: "security", label: "Conta e Seguranca", icon: Shield },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer border-b-2 -mb-1",
                isActive
                  ? "border-primary text-primary font-bold bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTOR 1: PERFIL */}
      {activeTab === "profile" && (
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold font-display text-foreground">Informacao do Perfil</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Identificacao pessoal e jurisdicao oficial.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="full-name" className="text-xs font-medium">Nome Completo</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
                className="h-10 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="headline" className="text-xs font-medium">Titulo Profissional</Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Ex.: Gestor de Projetos"
                className="h-10 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="country" className="text-xs font-medium">Pais e Moeda</Label>
              <Select value={country} onValueChange={(value) => setCountry(value as CountryCode)}>
                <SelectTrigger id="country" className="h-10 rounded-lg text-xs">
                  <SelectValue placeholder="Escolha o pais" />
                </SelectTrigger>
                <SelectContent>
                  {listCountries().map((c) => (
                    <SelectItem key={c.code} value={c.code} className="text-xs">
                      {c.name} ({c.currencySymbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* SECTOR 2: DADOS PREDEFINIDOS */}
      {activeTab === "defaults" && (
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold font-display text-foreground">Preenchimento Automatico</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Valores por omissao para acelerar a criacao de documentos.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-medium">Telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+258 8x xxx xxxx"
                className="h-10 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-xs font-medium">Cidade</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex.: Maputo"
                className="h-10 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="institution" className="text-xs font-medium">Instituicao / Empresa</Label>
              <Input
                id="institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Ex.: UEM / Empresa Lda"
                className="h-10 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="linkedin" className="text-xs font-medium">Perfil LinkedIn</Label>
              <Input
                id="linkedin"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/perfil"
                className="h-10 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTOR 3: INTELIGENCIA ARTIFICIAL */}
      {activeTab === "ai" && (
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold font-display text-foreground">Preferencias de Redacao IA</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Defina o tom de voz e a norma de citacao padrao.</p>
          </div>

          <div className="space-y-5">
            {/* Tom de Voz Padrao */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground">Tom de Voz</Label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { id: "executive", label: "Lideranca Executiva", desc: "Objetivo, focado em resultados." },
                  { id: "technical", label: "Especialista Tecnico", desc: "Linguagem precisa e tecnica." },
                  { id: "formal", label: "Formal Corporativo", desc: "Sobrio e institucional." },
                  { id: "persuasive", label: "Persuasivo", desc: "Envolvente e direto." },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAiTone(item.id)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-all cursor-pointer",
                      aiTone === item.id
                        ? "border-primary bg-primary/5 font-semibold text-primary shadow-xs"
                        : "border-border/60 bg-card hover:border-border text-muted-foreground"
                    )}
                  >
                    <span className="block text-xs font-bold">{item.label}</span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Norma de Citacao */}
            <div className="space-y-2 pt-3 border-t border-border/40">
              <Label className="text-xs font-medium text-foreground">Norma de Citacao Padrao</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "apa", label: "Norma APA" },
                  { id: "abnt", label: "Norma ABNT" },
                  { id: "iso690", label: "Norma ISO 690" },
                  { id: "none", label: "Nenhuma" },
                ].map((norm) => (
                  <button
                    key={norm.id}
                    type="button"
                    onClick={() => setCitationNorm(norm.id)}
                    className={cn(
                      "h-8 rounded-lg px-3.5 text-xs font-medium border transition-all cursor-pointer",
                      citationNorm === norm.id
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border/60 bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {norm.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTOR 4: CONTA E SEGURANCA */}
      {activeTab === "security" && (
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold font-display text-foreground">Conta e Tema</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Aparencia visual e encerramento de sessao.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
              <div>
                <p className="text-xs font-bold text-foreground">Tema da Interface</p>
                <p className="text-[11px] text-muted-foreground">Alterne entre o modo claro e o modo escuro.</p>
              </div>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/20 bg-card p-4">
              <div>
                <p className="text-xs font-bold text-destructive">Encerrar Sessao</p>
                <p className="text-[11px] text-muted-foreground">Sair da sua conta neste dispositivo.</p>
              </div>
              <Button variant="outline" size="sm" className="h-9 rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer" onClick={signOut}>
                <LogOut className="mr-1.5 size-3.5" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
