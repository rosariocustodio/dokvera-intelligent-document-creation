import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Coins, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/hooks/use-session";
import { creditsQuery } from "@/lib/queries";
import {
  CREDIT_PACKS,
  CREDIT_PRICE_MZN,
  DOCUMENT_TYPES,
  creditsToMzn,
  formatMzn,
  packPriceMzn,
  packTotalCredits,
} from "@/lib/dokvera";

export const Route = createFileRoute("/_authenticated/credits")({
  head: () => ({
    meta: [
      { title: "Créditos — Dokvera" },
      { name: "description", content: "Gere o teu saldo de créditos Dokvera. 1 crédito = 55 MT." },
      { property: "og:title", content: "Créditos — Dokvera" },
      { property: "og:description", content: "Saldo e pacotes de créditos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CreditsPage,
});

function CreditsPage() {
  const { user } = useSession();
  const userId = user?.id ?? "";
  const { data: balance } = useQuery({ ...creditsQuery(userId), enabled: Boolean(userId) });
  const credits = balance ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Créditos"
        subtitle={`Cada crédito vale ${formatMzn(CREDIT_PRICE_MZN)}. Todos os valores são calculados pelo sistema.`}
      />

      <div className="gradient-brand shadow-glow rounded-3xl p-7 text-brand-foreground">
        <p className="text-xs font-medium uppercase tracking-[0.16em] opacity-85">Saldo actual</p>
        <p className="mt-3 font-display text-5xl font-extrabold">{credits}</p>
        <p className="mt-2 text-sm opacity-90">
          {credits} × {formatMzn(CREDIT_PRICE_MZN)} ={" "}
          <strong className="font-semibold">{formatMzn(creditsToMzn(credits))}</strong>
        </p>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold">Pacotes de créditos</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          {CREDIT_PACKS.map((p) => (
            <div
              key={p.id}
              className={
                p.highlight
                  ? "shadow-elevated relative rounded-3xl border-2 border-primary/60 bg-card p-7"
                  : "shadow-soft rounded-3xl border border-border/70 bg-card p-7"
              }
            >
              {p.highlight ? (
                <Badge className="absolute -top-3 left-7 rounded-full">Mais popular</Badge>
              ) : null}
              <h3 className="text-base font-semibold">{p.name}</h3>
              <p className="mt-3 font-display text-3xl font-extrabold">
                {formatMzn(packPriceMzn(p))}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {packTotalCredits(p)} créditos
                {p.bonus > 0 ? ` (${p.credits} + ${p.bonus} bónus)` : ""}
              </p>
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    {perk}
                  </li>
                ))}
              </ul>
              <Button
                variant={p.highlight ? "default" : "outline"}
                className="mt-6 h-11 w-full rounded-xl"
                onClick={() =>
                  toast.info("Pagamentos em breve", {
                    description: "A compra de créditos será activada na próxima fase do Dokvera.",
                  })
                }
              >
                <Coins className="mr-1.5 size-4" />
                Comprar
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="shadow-soft rounded-3xl border border-border/70 bg-card p-6">
        <h2 className="font-display text-lg font-semibold">Custo por tipo de documento</h2>
        <ul className="mt-4 divide-y divide-border/70">
          {DOCUMENT_TYPES.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="font-medium">{t.label}</span>
              <span className="text-muted-foreground">
                {t.cost} créditos · {formatMzn(creditsToMzn(t.cost))}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          Os créditos são verificados antes de cada operação e debitados apenas na geração final do
          documento.
        </p>
      </section>
    </div>
  );
}
