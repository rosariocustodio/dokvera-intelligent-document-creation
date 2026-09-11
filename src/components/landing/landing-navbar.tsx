import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

export function LandingNavbar() {
  const { user } = useSession();
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
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
          <a
            href="#demonstracao"
            className="transition-colors hover:text-foreground hover:underline underline-offset-8"
          >
            Demonstração
          </a>
          <a
            href="#como-funciona"
            className="transition-colors hover:text-foreground hover:underline underline-offset-8"
          >
            Como Funciona
          </a>
          <a
            href="#solucoes"
            className="transition-colors hover:text-foreground hover:underline underline-offset-8"
          >
            Soluções
          </a>
          <a
            href="#capacidades"
            className="transition-colors hover:text-foreground hover:underline underline-offset-8"
          >
            Capacidades
          </a>
          <a
            href="#comparativo"
            className="transition-colors hover:text-foreground hover:underline underline-offset-8"
          >
            Por Que Dokvera
          </a>
          <a
            href="#faq"
            className="transition-colors hover:text-foreground hover:underline underline-offset-8"
          >
            FAQ
          </a>
        </nav>

        {/* Action Controls */}
        <div className="hidden items-center gap-3 sm:flex">
          <ThemeToggle />

          {user ? (
            <Button asChild size="sm" className="rounded-xl px-4 text-xs font-bold shadow-soft">
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
                  Começar gratuitamente
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
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
        <div className="border-b border-border/80 bg-background/95 px-5 py-6 backdrop-blur-2xl lg:hidden animate-fade-in">
          <nav className="flex flex-col gap-4 text-sm font-medium">
            <a
              href="#demonstracao"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Demonstração do Produto
            </a>
            <a
              href="#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Como Funciona
            </a>
            <a
              href="#solucoes"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Soluções & Casos de Uso
            </a>
            <a
              href="#capacidades"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Capacidades & Recursos
            </a>
            <a
              href="#comparativo"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Por Que Dokvera
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Perguntas Frequentes
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
                      Entrar na Conta
                    </Link>
                  </Button>
                  <Button asChild className="w-full rounded-xl text-xs font-bold shadow-soft">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Sparkles className="mr-1.5 size-3.5" />
                      Começar gratuitamente
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
