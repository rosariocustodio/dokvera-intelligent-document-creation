import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { InteractiveFlow } from "./interactive-flow";

export function LandingHero() {
  const { user } = useSession();

  return (
    <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-20">
      {/* Subtle background glow */}
      <div className="glow-backdrop pointer-events-none absolute inset-x-0 top-0 h-[600px] opacity-50" />

      <div className="relative mx-auto max-w-6xl px-5">
        {/* Narrative Headline Block */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6 animate-fade-in shadow-xs backdrop-blur-md">
            <Sparkles className="size-3.5 text-primary" />
            <span className="tracking-wide uppercase text-[11px] font-bold">
              Criador Inteligente de Documentos
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08]">
            Documentos perfeitos.{" "}
            <span className="text-gradient-brand">Sem perder horas no Word.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-5 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            O Dokvera organiza a sua ideia em estrutura formal, aplica normas de formatação e entrega o ficheiro pronto para descarregar em Microsoft Word (.docx) ou PDF.
          </p>

          {/* Single Focused CTA */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            {user ? (
              <Button
                asChild
                size="lg"
                className="h-13 w-full rounded-2xl px-8 text-sm font-bold shadow-glow sm:w-auto gap-2"
              >
                <Link to="/dashboard">
                  Aceder ao Meu Painel
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                size="lg"
                className="h-13 w-full rounded-2xl px-8 text-sm font-bold shadow-glow sm:w-auto gap-2"
              >
                <Link to="/auth">
                  Começar Gratuitamente
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          </div>

          {/* Trust points */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-500 stroke-[2.5]" />
              Créditos grátis de boas-vindas
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-500 stroke-[2.5]" />
              Ficheiros Word (.docx) e PDF 100% editáveis
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-500 stroke-[2.5]" />
              Sem cartão de crédito necessário
            </span>
          </div>
        </div>

        {/* Embedded Interactive 3-Tab Showcase */}
        <div className="mt-12 md:mt-16">
          <InteractiveFlow />
        </div>
      </div>
    </section>
  );
}
