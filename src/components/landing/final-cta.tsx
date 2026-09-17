import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";

export function FinalCTA() {
  const { user } = useSession();

  return (
    <section className="py-16 md:py-20 bg-background relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-5">
        <div className="gradient-brand shadow-glow relative overflow-hidden rounded-3xl px-6 py-12 md:py-16 text-center text-brand-foreground">
          <Sparkles className="absolute -top-6 -right-6 size-36 opacity-15 pointer-events-none" />
          <Sparkles className="absolute -bottom-10 -left-10 size-40 opacity-10 pointer-events-none" />

          <div className="relative mx-auto max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-5">
              <Sparkles className="size-3.5" />
              <span>Experimente Gratuitamente</span>
            </div>

            <h2 className="font-display text-3xl font-extrabold sm:text-4xl md:text-5xl leading-tight tracking-tight">
              Pronto para criar o seu primeiro documento em minutos?
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm sm:text-base opacity-90 leading-relaxed">
              Crie a sua conta em menos de 30 segundos, receba créditos de boas-vindas e descarregue o seu ficheiro em Word ou PDF.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {user ? (
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="h-13 w-full rounded-2xl px-8 text-sm font-bold sm:w-auto shadow-md gap-2"
                >
                  <Link to="/dashboard">
                    Ir para o Meu Painel
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="h-13 w-full rounded-2xl px-8 text-sm font-bold sm:w-auto shadow-md gap-2"
                >
                  <Link to="/auth">
                    Começar Gratuitamente Agora
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs opacity-85 font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="size-3.5 stroke-[2.5]" /> Créditos grátis incluídos
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-3.5 stroke-[2.5]" /> Sem cartão de crédito
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-3.5 stroke-[2.5]" /> Exportação Word (.docx) e PDF
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
