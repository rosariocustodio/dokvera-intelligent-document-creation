import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Coins, Info, Zap, ShieldCheck } from "lucide-react";
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
      { title: "Créditos e Planos — Dokvera" },
      { name: "description", content: "Gerencie o seu saldo de créditos ou assine o plano mensal profissional no Dokvera." },
      { property: "og:title", content: "Créditos e Planos — Dokvera" },
      { property: "og:description", content: "Recarregue créditos por unidade ou escolha o plano mensal." },
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
    <div className="space-y-10">
      <PageHeader
        title="Créditos e Subscrição"
        subtitle="Escolha pacotes flexíveis por crédito para cartas e documentos pontuais, ou o plano mensal ideal para profissionais."
      />

      {/* Cartão de Saldo Actual */}
      <div className="gradient-brand shadow-glow relative overflow-hidden rounded-3xl p-7 text-brand-foreground">
        <div className="absolute -right-4 -top-4 size-28 opacity-15 flex items-center justify-center">
          <Coins className="size-24" />
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] opacity-85">Saldo actual disponível</p>
        <div className="mt-3 flex items-baseline gap-3">
          <p className="font-display text-5xl font-extrabold tracking-tight">{credits}</p>
          <span className="text-lg font-semibold opacity-85">
            {credits === 1 ? "crédito" : "créditos"} ({formatMzn(creditsToMzn(credits))})
          </span>
        </div>
        <p className="mt-2 text-sm opacity-90 max-w-xl">
          Cada crédito base custa {formatMzn(CREDIT_PRICE_MZN)}. Ideal para gerar cartas, requerimentos e relatórios com total precisão.
        </p>
      </div>

      {/* Plano Mensal para Profissionais */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Plano Profissional Mensal</h2>
            <p className="text-sm text-muted-foreground">Para utilizadores avançados, consultores e secretarias que geram documentos regularmente.</p>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex rounded-full border-primary/40 text-primary bg-primary/5 px-3 py-1 font-medium text-xs">
            Recomendado para Empresas
          </Badge>
        </div>

        <div className="mt-5 shadow-soft rounded-3xl border-2 border-primary/40 bg-card p-8 relative overflow-hidden transition-all duration-300 hover:border-primary/70">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
            Subscrição Mensal
          </div>
          
          <div className="grid gap-6 md:grid-cols-3 md:items-center">
            <div className="md:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm">
                <Zap className="size-4 fill-primary" />
                Dokvera Pro Ilimitado / Mensal
              </div>
              <h3 className="font-display text-2xl font-bold tracking-tight">Geração contínua sem preocupações</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Obtenha créditos recorrentes todos os meses, prioridade máxima nos servidores de processamento de inteligência artificial e suporte dedicado para formatações complexas.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-success" /> Sem fidelização</span>
                <span className="flex items-center gap-1.5"><Check className="size-4 text-success" /> Cancelamento a qualquer momento</span>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end justify-center border-t md:border-t-0 md:border-l border-border/70 pt-6 md:pt-0 md:pl-6">
              <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Investimento</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-display text-3xl font-extrabold">{formatMzn(1650)}</span>
                <span className="text-xs text-muted-foreground">/ mês</span>
              </div>
              <Button
                className="mt-5 h-12 w-full md:w-auto rounded-xl px-8 shadow-md font-medium transition-transform active:scale-95"
                onClick={() =>
                  toast.info("Subscrições mensais em breve", {
                    description: "O plano profissional mensal será activado na próxima actualização do sistema.",
                  })
                }
              >
                <Zap className="mr-2 size-4" />
                Subcrever Plano Pro
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pacotes de Créditos por Unidade (A partir de 1 crédito) */}
      <section className="pt-2">
        <div>
          <h2 className="font-display text-xl font-semibold">Pacotes de créditos avulsos</h2>
          <p className="text-sm text-muted-foreground">Adquira exatamente a quantidade que precisa, a partir de apenas 1 crédito para cartas rápidas.</p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {CREDIT_PACKS.map((p) => (
            <div
              key={p.id}
              className={
                p.highlight
                  ? "shadow-elevated relative rounded-3xl border-2 border-primary/60 bg-card p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
                  : "shadow-soft rounded-3xl border border-border/70 bg-card p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
              }
            >
              {p.highlight ? (
                <Badge className="absolute -top-3 left-7 rounded-full px-3 py-0.5 bg-primary text-primary-foreground font-medium text-xs shadow-sm">
                  Mais popular
                </Badge>
              ) : null}
              
              <div>
                <h3 className="text-base font-semibold">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-extrabold">
                    {formatMzn(packPriceMzn(p))}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground font-medium">
                  {packTotalCredits(p)} {packTotalCredits(p) === 1 ? "crédito" : "créditos"}
                  {p.bonus > 0 ? ` (${p.credits} + ${p.bonus} bónus)` : ""}
                </p>

                <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground border-t border-border/50 pt-5">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant={p.highlight ? "default" : "outline"}
                className={
                  p.highlight
                    ? "mt-8 h-12 w-full rounded-xl shadow-md font-medium transition-transform active:scale-95"
                    : "mt-8 h-12 w-full rounded-xl border-border/80 font-medium hover:bg-muted/50 transition-transform active:scale-95"
                }
                onClick={() =>
                  toast.info("Pagamentos em breve", {
                    description: "A compra avulsa de créditos será activada na próxima fase do Dokvera.",
                  })
                }
              >
                <Coins className="mr-2 size-4" />
                Comprar pacote
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Tabela de Custos por Tipo de Documento */}
      <section className="shadow-soft rounded-3xl border border-border/70 bg-card p-7">
        <h2 className="font-display text-lg font-semibold">Custo por tipo de documento</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Saiba exatamente quantos créditos cada formato consome antes de gerar.</p>
        
        <ul className="mt-5 divide-y divide-border/70">
          {DOCUMENT_TYPES.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 py-3.5 text-sm">
              <span className="font-medium text-foreground">{t.label}</span>
              <span className="font-medium text-primary bg-primary/5 px-3 py-1 rounded-lg text-xs">
                {t.cost} {t.cost === 1 ? "crédito" : "créditos"} · {formatMzn(creditsToMzn(t.cost))}
              </span>
            </li>
          ))}
        </ul>
        
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-muted/40 p-4 border border-border/50 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="leading-relaxed">
            Os créditos são validados automaticamente pelo sistema antes de cada operação e apenas debitados quando o documento é concluído com sucesso. O depósito mínimo aceite é de 1 crédito, ideal para cartas formais e requerimentos pontuais.
          </p>
        </div>
      </section>
    </div>
  );
}
