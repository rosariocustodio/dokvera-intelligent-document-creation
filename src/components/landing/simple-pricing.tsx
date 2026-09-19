import { Link } from "@tanstack/react-router";
import { Check, Coins, Sparkles, Zap, Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/use-session";
import { useLanguage } from "@/lib/landing-i18n";
import { CREDIT_PACKS, formatCurrency, packPriceInCountry } from "@/lib/dokvera";
import { COUNTRY_CONFIG, type CountryCode } from "@/lib/countries";

export function SimplePricing() {
  const { user } = useSession();
  const { t } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("MZ");

  const countryConfig = COUNTRY_CONFIG[selectedCountry];

  return (
    <section id="precos" className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-mono uppercase font-bold text-primary tracking-widest">
            {t.pricing.tagline}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {t.pricing.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.pricing.subtitle}
          </p>

          {/* Seletor de Pais / Moeda Dinamico */}
          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <Globe className="size-3.5" /> Moeda local:
            </span>
            <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-xs">
              {(Object.keys(COUNTRY_CONFIG) as CountryCode[]).map((code) => {
                const conf = COUNTRY_CONFIG[code];
                const active = selectedCountry === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedCountry(code)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {conf.name} ({conf.currencySymbol})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grelha de Pacotes Oficiais Harmonizados */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto items-stretch mb-12">
          {CREDIT_PACKS.map((p) => {
            const price = formatCurrency(packPriceInCountry(p, selectedCountry), selectedCountry);
            return (
              <div
                key={p.id}
                className={
                  p.highlight
                    ? "relative rounded-3xl border-2 border-primary bg-card p-6 shadow-glow flex flex-col justify-between"
                    : "rounded-3xl border border-border/70 bg-card p-6 shadow-soft flex flex-col justify-between hover:border-primary/40 transition-colors"
                }
              >
                <div>
                  {p.highlight && (
                    <Badge className="absolute -top-3 right-6 rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                      Mais Popular
                    </Badge>
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    {p.name}
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-display text-3xl font-extrabold text-foreground">
                      {price}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-primary">
                    {p.credits} créditos
                  </p>
                  <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
                    {p.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2">
                        <Check className="size-3.5 shrink-0 text-emerald-500 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  asChild
                  variant={p.highlight ? "default" : "outline"}
                  className="mt-6 h-10 rounded-xl text-xs font-semibold w-full shadow-xs"
                >
                  <Link to={user ? "/credits" : "/auth"}>
                    Adquirir Pacote
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Card Destaque: Recarga Flexivel Avulsa */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-border/70 bg-gradient-to-r from-primary/5 via-card to-primary/5 p-6 shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-0.5 text-xs font-semibold text-primary">
              <Zap className="size-3.5" /> Recarga Flexível Avulsa
            </span>
            <h3 className="font-display text-lg font-bold text-foreground">
              Precisa de apenas 1 documento ou carta pontual?
            </h3>
            <p className="text-xs text-muted-foreground">
              Compre exatamente a quantidade de créditos que precisa, a partir de 1 unidade ({formatCurrency(countryConfig.creditPrice, selectedCountry)} por crédito). Sem mensalidade obrigatória.
            </p>
          </div>
          <Button asChild className="h-11 rounded-xl px-6 text-xs font-bold shrink-0 shadow-glow gap-1.5">
            <Link to={user ? "/credits" : "/auth"}>
              <Sparkles className="size-3.5" />
              Comprar Créditos Avulsos
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
