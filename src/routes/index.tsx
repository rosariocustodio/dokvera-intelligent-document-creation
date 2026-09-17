import { createFileRoute } from "@tanstack/react-router";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { Capabilities } from "@/components/landing/capabilities";
import { FinalCTA } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

const title = "Dokvera — Documentos Académicos e Profissionais com Inteligência Artificial";
const description =
  "Estruture e formate trabalhos académicos, relatórios executivos e currículos em minutos. Exportação fiel em Microsoft Word (.docx) e PDF.";

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
        <Capabilities />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
