import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { InteractiveFlow } from "./interactive-flow";

export function LandingHero() {
  const { user } = useSession();

  return (
    <section id="produto" className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      {/* Subtle background glow */}
      <div className="glow-backdrop pointer-events-none absolute inset-x-0 top-0 h-[500px] opacity-40" />

      <div className="relative mx-auto max-w-6xl px-5">
        {/* Simple & Strong Headline */}
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary animate-fade-in shadow-xs">
            <Sparkles className="size-3.5 text-primary" />
            <span className="tracking-wide uppercase text-[11px] font-bold">
              Estúdio de Engenharia Documental
            </span>
          </div>

          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-[1.08] text-foreground">
            Crie qualquer documento <span className="text-gradient-brand">com IA.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-normal">
            Estruture e formate trabalhos académicos, relatórios executivos e currículos em minutos. Sem começar do zero e sem perder horas no Word.
          </p>

          <div className="pt-2 flex justify-center">
            {user ? (
              <Button
                asChild
                size="lg"
                className="h-13 rounded-2xl px-8 text-sm font-bold shadow-glow gap-2"
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
                className="h-13 rounded-2xl px-8 text-sm font-bold shadow-glow gap-2"
              >
                <Link to="/auth">
                  Começar grátis
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Product UI / App Interface Preview */}
        <div className="mt-14 md:mt-20">
          <InteractiveFlow />
        </div>
      </div>
    </section>
  );
}
