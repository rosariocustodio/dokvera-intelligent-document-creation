import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { DocTypesSection } from "@/components/landing/doc-types-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { KeyBenefits } from "@/components/landing/key-benefits";
import { SimplePricing } from "@/components/landing/simple-pricing";
import { FinalCTA } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LanguageContext, Language, TRANSLATIONS } from "@/lib/landing-i18n";

const title = "Dokvera — Crie qualquer documento com IA";
const description =
  "Gere, estruture e formate documentos em segundos. Diga o que precisa e obtenha um ficheiro pronto a usar.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const [language, setLanguage] = useState<Language>("PT");

  const value = {
    language,
    setLanguage,
    t: TRANSLATIONS[language] as typeof TRANSLATIONS.PT,
  };

  return (
    <LanguageContext.Provider value={value}>
      <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <LandingNavbar />
        <main>
          <LandingHero />
          <DocTypesSection />
          <HowItWorks />
          <KeyBenefits />
          <SimplePricing />
          <FinalCTA />
        </main>
        <LandingFooter />
      </div>
    </LanguageContext.Provider>
  );
}
