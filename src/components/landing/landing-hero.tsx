import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { useLanguage } from "@/lib/landing-i18n";
import { InteractiveFlow } from "./interactive-flow";

export function LandingHero() {
  const { user } = useSession();
  const { t } = useLanguage();

  return (
    <section id="produto" className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-20">
      {/* Subtle background glow */}
      <div className="glow-backdrop pointer-events-none absolute inset-x-0 top-0 h-[500px] opacity-40" />

      <div className="relative mx-auto max-w-6xl px-5">
        {/* Simple & Clear Headline */}
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary animate-fade-in shadow-xs">
            <Sparkles className="size-3.5 text-primary" />
            <span className="tracking-wide uppercase text-[11px] font-bold">
              {t.hero.badge}
            </span>
          </div>

          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-[1.08] text-foreground">
            {t.hero.titleStart} <span className="text-gradient-brand">{t.hero.titleGradient}</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-normal">
            {t.hero.subtitle}
          </p>

          <div className="pt-2 flex justify-center">
            {user ? (
              <Button
                asChild
                size="lg"
                className="h-13 rounded-2xl px-8 text-sm font-bold shadow-glow gap-2"
              >
                <Link to="/dashboard">
                  {t.hero.myDashboard}
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
                  {t.hero.cta}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Product Interface Showcase */}
        <div className="mt-12 md:mt-16">
          <InteractiveFlow />
        </div>
      </div>
    </section>
  );
}
