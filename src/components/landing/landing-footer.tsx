import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowUpRight } from "lucide-react";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-surface/40 py-16 text-xs text-muted-foreground">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-border/60">
          {/* Brand & About */}
          <div className="md:col-span-4 space-y-4">
            <Logo showParent />
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Plataforma inteligente de criação e estruturação de documentos com inteligência
              artificial. Do rascunho inicial à exportação executiva em minutos.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <ThemeToggle />
              <span className="text-[11px] text-muted-foreground">Alternar tema visual</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="md:col-span-2 space-y-3">
            <span className="font-bold text-foreground uppercase tracking-wider text-[10px] block">
              Produto
            </span>
            <ul className="space-y-2">
              <li>
                <a href="#demonstracao" className="hover:text-foreground transition-colors">
                  Demonstração
                </a>
              </li>
              <li>
                <a href="#como-funciona" className="hover:text-foreground transition-colors">
                  Como Funciona
                </a>
              </li>
              <li>
                <a href="#capacidades" className="hover:text-foreground transition-colors">
                  Capacidades
                </a>
              </li>
              <li>
                <a href="#comparativo" className="hover:text-foreground transition-colors">
                  Por Que Dokvera
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground transition-colors">
                  Perguntas Frequentes
                </a>
              </li>
            </ul>
          </div>

          {/* Solutions Links */}
          <div className="md:col-span-3 space-y-3">
            <span className="font-bold text-foreground uppercase tracking-wider text-[10px] block">
              Soluções
            </span>
            <ul className="space-y-2">
              <li>
                <a href="#solucoes" className="hover:text-foreground transition-colors">
                  Documentos Académicos
                </a>
              </li>
              <li>
                <a href="#solucoes" className="hover:text-foreground transition-colors">
                  Currículos Executivos (ATS)
                </a>
              </li>
              <li>
                <a href="#solucoes" className="hover:text-foreground transition-colors">
                  Planos de Negócios & Propostas
                </a>
              </li>
              <li>
                <a href="#solucoes" className="hover:text-foreground transition-colors">
                  Requerimentos Administrativos
                </a>
              </li>
              <li>
                <span className="text-foreground/80 font-medium">
                  Exportação Word (.docx) e PDF
                </span>
              </li>
            </ul>
          </div>

          {/* Account & Platform */}
          <div className="md:col-span-3 space-y-3">
            <span className="font-bold text-foreground uppercase tracking-wider text-[10px] block">
              Acesso
            </span>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/auth"
                  className="hover:text-foreground transition-colors font-semibold text-primary"
                >
                  Criar Conta Gratuita
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-foreground transition-colors">
                  Iniciar Sessão
                </Link>
              </li>
              <li>
                <Link
                  to="/credits"
                  className="hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Planos de Créditos <ArrowUpRight className="size-3" />
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground/70">Infraestrutura Segura na Nuvem</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p className="text-muted-foreground text-center sm:text-left">
            © {currentYear} Dokvera. Todos os direitos reservados. Desenvolvido por{" "}
            <strong className="text-foreground font-semibold">Dokvera by Ruqzora</strong>.
          </p>
          <p className="text-muted-foreground text-center sm:text-right">
            Inteligência Artificial pensada e calibrada para documentos reais.
          </p>
        </div>
      </div>
    </footer>
  );
}
