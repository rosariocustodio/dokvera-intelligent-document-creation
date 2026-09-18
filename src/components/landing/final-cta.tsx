import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";

export function FinalCTA() {
  const { user } = useSession();

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-5">
        <div className="gradient-brand shadow-glow relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center text-brand-foreground space-y-6">
          <Sparkles className="animate-float absolute -right-6 -top-6 size-36 opacity-15 pointer-events-none" />

          <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
            Pronto para criar o seu próximo documento?
          </h2>

          <p className="text-xs sm:text-base text-brand-foreground/90 max-w-xl mx-auto leading-relaxed">
            Junte-se a milhares de estudantes e profissionais que poupam horas na criação de relatórios, trabalhos e currículos.
          </p>

          <div className="pt-2 flex justify-center">
            {user ? (
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="h-12 rounded-2xl px-8 text-xs sm:text-sm font-bold shadow-sm gap-2"
              >
                <Link to="/dashboard">
                  Ir para o Meu Painel
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="h-12 rounded-2xl px-8 text-xs sm:text-sm font-bold shadow-sm gap-2"
              >
                <Link to="/auth">
                  Começar grátis
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
