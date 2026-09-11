import { createFileRoute } from "@tanstack/react-router";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { ProductDemo } from "@/components/landing/product-demo";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { HowItWorks } from "@/components/landing/how-it-works";
import { UseCases } from "@/components/landing/use-cases";
import { Capabilities } from "@/components/landing/capabilities";
import { Comparison } from "@/components/landing/comparison";
import { TrustSecurity } from "@/components/landing/trust-security";
import { FAQ } from "@/components/landing/faq";
import { FinalCTA } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

const title = "Dokvera — Criação e Estruturação Inteligente de Documentos com IA";
const description =
  "Transforme as suas ideias em documentos profissionais com inteligência artificial. Crie, estruture e aperfeiçoe documentos completos em minutos, com exportação nativa para Word (.docx) e PDF.";

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
        <ProductDemo />
        <ProblemSolution />
        <HowItWorks />
        <UseCases />
        <Capabilities />
        <Comparison />
        <TrustSecurity />
        <FAQ />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
