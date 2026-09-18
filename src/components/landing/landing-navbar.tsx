import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X, Globe } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

export function LandingNavbar() {
  const { user } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<"PT" | "EN">("PT");

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
          <a
            href="#produto"
            className="transition-colors hover:text-foreground"
          >
            Produto
          </a>
          <a
            href="#como-funciona"
            className="transition-colors hover:text-foreground"
          >
            Como Funciona
          </a>
          <a
            href="#beneficios"
            className="transition-colors hover:text-foreground"
          >
            Benefícios
          </a>
          <a
            href="#precos"
            className="transition-colors hover:text-foreground"
          >
            Preços
          </a>
        </nav>

        {/* Right Controls */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => setLang(lang === "PT" ? "EN" : "PT")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-muted/40 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Alterar idioma"
          >
            <Globe className="size-3.5 text-primary" />
            <span>{lang}</span>
          </button>

          <ThemeToggle />

          {user ? (
            <Button asChild size="sm" className="rounded-xl px-4 text-xs font-semibold shadow-soft">
              <Link to="/dashboard">
                Ir para o Painel
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
                <Link to="/auth">Entrar</Link>
              </Button>

              <Button asChild size="sm" className="rounded-xl px-4 text-xs font-bold shadow-glow">
                <Link to="/auth">
                  Começar grátis
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
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
              Produto
            </a>
            <a
              href="#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Como Funciona
            </a>
            <a
              href="#beneficios"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Benefícios
            </a>
            <a
              href="#precos"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Preços
            </a>

            <div className="mt-4 pt-4 border-t border-border/60 flex flex-col gap-2.5">
              {user ? (
                <Button asChild className="w-full rounded-xl text-xs font-bold">
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    Ir para o Painel
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
                      Entrar
                    </Link>
                  </Button>
                  <Button asChild className="w-full rounded-xl text-xs font-bold shadow-soft">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      Começar grátis
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
