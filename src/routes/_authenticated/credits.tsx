import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Coins, Info, Zap, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/hooks/use-session";
import { creditsQuery, profileQuery } from "@/lib/queries";
import { getCountryConfig } from "@/lib/countries";
import {
  CREDIT_PACKS,
  DOCUMENT_TYPES,
  creditsToCurrency,
  formatCurrency,
  packPriceInCountry,
  packTotalCredits,
} from "@/lib/dokvera";

export const Route = createFileRoute("/_authenticated/credits")({
  head: () => ({
    meta: [
      { title: "Créditos e Assinaturas — Dokvera" },
      { name: "description", content: "Gerencie o seu saldo avulso ou assine o plano mensal profissional para documentos ilimitados." },
      { property: "og:title", content: "Créditos e Assinaturas — Dokvera" },
      { property: "og:description", content: "Planos e pacotes de créditos Dokvera." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CreditsPage,
});

function CreditsPage() {
  const { user } = useSession();
  const userId = user?.id ?? "";
  const { data: balance } = useQuery({ ...creditsQuery(userId), enabled: Boolean(userId) });
  const { data: profile } = useQuery({ ...profileQuery(userId), enabled: Boolean(userId) });
  const credits = balance ?? 0;
  const country = profile?.country;
  const countryConfig = getCountryConfig(country);

  // Estado para custom credit input (A partir de 1 crédito)
  const [customCredits, setCustomCredits] = useState<number>(5);
  const minCredits = 1;
  const customPrice = creditsToCurrency(customCredits, country);

  return (
    <div className="space-y-10 pb-12">
      <PageHeader
        title="Créditos & Assinaturas"
        subtitle="Adquira créditos avulsos a partir de 1 unidade para cartas e ofícios, ou escolha o plano mensal profissional."
      />

      {/* Cartão de Saldo Atual */}
      <div className="gradient-brand shadow-glow relative overflow-hidden rounded-3xl p-7 text-brand-foreground">
        <Sparkles className="animate-float absolute -right-4 -top-4 size-28 opacity-15" />
        <p className="text-xs font-medium uppercase tracking-[0.16em] opacity-85">Saldo actual na conta</p>
        <div className="mt-3 flex items-baseline gap-3">
          <p className="font-display text-5xl font-extrabold">{credits}</p>
          <span className="text-lg font-semibold opacity-85">
            {credits === 1 ? "crédito disponível" : "créditos disponíveis"}
          </span>
        </div>
        <p className="mt-2 text-sm opacity-90">
          Equivalente a <strong className="font-semibold">{formatCurrency(creditsToCurrency(credits, country), country)}</strong> calculados automaticamente pelo sistema.
        </p>
      </div>

      {/* NOVA FUNCIONALIDADE 1: Depósito Flexível a partir de 1 Crédito (Ideal para Cartas/Ofícios rápidos) */}
      <section className="shadow-soft rounded-3xl border border-border/70 bg-card p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Zap className="size-3.5" /> Recarga Flexível Avulsa
            </span>
            <h2 className="mt-3 font-display text-xl font-bold">Precisa de apenas uma carta ou documento pontual?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Compre exatamente o que precisa, a partir de 1 crédito ({formatCurrency(countryConfig.creditPrice, country)} por unidade). Sem mensalidades obrigatórias.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-muted/40 p-4 rounded-2xl border border-border/50">
            <div className="flex items-center gap-3">
              <label htmlFor="custom-credits" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Qtd:
              </label>
              <input
                id="custom-credits"
                type="number"
                min={minCredits}
                max={100}
                value={customCredits}
                onChange={(e) => setCustomCredits(Math.max(minCredits, parseInt(e.target.value) || minCredits))}
                className="h-11 w-20 rounded-xl border border-border bg-background px-3 text-center font-display font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="text-right sm:text-left min-w-[110px]">
              <p className="text-xs text-muted-foreground">Total a pagar</p>
              <p className="font-display text-lg font-bold text-primary">{formatCurrency(customPrice, country)}</p>
            </div>
            <Button
              className="h-11 rounded-xl px-6 font-medium shadow-sm w-full sm:w-auto"
              onClick={() =>
                toast.success("Processando recarga flexível", {
                  description: `A solicitar ${customCredits} ${customCredits === 1 ? 'crédito' : 'créditos'} no valor de ${formatCurrency(customPrice, country)}.`,
                })
              }
            >
              Comprar {customCredits} {customCredits === 1 ? 'Crédito' : 'Créditos'}
            </Button>
          </div>
        </div>
      </section>

      {/* NOVA FUNCIONALIDADE 2: Plano Mensal Profissional (Para utilizadores frequentes) */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Assinaturas e Planos Profissionais</h2>
            <p className="text-sm text-muted-foreground">Ideal para escritórios, consultores e estudantes finalistas que exigem alto volume.</p>
          </div>
        </div>

        <div className="shadow-elevated relative rounded-3xl border-2 border-primary bg-card p-8 overflow-hidden">
          <Badge className="absolute top-6 right-6 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider">
            Recomendado para Profissionais
          </Badge>
          <div className="max-w-2xl">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary mb-4">
              <ShieldCheck className="size-6" />
            </span>
            <h3 className="font-display text-2xl font-bold">Plano Mensal Pro Dokvera</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Acesso contínuo sem preocupações com saldo a esgotar. Inclui prioridade máxima de processamento e suporte dedicado.
            </p>
            
            <div className="mt-6 flex items-baseline gap-2">
              <span className="font-display text-4xl font-extrabold">{formatCurrency(countryConfig.monthlyProPrice, country)}</span>
              <span className="text-sm text-muted-foreground font-medium">/ mês (Créditos mensais generosos incluídos)</span>
            </div>

            <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-success" /> Geração ilimitada de cartas e ofícios
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-success" /> 50 Créditos mensais dedicados a trabalhos complexos
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-success" /> Prioridade na fila de processamento de IA
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-success" /> Suporte técnico prioritário via WhatsApp
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                className="h-12 rounded-xl px-8 font-medium shadow-md"
                onClick={() =>
                  toast.info("Subscrição Mensal", {
                    description: "O sistema de subscrições mensais automáticas estará disponível em breve.",
                  })
                }
              >
                Subscriver Plano Mensal Pro <ArrowRight className="ml-2 size-4" />
              </Button>
              <span className="text-xs text-muted-foreground">Pode cancelar a qualquer momento sem penalizações.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pacotes de Créditos Tradicionais */}
      <section>
        <div className="mb-5">
          <h2 className="font-display text-xl font-semibold">Pacotes de créditos populares</h2>
          <p className="text-sm text-muted-foreground">Escolha um pacote com bónus integrado para poupar.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {CREDIT_PACKS.map((p) => (
            <div
              key={p.id}
              className={
                p.highlight
                  ? "shadow-elevated relative rounded-3xl border-2 border-primary/60 bg-card p-7 flex flex-col justify-between"
                  : "shadow-soft rounded-3xl border border-border/70 bg-card p-7 flex flex-col justify-between"
              }
            >
              <div>
                {p.highlight ? (
                  <Badge className="absolute -top-3 left-7 rounded-full">Mais popular</Badge>
                ) : null}
                <h3 className="text-base font-semibold">{p.name}</h3>
                <p className="mt-3 font-display text-3xl font-extrabold">
                  {formatCurrency(packPriceInCountry(p, country), country)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {packTotalCredits(p)} créditos
                  {(p.bonus ?? 0) > 0 ? ` (${p.credits} + ${(p.bonus ?? 0)} bónus)` : ""}
                </p>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                variant={p.highlight ? "default" : "outline"}
                className="mt-8 h-11 w-full rounded-xl font-medium shadow-sm transition-all hover:scale-[1.01]"
                onClick={() =>
                  toast.info("Pagamentos em breve", {
                    description: `A compra do pacote ${p.name} será ativada na próxima fase do Dokvera.`,
                  })
                }
              >
                <Coins className="mr-1.5 size-4" />
                Adquirir Pacote
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* NOVA FUNCIONALIDADE 3: Histórico Rápido de Custos & FAQ / Transparência de Preços */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="shadow-soft rounded-3xl border border-border/70 bg-card p-7 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Tabela de Custo por Documento</h2>
            <p className="mt-1 text-xs text-muted-foreground">Transparência total nos descontos por operação.</p>
            <ul className="mt-4 divide-y divide-border/70">
              {DOCUMENT_TYPES.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="font-medium">{t.label}</span>
                  <span className="text-muted-foreground font-semibold">
                    {t.cost} {t.cost === 1 ? 'crédito' : 'créditos'} · {formatCurrency(creditsToCurrency(t.cost, country), country)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-6 flex items-start gap-2 text-xs text-muted-foreground pt-4 border-t border-border/50">
            <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Os créditos apenas são debitados após a confirmação e geração final bem-sucedida do documento.
          </p>
        </section>

        {/* Simulador de Poupança / Vantagens do Sistema */}
        <section className="shadow-soft rounded-3xl border border-border/70 bg-card p-7 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Garantia e Segurança Dokvera</h2>
            <p className="mt-1 text-xs text-muted-foreground">Porque confiar na nossa plataforma de automação.</p>
            
            <div className="mt-5 space-y-4">
              <div className="flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Cálculos Independentes</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Os valores e preços são geridos de forma estática pelo sistema e nunca manipulados por modelos de inteligência artificial.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Reembolso Automático em Falhas</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Se ocorrer algum erro técnico imprevisto durante a geração, o crédito é devolvido instantaneamente à sua conta.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Validade Permanente</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Os créditos avulsos adquiridos nunca expiram. Use-os sempre que precisar, ao seu próprio ritmo.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/50 text-xs text-muted-foreground text-center">
            Precisa de fatura com NUIT para empresa ou instituição? Contacte o nosso suporte.
          </div>
        </section>
      </div>
    </div>
  );
}
