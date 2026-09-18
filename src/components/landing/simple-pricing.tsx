import { Link } from "@tanstack/react-router";
import { Check, Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { useLanguage } from "@/lib/landing-i18n";

export function SimplePricing() {
  const { user } = useSession();
  const { t } = useLanguage();

  return (
    <section id="precos" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-mono uppercase font-bold text-primary tracking-widest">
            {t.pricing.tagline}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {t.pricing.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.pricing.subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto items-stretch">
          {/* Card 1: Documento Pontual */}
          <div className="rounded-3xl border border-border/70 bg-card p-7 shadow-soft flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  {t.pricing.singleTitle}
                </span>
                <h3 className="font-display text-xl font-bold text-foreground mt-1">
                  Pay Per Document
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.pricing.singleDesc}
              </p>
              <ul className="space-y-2.5 text-xs text-foreground pt-2">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>{t.pricing.singleF1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>{t.pricing.singleF2}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>{t.pricing.singleF3}</span>
                </li>
              </ul>
            </div>

            <Button asChild variant="outline" className="mt-8 h-11 rounded-xl text-xs font-semibold w-full">
              <Link to={user ? "/documents/new" : "/auth"}>
                {t.pricing.singleCta}
              </Link>
            </Button>
          </div>

          {/* Card 2: Pacote de Créditos */}
          <div className="relative rounded-3xl border-2 border-primary bg-primary/5 p-7 shadow-glow flex flex-col justify-between">
            <div className="absolute -top-3.5 right-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              {t.pricing.bonusBadge}
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono flex items-center gap-1">
                  <Coins className="size-3.5" /> {t.pricing.creditsTitle}
                </span>
                <h3 className="font-display text-xl font-bold text-foreground mt-1">
                  Credit Packages
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.pricing.creditsDesc}
              </p>
              <ul className="space-y-2.5 text-xs text-foreground pt-2">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>{t.pricing.creditsF1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>{t.pricing.creditsF2}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>{t.pricing.creditsF3}</span>
                </li>
              </ul>
            </div>

            <Button asChild className="mt-8 h-11 rounded-xl text-xs font-bold w-full shadow-glow gap-1.5">
              <Link to={user ? "/credits" : "/auth"}>
                <Sparkles className="size-3.5" />
                {t.pricing.creditsCta}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
