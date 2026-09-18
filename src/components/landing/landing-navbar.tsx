import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X, Globe } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { useLanguage } from "@/lib/landing-i18n";
import { cn } from "@/lib/utils";

export function LandingNavbar() {
  const { user } = useSession();
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/80 backdrop-blur-xl shadow-xs"
          : "border-b border-transparent bg-background/40 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo showParent />

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#produto" className="transition-colors hover:text-foreground">
            {t.nav.product}
          </a>
          <a href="#como-funciona" className="transition-colors hover:text-foreground">
            {t.nav.howItWorks}
          </a>
          <a href="#beneficios" className="transition-colors hover:text-foreground">
            {t.nav.benefits}
          </a>
          <a href="#precos" className="transition-colors hover:text-foreground">
            {t.nav.pricing}
          </a>
        </nav>

        {/* Right Controls */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Functional PT / EN Switcher Button */}
          <div className="flex items-center rounded-xl border border-border/70 bg-muted/40 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLanguage("PT")}
              className={cn(
                "rounded-lg px-2.5 py-1 transition-all cursor-pointer",
                language === "PT"
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              PT
            </button>
            <button
              type="button"
              onClick={() => setLanguage("EN")}
              className={cn(
                "rounded-lg px-2.5 py-1 transition-all cursor-pointer",
                language === "EN"
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              EN
            </button>
          </div>

          <ThemeToggle />

          {user ? (
            <Button asChild size="sm" className="rounded-xl px-4 text-xs font-semibold shadow-soft">
              <Link to="/dashboard">
                {t.nav.dashboard}
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <Link to="/auth">{t.nav.login}</Link>
              </Button>

              <Button asChild size="sm" className="rounded-xl px-4 text-xs font-bold shadow-glow">
                <Link to="/auth">
                  {t.nav.startFree}
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger & Lang Switcher */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile PT/EN toggle */}
          <button
            type="button"
            onClick={() => setLanguage(language === "PT" ? "EN" : "PT")}
            className="rounded-lg border border-border/70 bg-muted/50 px-2 py-1 text-xs font-bold text-primary"
          >
            {language}
          </button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu de navegação"
            className="rounded-xl"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border/80 bg-background/95 px-5 py-6 backdrop-blur-2xl md:hidden animate-fade-in">
          <nav className="flex flex-col gap-4 text-sm font-medium">
            <a
              href="#produto"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {t.nav.product}
            </a>
            <a
              href="#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {t.nav.howItWorks}
            </a>
            <a
              href="#beneficios"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {t.nav.benefits}
            </a>
            <a
              href="#precos"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {t.nav.pricing}
            </a>

            <div className="mt-4 pt-4 border-t border-border/60 flex flex-col gap-2.5">
              {user ? (
                <Button asChild className="w-full rounded-xl text-xs font-bold">
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    {t.nav.dashboard}
                    <ArrowRight className="ml-1.5 size-3.5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-xl text-xs font-semibold"
                  >
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      {t.nav.login}
                    </Link>
                  </Button>
                  <Button asChild className="w-full rounded-xl text-xs font-bold shadow-soft">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      {t.nav.startFree}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
