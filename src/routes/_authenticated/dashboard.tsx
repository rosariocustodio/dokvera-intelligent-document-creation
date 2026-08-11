import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Coins, FilePlus2, FileText, Sparkles, Clock, Zap, GraduationCap, Briefcase, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import { creditsQuery, documentsQuery } from "@/lib/queries";
import { creditsToMzn, formatMzn } from "@/lib/dokvera";
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
  const { data: balance, isLoading: loadingCredits } = useQuery({
    ...creditsQuery(userId),
    enabled: Boolean(userId),
  });
  const { data: documents, isLoading: loadingDocs } = useQuery({
    ...documentsQuery(userId, 6),
    enabled: Boolean(userId),
  });

  const credits = balance ?? 0;
  const totalDocs = documents?.length ?? 0;
  const draftDocs = documents?.filter((d) => d.status === "draft").length ?? 0;

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Painel Principal"
        subtitle="Gerencie os seus documentos académicos e profissionais com eficiência máxima."
      />

      {/* Secção Superior: Saldo de Créditos e Estatísticas de Produtividade */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Cartão de Créditos */}
        <div className="gradient-brand shadow-glow relative overflow-hidden rounded-3xl p-7 text-brand-foreground lg:col-span-2 flex flex-col justify-between">
          <Sparkles className="animate-float absolute -right-4 -top-4 size-28 opacity-15" />
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] opacity-85">
              Saldo Disponível
            </p>
            {loadingCredits ? (
              <Skeleton className="mt-4 h-14 w-40 bg-brand-foreground/20" />
            ) : (
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-display text-5xl font-extrabold md:text-6xl tracking-tight">
                  {credits}
                </span>
                <span className="text-lg font-semibold opacity-85">
                  {credits === 1 ? "crédito" : "créditos"} ({formatMzn(creditsToMzn(credits))})
                </span>
              </div>
            )}
            <p className="mt-2 text-sm opacity-90">
              Utilize os créditos para gerar trabalhos estruturados, cartas e relatórios formatados em segundos.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3 pt-4 border-t border-brand-foreground/15">
            <Button asChild variant="secondary" className="h-11 rounded-xl px-5 font-medium shadow-sm">
              <Link to="/documents/new">
                <FilePlus2 className="mr-2 size-4" />
                Criar novo documento
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl px-5 border-brand-foreground/40 bg-transparent text-brand-foreground hover:bg-brand-foreground/10"
            >
              <Link to="/credits">
                <Coins className="mr-2 size-4" />
                Adquirir créditos
              </Link>
            </Button>
          </div>
        </div>

        {/* Estatísticas de Utilização */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="shadow-soft rounded-3xl border border-border/70 bg-card p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Documentos Totais</p>
              <p className="mt-1 font-display text-3xl font-bold">
                {loadingDocs ? "—" : totalDocs}
              </p>
            </div>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <FileText className="size-6" />
            </span>
          </div>

          <div className="shadow-soft rounded-3xl border border-border/70 bg-card p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rascunhos Activos</p>
              <p className="mt-1 font-display text-3xl font-bold">
                {loadingDocs ? "—" : draftDocs}
              </p>
            </div>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-warning/15 text-warning-foreground">
              <Clock className="size-6 text-warning" />
            </span>
          </div>
        </div>
      </div>

      {/* NOVA SECÇÃO: Atalhos Rápidos para Categorias Populares */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Iniciar por Categoria</h2>
          <p className="text-xs text-muted-foreground">Escolha o modelo ideal e acelere a criação do seu documento.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            to="/documents/new"
            className="shadow-soft group rounded-2xl border border-border/70 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md flex items-center gap-4"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary group-hover:scale-105 transition-transform">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Académico</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Trabalhos, relatórios e monografias</p>
            </div>
          </Link>

          <Link
            to="/documents/new"
            className="shadow-soft group rounded-2xl border border-border/70 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md flex items-center gap-4"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary group-hover:scale-105 transition-transform">
              <Briefcase className="size-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Profissional</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Currículos e propostas de valor</p>
            </div>
          </Link>

          <Link
            to="/documents/new"
            className="shadow-soft group rounded-2xl border border-border/70 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md flex items-center gap-4"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary group-hover:scale-105 transition-transform">
              <FileCheck className="size-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Cartas & Ofícios</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Requerimentos e pedidos formais</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Secção de Documentos Recentes */}
      <section className="pt-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Documentos recentes</h2>
            <p className="text-sm text-muted-foreground">Aceda rapidamente aos seus trabalhos em curso.</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-xl text-primary font-medium">
            <Link to="/documents">
              Ver todos
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loadingDocs ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-44 rounded-2xl" />)
          ) : documents && documents.length > 0 ? (
            documents.map((doc) => <DocumentCard key={doc.id} doc={doc} />)
          ) : (
            <div className="shadow-soft col-span-full rounded-3xl border border-dashed border-border/80 bg-card p-12 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary mb-4">
                <FilePlus2 className="size-6" />
              </div>
              <p className="font-display text-lg font-semibold">Ainda não tem documentos criados</p>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
                Inicie o seu primeiro documento académico ou profissional para começar.
              </p>
              <Button asChild className="mt-6 rounded-xl h-11 px-6">
                <Link to="/documents/new">
                  <FilePlus2 className="mr-2 size-4" />
                  Criar novo documento
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
