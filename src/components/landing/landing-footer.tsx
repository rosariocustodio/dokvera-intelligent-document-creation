import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { useLanguage } from "@/lib/landing-i18n";

export function LandingFooter() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border/60 bg-card/50 py-12">
      <div className="mx-auto max-w-6xl px-5 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo showParent />

          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
            <a href="#produto" className="hover:text-foreground transition-colors">
              {t.nav.product}
            </a>
            <a href="#como-funciona" className="hover:text-foreground transition-colors">
              {t.nav.howItWorks}
            </a>
            <a href="#beneficios" className="hover:text-foreground transition-colors">
              {t.nav.benefits}
            </a>
            <a href="#precos" className="hover:text-foreground transition-colors">
              {t.nav.pricing}
            </a>
            <Link to="/auth" className="hover:text-foreground transition-colors">
              {t.nav.login}
            </Link>
          </nav>
        </div>

        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Dokvera by Ruqzora. {t.footer.rights}</p>
          <p className="font-mono text-[11px]">{t.footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
