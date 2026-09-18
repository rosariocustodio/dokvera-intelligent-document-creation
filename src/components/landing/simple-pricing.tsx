import { Link } from "@tanstack/react-router";
import { Check, ArrowRight, Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";

export function SimplePricing() {
  const { user } = useSession();

  return (
    <section id="precos" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-mono uppercase font-bold text-primary tracking-widest">
            Preços Claros
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Pague apenas pelo que utilizar
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sem subscrições obrigatórias ou mensalidades fixas. Pague por documento pontual ou adquira pacotes de créditos com bónus.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto items-stretch">
          {/* Card 1: Documento Pontual */}
          <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-soft flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Pagamento Único
                </span>
                <h3 className="font-display text-xl font-bold text-foreground mt-1">
                  Documento Pontual
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ideal para quando precisa de gerar apenas um documento específico (ex.: um requerimento ou um trabalho).
              </p>
              <ul className="space-y-2.5 text-xs text-foreground pt-2">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Sem necessidade de comprar pacotes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Preço calculado na hora antes de gerar</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Exportação em Word (.docx) e PDF</span>
                </li>
              </ul>
            </div>

            <Button asChild variant="outline" className="mt-8 h-11 rounded-xl text-xs font-semibold w-full">
              <Link to={user ? "/documents/new" : "/auth"}>
                Criar Documento
              </Link>
            </Button>
          </div>

          {/* Card 2: Pacote de Créditos (Recomendado) */}
          <div className="relative rounded-3xl border-2 border-primary bg-primary/5 p-7 shadow-glow flex flex-col justify-between">
            <div className="absolute -top-3.5 right-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              Com Bónus
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono flex items-center gap-1">
                  <Coins className="size-3.5" /> Pacotes de Créditos
                </span>
                <h3 className="font-display text-xl font-bold text-foreground mt-1">
                  Carregamento Flexível
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Para estudantes e profissionais que geram documentos com frequência e querem maior poupança.
              </p>
              <ul className="space-y-2.5 text-xs text-foreground pt-2">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Créditos nunca expiram</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Bónus de créditos extras nos pacotes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Suporte prioritário e exportações ilimitadas</span>
                </li>
              </ul>
            </div>

            <Button asChild className="mt-8 h-11 rounded-xl text-xs font-bold w-full shadow-glow gap-1.5">
              <Link to={user ? "/credits" : "/auth"}>
                <Sparkles className="size-3.5" />
                Ver Pacotes de Créditos
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
