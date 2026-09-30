import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Coins,
  FilePlus2,
  FileText,
  Sparkles,
  Clock,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  FileSignature,
  FileCode2,
  ChevronRight,
  Plus,
  Zap,
  TrendingUp,
  Globe,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/use-session";
import { creditsQuery, documentsQuery, profileQuery } from "@/lib/queries";
import { creditsToCurrency, formatCurrency } from "@/lib/dokvera";
import { getCountryConfig } from "@/lib/countries";
import { DocumentCard } from "@/components/document-card";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel Principal — Dokvera" },
      { name: "description", content: "Visao geral e gestao de documentos academicos e profissionais no Dokvera." },
      { property: "og:title", content: "Painel Principal — Dokvera" },
      { property: "og:description", content: "Painel de controlo de creditos e documentos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

export function Dashboard() {
  const { user } = useSession();
  const userId = user?.id ?? "";

  const { data: profile } = useQuery({
    ...profileQuery(userId),
    enabled: Boolean(userId),
  });

  const { data: balance, isLoading: loadingCredits } = useQuery({
    ...creditsQuery(userId),
    enabled: Boolean(userId),
  });

  const { data: documents, isLoading: loadingDocs } = useQuery({
    ...documentsQuery(userId, 6),
    enabled: Boolean(userId),
  });

  const country = profile?.country;
  const countryConfig = getCountryConfig(country);
  const credits = balance ?? 0;
  const totalDocs = documents?.length ?? 0;
  const draftDocs = documents?.filter((d) => d.status === "draft").length ?? 0;
  const readyDocs = documents?.filter((d) => d.status === "completed" || d.status === "ready").length ?? 0;

  const displayName = profile?.full_name?.split(" ")[0] || "Utilizador";

  return (
    <div className="max-w-6xl space-y-8 pb-16">
      {/* HEADER EXECUTIVO DE BOAS-VINDAS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Ola, {displayName}
            </h1>
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary">
              Estudio Pro
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Benvindo ao seu estudio inteligente de engenharia documental.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="lg" className="rounded-xl shadow-glow font-bold text-xs gap-2 h-11 px-5 cursor-pointer">
            <Link to="/documents/new">
              <Plus className="size-4" />
              Criar Novo Documento
            </Link>
          </Button>
        </div>
      </div>

      {/* GRELHA DE METRICAS PRINCIPAIS (4 ESTATISTICAS DE ALTO IMPACTO) */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Saldo de Creditos (Hero Metric) */}
        <div className="gradient-brand shadow-glow relative overflow-hidden rounded-2xl p-5 text-brand-foreground flex flex-col justify-between">
          <Sparkles className="animate-float absolute -right-4 -top-4 size-20 opacity-15 pointer-events-none" />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-foreground/80 font-mono">
                Saldo Disponivel
              </span>
              <Badge variant="outline" className="border-brand-foreground/30 text-brand-foreground text-[10px] bg-brand-foreground/10">
                {countryConfig.currencySymbol}
              </Badge>
            </div>
            {loadingCredits ? (
              <Skeleton className="h-8 w-28 bg-brand-foreground/20 rounded-lg mt-2" />
            ) : (
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold tracking-tight">
                  {credits}
                </span>
                <span className="text-xs font-semibold text-brand-foreground/85">
                  {credits === 1 ? "credito" : "creditos"} ({formatCurrency(creditsToCurrency(credits, country), country)})
                </span>
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-brand-foreground/15 flex items-center justify-between">
            <Link to="/credits" className="text-[11px] font-bold underline hover:opacity-80 transition-opacity flex items-center gap-1">
              <Coins className="size-3" /> Recarregar Saldo
            </Link>
          </div>
        </div>

        {/* Card 2: Documentos Criados */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Documentos Totais
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-display text-3xl font-extrabold text-foreground">
              {loadingDocs ? "—" : totalDocs}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Criados na plataforma</p>
          </div>
        </div>

        {/* Card 3: Rascunhos em Edicao */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Rascunhos em Edicao
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-display text-3xl font-extrabold text-foreground">
              {loadingDocs ? "—" : draftDocs}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Aguardam conclusao</p>
          </div>
        </div>

        {/* Card 4: Prontos a Exportar */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Prontos a Exportar
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-display text-3xl font-extrabold text-foreground">
              {loadingDocs ? "—" : readyDocs}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Formatados em Word/PDF</p>
          </div>
        </div>
      </div>

      {/* SECCAO: ATALHOS RAPIDOS DE CRIACAO (PRESETS POR CATEGORIA) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              Atalhos Rapidos de Criacao
            </h2>
            <p className="text-xs text-muted-foreground">Escolha a categoria para iniciar instantaneamente a geracao com IA.</p>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/documents/new"
            search={{ type: "academic" }}
            className="group rounded-2xl border border-border/60 bg-card p-5 shadow-xs hover:border-primary/50 hover:shadow-sm transition-all flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <GraduationCap className="size-5" />
              </div>
              <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold font-display text-foreground">Academico</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Monografias, relatorios e teses APA/ABNT</p>
            </div>
          </Link>

          <Link
            to="/documents/new"
            search={{ type: "cv" }}
            className="group rounded-2xl border border-border/60 bg-card p-5 shadow-xs hover:border-primary/50 hover:shadow-sm transition-all flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <Briefcase className="size-5" />
              </div>
              <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold font-display text-foreground">Profissional</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Curriculos e cartas de candidatura</p>
            </div>
          </Link>

          <Link
            to="/documents/new"
            search={{ type: "request" }}
            className="group rounded-2xl border border-border/60 bg-card p-5 shadow-xs hover:border-primary/50 hover:shadow-sm transition-all flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <FileSignature className="size-5" />
              </div>
              <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold font-display text-foreground">Administrativo</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Requerimentos e declaracoes oficiais</p>
            </div>
          </Link>

          <Link
            to="/documents/new"
            search={{ type: "other" }}
            className="group rounded-2xl border border-border/60 bg-card p-5 shadow-xs hover:border-primary/50 hover:shadow-sm transition-all flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                <FileCode2 className="size-5" />
              </div>
              <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold font-display text-foreground">Personalizado</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Formatos sob medida & propostas B2B</p>
            </div>
          </Link>
        </div>
      </section>

      {/* SECÇÃO: DOCUMENTOS RECENTES */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">Documentos Recentes</h2>
            <p className="text-xs text-muted-foreground">Continue a edicao ou descarregue os seus ficheiros prontos.</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-lg text-primary font-semibold text-xs gap-1 hover:bg-primary/10">
            <Link to="/documents">
              Ver Todos
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {loadingDocs ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-44 rounded-2xl" />)
          ) : documents && documents.length > 0 ? (
            documents.map((doc) => <DocumentCard key={doc.id} doc={doc} country={country} />)
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-border/80 bg-card p-8 text-center shadow-xs">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                <FilePlus2 className="size-6" />
              </div>
              <p className="font-display text-sm font-bold text-foreground">Ainda nao tem documentos recentes</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                Inicie o seu primeiro documento no estudio para visualizar aqui os seus rascunhos.
              </p>
              <Button asChild className="mt-5 rounded-xl h-10 px-5 text-xs font-bold shadow-sm">
                <Link to="/documents/new">
                  <FilePlus2 className="mr-2 size-3.5" />
                  Criar Primeiro Documento
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
