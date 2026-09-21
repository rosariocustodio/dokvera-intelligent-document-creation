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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/use-session";
import { creditsQuery, documentsQuery, profileQuery } from "@/lib/queries";
import { creditsToCurrency, formatCurrency } from "@/lib/dokvera";
import { DocumentCard } from "@/components/document-card";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel Principal — Dokvera" },
      { name: "description", content: "Visão geral e gestão de documentos académicos e profissionais no Dokvera." },
      { property: "og:title", content: "Painel Principal — Dokvera" },
      { property: "og:description", content: "Painel de controlo de créditos e documentos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
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
  const credits = balance ?? 0;
  const totalDocs = documents?.length ?? 0;
  const draftDocs = documents?.filter((d) => d.status === "draft").length ?? 0;
  const readyDocs = documents?.filter((d) => d.status === "completed" || d.status === "ready").length ?? 0;

  const displayName = profile?.full_name?.split(" ")[0] || "Utilizador";

  return (
    <div className="space-y-8 pb-12">
      {/* Header com Boas-Vindas Personalizadas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Olá, {displayName}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Gere e gira os seus documentos académicos e profissionais num só lugar.
          </p>
        </div>

        <Button asChild size="lg" className="rounded-2xl shadow-glow font-semibold text-xs sm:text-sm gap-2 h-11">
          <Link to="/documents/new">
            <Plus className="size-4" />
            Criar Novo Documento
          </Link>
        </Button>
      </div>

      {/* Grid Principal de Saldo & Métricas */}
      <div className="grid gap-5 lg:grid-cols-12 items-stretch">
        {/* Cartão de Créditos Hero (7/12) */}
        <div className="gradient-brand shadow-glow relative overflow-hidden rounded-3xl p-6 sm:p-7 text-brand-foreground lg:col-span-7 flex flex-col justify-between min-h-[220px]">
          <Sparkles className="animate-float absolute -right-6 -top-6 size-32 opacity-15 pointer-events-none" />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-foreground/80 font-mono">
                Saldo Disponível
              </span>
              <Badge variant="outline" className="border-brand-foreground/30 text-brand-foreground text-[10px] bg-brand-foreground/10">
                Conta Ativa
              </Badge>
            </div>

            {loadingCredits ? (
              <Skeleton className="h-12 w-48 bg-brand-foreground/20 rounded-xl" />
            ) : (
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
                  {credits}
                </span>
                <span className="text-sm font-medium text-brand-foreground/85 font-mono">
                  {credits === 1 ? "crédito" : "créditos"} ({formatCurrency(creditsToCurrency(credits, country), country)})
                </span>
              </div>
            )}
            <p className="text-xs sm:text-sm text-brand-foreground/90 max-w-md leading-relaxed">
              Cada crédito permite gerar secções, formatações formais ABNT/APA e currículos profissionais.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-brand-foreground/15">
            <Button asChild variant="secondary" className="h-10 rounded-xl px-4 text-xs font-semibold shadow-xs">
              <Link to="/documents/new">
                <FilePlus2 className="mr-1.5 size-3.5" />
                Criar Documento
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-xl px-4 text-xs font-semibold border-brand-foreground/40 bg-transparent text-brand-foreground hover:bg-brand-foreground/10"
            >
              <Link to="/credits">
                <Coins className="mr-1.5 size-3.5" />
                Adquirir Créditos
              </Link>
            </Button>
          </div>
        </div>

        {/* Métricas Rápidas em Grid (5/12) */}
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:col-span-5">
          <div className="shadow-soft rounded-2xl border border-border/70 bg-card p-5 flex items-center justify-between transition-all hover:border-primary/30">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Documentos Totais</p>
              <p className="font-display text-2xl font-bold text-foreground">
                {loadingDocs ? "—" : totalDocs}
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
          </div>

          <div className="shadow-soft rounded-2xl border border-border/70 bg-card p-5 flex items-center justify-between transition-all hover:border-warning/30">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Rascunhos em Edição</p>
              <p className="font-display text-2xl font-bold text-foreground">
                {loadingDocs ? "—" : draftDocs}
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-2xl bg-warning/10 text-warning">
              <Clock className="size-5" />
            </div>
          </div>

          <div className="shadow-soft rounded-2xl border border-border/70 bg-card p-5 flex items-center justify-between transition-all hover:border-emerald-500/30">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Prontos a Exportar</p>
              <p className="font-display text-2xl font-bold text-foreground">
                {loadingDocs ? "—" : readyDocs}
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </div>
          </div>
        </div>
      </div>

      {/* SECÇÃO: Atalhos por Categoria (Grid Equilibrado de 4 Elementos) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Criar por Categoria</h2>
            <p className="text-xs text-muted-foreground">Seleccione a categoria pretendida para abrir o estúdio configurado.</p>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/documents/new"
            search={{ type: "academic" }}
            className="group shadow-soft rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <GraduationCap className="size-5" />
              </div>
              <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold font-display text-foreground">Académico</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monografias, relatórios e teses</p>
            </div>
          </Link>

          <Link
            to="/documents/new"
            search={{ type: "cv" }}
            className="group shadow-soft rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <Briefcase className="size-5" />
              </div>
              <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold font-display text-foreground">Profissional</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Currículos e cartas de candidatura</p>
            </div>
          </Link>

          <Link
            to="/documents/new"
            search={{ type: "request" }}
            className="group shadow-soft rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <FileSignature className="size-5" />
              </div>
              <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold font-display text-foreground">Administrativo</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Requerimentos e declarações</p>
            </div>
          </Link>

          <Link
            to="/documents/new"
            search={{ type: "other" }}
            className="group shadow-soft rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="flex size-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                <FileCode2 className="size-5" />
              </div>
              <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold font-display text-foreground">Personalizado</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Formatos sob medida & outros</p>
            </div>
          </Link>
        </div>
      </section>

      {/* SECÇÃO: Documentos Recentes */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Documentos Recentes</h2>
            <p className="text-xs text-muted-foreground">Continue o trabalho onde parou ou descarregue versões concluídas.</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-xl text-primary font-semibold text-xs gap-1">
            <Link to="/documents">
              Ver Todos
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loadingDocs ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-44 rounded-2xl" />)
          ) : documents && documents.length > 0 ? (
            documents.map((doc) => <DocumentCard key={doc.id} doc={doc} country={country} />)
          ) : (
            <div className="shadow-soft col-span-full rounded-3xl border border-dashed border-border/80 bg-card/80 p-8 sm:p-10 text-center space-y-6">
              <div className="max-w-md mx-auto space-y-2">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-1">
                  <Sparkles className="size-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">Comece o seu primeiro documento</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Escolha um dos modelos mais utilizados ou abra o estúdio completo para criar qualquer documento profissional.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto text-left">
                <Link
                  to="/documents/new"
                  search={{ type: "cv" }}
                  className="rounded-2xl border border-border/80 bg-background p-4 hover:border-primary/50 transition-all hover:-translate-y-0.5 shadow-xs space-y-2 group"
                >
                  <span className="inline-block rounded-lg bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                    <Briefcase className="size-4" />
                  </span>
                  <h4 className="text-xs font-bold font-display text-foreground">Currículo Vitae (CV)</h4>
                  <p className="text-[11px] text-muted-foreground leading-tight">Formatos modernos com exportação em PDF/Word.</p>
                </Link>

                <Link
                  to="/documents/new"
                  search={{ type: "cover_letter" }}
                  className="rounded-2xl border border-border/80 bg-background p-4 hover:border-primary/50 transition-all hover:-translate-y-0.5 shadow-xs space-y-2 group"
                >
                  <span className="inline-block rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                    <FileText className="size-4" />
                  </span>
                  <h4 className="text-xs font-bold font-display text-foreground">Carta de Apresentação</h4>
                  <p className="text-[11px] text-muted-foreground leading-tight">Discurso persuasivo para candidaturas de emprego.</p>
                </Link>

                <Link
                  to="/documents/new"
                  search={{ type: "request" }}
                  className="rounded-2xl border border-border/80 bg-background p-4 hover:border-primary/50 transition-all hover:-translate-y-0.5 shadow-xs space-y-2 group"
                >
                  <span className="inline-block rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                    <FileSignature className="size-4" />
                  </span>
                  <h4 className="text-xs font-bold font-display text-foreground">Requerimento Oficial</h4>
                  <p className="text-[11px] text-muted-foreground leading-tight">Pedidos formais para universidades e instituições.</p>
                </Link>
              </div>

              <Button asChild className="rounded-xl h-11 px-6 text-xs font-bold shadow-soft">
                <Link to="/documents/new">
                  <FilePlus2 className="mr-2 size-4" />
                  Abrir Estúdio Completo de Documentos
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
