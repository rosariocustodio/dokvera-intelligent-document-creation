import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Coins, FilePlus2, Files, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import { creditsQuery, documentsQuery } from "@/lib/queries";
import { CREDIT_PRICE_MZN, creditsToMzn, formatMzn } from "@/lib/dokvera";
import { DocumentCard } from "@/components/document-card";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Dokvera" },
      { name: "description", content: "O teu saldo de créditos e documentos recentes no Dokvera." },
      { property: "og:title", content: "Dashboard — Dokvera" },
      { property: "og:description", content: "Saldo de créditos e documentos recentes." },
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Vê o teu saldo, continua um documento ou começa algo novo."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="gradient-brand shadow-glow relative overflow-hidden rounded-3xl p-7 text-brand-foreground lg:col-span-2">
          <Sparkles className="animate-float absolute -right-4 -top-4 size-28 opacity-15" />
          <p className="text-xs font-medium uppercase tracking-[0.16em] opacity-85">
            Saldo actual de créditos
          </p>
          {loadingCredits ? (
            <Skeleton className="mt-4 h-14 w-40 bg-brand-foreground/20" />
          ) : (
            <p className="mt-3 font-display text-5xl font-extrabold md:text-6xl">
              {credits}
              <span className="ml-2 text-lg font-semibold opacity-85">
                {credits === 1 ? "crédito" : "créditos"}
              </span>
            </p>
          )}
          <p className="mt-3 text-sm opacity-90">
            {credits} × {formatMzn(CREDIT_PRICE_MZN)} ={" "}
            <strong className="font-semibold">{formatMzn(creditsToMzn(credits))}</strong>
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="secondary" className="h-11 rounded-xl">
              <Link to="/documents/new">
                <FilePlus2 className="mr-1.5 size-4" />
                Criar novo documento
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border-brand-foreground/40 bg-transparent text-brand-foreground hover:bg-brand-foreground/10"
            >
              <Link to="/credits">
                <Coins className="mr-1.5 size-4" />
                Comprar créditos
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="shadow-soft rounded-3xl border border-border/70 bg-card p-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Files className="size-5" />
            </span>
            <p className="mt-4 font-display text-3xl font-bold">
              {loadingDocs ? "—" : (documents?.length ?? 0)}
            </p>
            <p className="text-sm text-muted-foreground">Documentos recentes</p>
          </div>
          <div className="shadow-soft rounded-3xl border border-border/70 bg-card p-6">
            <p className="text-sm font-semibold">Valor por crédito</p>
            <p className="mt-2 font-display text-2xl font-bold">{formatMzn(CREDIT_PRICE_MZN)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Cálculo feito pelo sistema, nunca pela IA.
            </p>
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Documentos recentes</h2>
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link to="/documents">
              Ver todos
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loadingDocs ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
          ) : documents && documents.length > 0 ? (
            documents.map((doc) => <DocumentCard key={doc.id} doc={doc} />)
          ) : (
            <div className="shadow-soft col-span-full rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <p className="font-semibold">Ainda não tens documentos</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Cria o teu primeiro documento e ele aparece aqui.
              </p>
              <Button asChild className="mt-5 rounded-xl">
                <Link to="/documents/new">
                  <FilePlus2 className="mr-1.5 size-4" />
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
