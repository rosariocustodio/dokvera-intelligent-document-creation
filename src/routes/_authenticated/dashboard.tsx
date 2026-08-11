import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowRight, 
  Coins, 
  FilePlus2, 
  Files, 
  Sparkles, 
  GraduationCap, 
  BookOpen, 
  IdCard, 
  ClipboardList, 
  FileText,
  Zap,
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/use-session";
import { creditsQuery, documentsQuery } from "@/lib/queries";
import { CREDIT_PRICE_MZN, creditsToMzn, formatMzn, CREDIT_PACKS, packPriceMzn, packTotalCredits } from "@/lib/dokvera";
import { DocumentCard } from "@/components/document-card";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Dokvera" },
      { name: "description", content: "O teu painel de controlo central no Dokvera." },
      { property: "og:title", content: "Dashboard — Dokvera" },
      { property: "og:description", content: "Saldo, documentos recentes e atalhos rápidos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const QUICK_TYPES = [
  { id: "academic", label: "Trabalho Académico", icon: GraduationCap, cost: "A partir de 5 cr" },
  { id: "school", label: "Trabalho Escolar", icon: BookOpen, cost: "4 cr" },
  { id: "cv", label: "CV Profissional", icon: IdCard, cost: "3 cr" },
  { id: "report", label: "Relatório", icon: ClipboardList, cost: "6 cr" },
  { id: "summary", label: "Resumo", icon: FileText, cost: "2 cr" },
];

function Dashboard() {
  const { user } = useSession();
  const userId = user?.id ?? "";
  
  const { data: balance, isLoading: loadingCredits, error: creditsError } = useQuery({
    ...creditsQuery(userId),
    enabled: Boolean(userId),
  });
  
  const { data: documents, isLoading: loadingDocs, error: docsError } = useQuery({
    ...documentsQuery(userId, 6),
    enabled: Boolean(userId),
  });

  const credits = balance ?? 0;

  return (
    <div className="space-y-10 pb-12">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da tua conta, saldo de créditos e atalhos de criação."
      />

      {/* SECÇÃO PRINCIPAL: SALDO E MÉTRICAS */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cartão Principal de Créditos */}
        <div className="gradient-brand shadow-glow relative overflow-hidden rounded-3xl p-8 text-brand-foreground lg:col-span-2 flex flex-col justify-between">
          <Sparkles className="animate-float absolute -right-4 -top-4 size-32 opacity-15 pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-foreground/15 px-3 py-1 text-xs font-medium uppercase tracking-wider backdrop-blur-md">
                <Zap className="size-3.5" /> Conta Ativa
              </span>
              <span className="text-xs opacity-80">1 crédito = {formatMzn(CREDIT_PRICE_MZN)}</span>
            </div>

            <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] opacity-80">
              Saldo actual disponível
            </p>

            {loadingCredits ? (
              <Skeleton className="mt-3 h-16 w-48 bg-brand-foreground/20 rounded-2xl" />
            ) : creditsError ? (
              <p className="mt-3 text-sm text-destructive-foreground">Erro ao carregar saldo.</p>
            ) : (
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-display text-5xl font-extrabold tracking-tight md:text-6xl">
                  {credits}
                </span>
                <span className="text-xl font-medium opacity-90">
                  {credits === 1 ? "crédito" : "créditos"}
                </span>
              </div>
            )}

            <p className="mt-2 text-sm opacity-90">
              Equivalente a <strong className="font-semibold underline decoration-brand-foreground/40">{formatMzn(creditsToMzn(credits))}</strong> controlados pelo sistema.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 pt-6 border-t border-brand-foreground/15">
            <Button asChild variant="secondary" className="h-11 rounded-xl px-5 font-medium shadow-sm transition-all hover:scale-[1.02]">
              <Link to="/documents/new">
                <FilePlus2 className="mr-2 size-4 text-primary" />
                Criar novo documento
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border-brand-foreground/30 bg-transparent px-5 text-brand-foreground hover:bg-brand-foreground/10 transition-all"
            >
              <Link to="/credits">
                <Coins className="mr-2 size-4" />
                Recarregar créditos
              </Link>
            </Button>
          </div>
        </div>

        {/* Blocos Laterais de Resumo */}
        <div className="grid gap-5">
          <div className="shadow-soft rounded-3xl border border-border/70 bg-card p-6 flex flex-col justify-between transition-all hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Files className="size-5" />
              </span>
              <Badge variant="outline" className="rounded-full text-[11px]">Total</Badge>
            </div>
            <div className="mt-4">
              <p className="font-display text-3xl font-bold tracking-tight">
                {loadingDocs ? "—" : (documents?.length ?? 0)}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">Documentos gerados ou em rascunho</p>
            </div>
          </div>

          <div className="shadow-soft rounded-3xl border border-border/70 bg-card p-6 flex flex-col justify-between transition-all hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-success/10 text-success">
                <TrendingUp className="size-5" />
              </span>
              <Badge variant="secondary" className="rounded-full text-[11px]">Taxa fixa</Badge>
            </div>
            <div className="mt-4">
              <p className="font-display text-2xl font-bold tracking-tight">{formatMzn(CREDIT_PRICE_MZN)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Preço estável por crédito em Meticais</p>
            </div>
          </div>
        </div>
      </div>

      {/* ATALHOS RÁPIDOS PARA TIPOS DE DOCUMENTOS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold tracking-tight">O que queres criar hoje?</h2>
          <span className="text-xs text-muted-foreground">Escolha rápida</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {QUICK_TYPES.map((t) => {
            const IconComponent = t.icon;
            return (
              <Link
                key={t.id}
                to="/documents/new"
                className="group shadow-soft flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
              >
                <div>
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <IconComponent className="size-5" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {t.label}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                  <span>{t.cost}</span>
                  <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-primary" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* DOCUMENTOS RECENTES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">Documentos recentes</h2>
            <p className="text-xs text-muted-foreground">Aceda rapidamente aos seus últimos trabalhos em curso.</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs font-medium hover:bg-primary/10">
            <Link to="/documents">
              Ver todos
              <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loadingDocs ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-44 rounded-2xl" />)
          </i>docsError ? (
            <div className="col-span-full rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive text-sm">
              Erro ao carregar documentos recentes. Tente atualizar a página.
            </div>
          ) : documents && documents.length > 0 ? (
            documents.map((doc) => <DocumentCard key={doc.id} doc={doc} />)
          ) : (
            <div className="shadow-soft col-span-full rounded-3xl border border-dashed border-border/80 bg-card p-12 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <FileText className="size-6" />
              </div>
              <p className="mt-4 font-semibold text-base">Ainda não tens documentos criados</p>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
                Começa agora a estruturar o teu primeiro trabalho académico, relatório ou currículo com o Dokvera.
              </p>
              <Button asChild className="mt-6 rounded-xl shadow-sm">
                <Link to="/documents/new">
                  <FilePlus2 className="mr-2 size-4" />
                  Criar o meu primeiro documento
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* SECÇÃO DE PACOTES DE CRÉDITOS EM DESTAQUE */}
      <section className="space-y-4 pt-4 border-t border-border/50">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Recarga rápida</span>
            <h2 className="font-display text-xl font-bold tracking-tight">Precisa de mais créditos?</h2>
          </div>
          <p className="text-xs text-muted-foreground">Escolha o pacote ideal com base na tabela oficial de 55 MT por crédito.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {CREDIT_PACKS.map((pack) => {
            const totalCr = packTotalCredits(pack);
            const price = packPriceMzn(pack);
            return (
              <div 
                key={pack.id} 
                className={`shadow-soft relative flex flex-col justify-between rounded-3xl border p-6 transition-all duration-300 bg-card ${
                  pack.highlight ? "border-primary shadow-md ring-1 ring-primary/20" : "border-border/70 hover:border-border"
                }`}
              >
                {pack.highlight && (
                  <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm">
                    Mais Popular
                  </span>
                )}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-bold">{pack.name}</h3>
                    <Badge variant="secondary" className="rounded-full text-xs font-semibold">
                      {totalCr} créditos {pack.bonus > 0 ? `(+${pack.bonus} bónus)` : ""}
                    </Badge>
                  </div>
                  <p className="mt-4 font-display text-3xl font-extrabold tracking-tight">
                    {formatMzn(price)}
                  </p>
                  
                  <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
                    {pack.perks.map((perk, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-primary shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-border/50">
                  <Button asChild variant={pack.highlight ? "default" : "outline"} className="w-full rounded-xl">
                    <Link to="/credits">
                      Adquirir pacote
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
