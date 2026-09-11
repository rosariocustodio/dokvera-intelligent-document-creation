import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, FileText, Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { InteractiveFlow } from "./interactive-flow";

export function LandingHero() {
  const { user } = useSession();

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      {/* Background glow and subtle tech grid */}
      <div className="glow-backdrop pointer-events-none absolute inset-x-0 top-0 h-[650px] opacity-60" />
      <div className="grid-backdrop pointer-events-none absolute inset-x-0 top-0 h-[650px] opacity-35" />

      <div className="relative mx-auto max-w-6xl px-5">
        {/* Hero Narrative Block */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Top Tech Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6 animate-fade-in shadow-xs backdrop-blur-md">
            <Sparkles className="size-3.5 text-primary" />
            <span className="tracking-wide uppercase text-[11px] font-bold">
              DOCUMENTOS INTELIGENTES COM IA
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08]">
            Transforme as suas ideias em{" "}
            <span className="text-gradient-brand">documentos profissionais.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Crie, estruture e aperfeiçoe documentos completos com inteligência artificial. Do
            rascunho inicial à formatação executiva em minutos.
          </p>

          {/* CTAs */}
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
                  Começar gratuitamente
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-13 w-full rounded-2xl border-border/80 bg-background/60 px-7 text-sm font-semibold hover:bg-muted sm:w-auto gap-2 backdrop-blur-sm"
            >
              <a href="#demonstracao">
                <Play className="size-3.5 text-primary fill-primary/20" />
                Ver demonstração
              </a>
            </Button>
          </div>

          {/* Trust strip */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-500 stroke-[2.5]" />
              Sem configuração complexa
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-500 stroke-[2.5]" />
              Exportação Word (.docx) e PDF
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-500 stroke-[2.5]" />
              Pronto para uso profissional
            </span>
          </div>
        </div>

        {/* Visual Workflow Demonstration (Input -> IA -> Resultado) */}
        <div className="mt-14 md:mt-18">
          <InteractiveFlow />
        </div>
      </div>
    </section>
  );
}
