import { createFileRoute } from "@tanstack/react-router";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { DocTypesSection } from "@/components/landing/doc-types-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { KeyBenefits } from "@/components/landing/key-benefits";
import { SimplePricing } from "@/components/landing/simple-pricing";
import { FinalCTA } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

const title = "Dokvera — Crie qualquer documento com IA";
const description =
  "Estruture e formate trabalhos académicos, relatórios executivos e currículos em minutos. Exportação em Microsoft Word (.docx) e PDF.";

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
  return (
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
  );
}
