import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Coins,
  FilePlus2,
  Files,
  HelpCircle,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "@/hooks/use-session";
import { creditsQuery, profileQuery } from "@/lib/queries";
import { creditsToMzn, formatMzn } from "@/lib/dokvera";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NAV = [
  { to: "/dashboard", label: "Painel Principal", icon: LayoutDashboard },
  { to: "/documents/new", label: "Criar Documento", icon: FilePlus2 },
  { to: "/documents", label: "Meus Documentos", icon: Files },
  { to: "/history", label: "Histórico de Ações", icon: History },
  { to: "/credits", label: "Créditos & Planos", icon: Coins },
  { to: "/settings", label: "Configurações", icon: Settings },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="space-y-1.5">
      {NAV.map((item) => {
        const active =
          item.to === "/documents"
            ? pathname === "/documents"
            : pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className={cn("size-4.5 shrink-0", active ? "text-primary-foreground" : "text-primary")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function CreditsBadge({ userId }: { userId: string }) {
  const { data: balance = 0, isLoading } = useQuery(creditsQuery(userId));
  return (
    <Link
      to="/credits"
      className="gradient-brand shadow-glow block rounded-2xl p-4 text-brand-foreground transition-transform duration-200 hover:-translate-y-0.5 relative overflow-hidden"
    >
      <Sparkles className="absolute -right-2 -bottom-2 size-16 opacity-10" />
      <p className="text-[11px] font-medium uppercase tracking-wider opacity-85">Saldo Disponível</p>
      <p className="mt-1 font-display text-2xl font-bold">{isLoading ? "—" : balance}</p>
      <p className="text-xs opacity-85">{isLoading ? "A carregar..." : formatMzn(creditsToMzn(balance))}</p>
    </Link>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: profile } = useQuery({
    ...profileQuery(user?.id ?? ""),
    enabled: Boolean(user?.id),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Sessão terminada com sucesso.");
    navigate({ to: "/auth", replace: true });
  }

  const displayName = profile?.full_name ?? user?.email ?? "Utilizador";
  const initials = displayName.slice(0, 2).toUpperCase();

  const sidebarBody = (
    <div className="flex h-full flex-col gap-6 p-5">
      <div className="px-1 pt-1">
        <Logo showParent />
      </div>
      
      {user?.id ? <CreditsBadge userId={user.id} /> : null}
      
      <div className="flex-1 overflow-y-auto py-2">
        <NavLinks onNavigate={() => setOpen(false)} />
      </div>

      <div className="mt-auto space-y-3 pt-4 border-t border-border/60">
        {/* Atalho de Suporte */}
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
        >
          <HelpCircle className="size-4 text-primary" />
          <span>Suporte Técnico (WhatsApp)</span>
        </a>

        <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-soft">
          <Avatar className="size-9 border border-border">
            {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={displayName} /> : null}
            <AvatarFallback className="text-xs font-bold bg-primary-soft text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="size-4.5" />
          Terminar sessão
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Sidebar Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-sidebar-border bg-sidebar lg:block">
        {sidebarBody}
      </aside>

      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Header Superior Profissional */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl md:px-7">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl lg:hidden">
                  <Menu className="size-5" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
                <SheetTitle className="sr-only">Menu Dokvera</SheetTitle>
                {sidebarBody}
              </SheetContent>
            </SheetSheet>
            <span className="font-display text-sm font-semibold text-foreground lg:hidden">
              Dokvera <span className="text-xs font-normal text-muted-foreground">by Ruqzora</span>
            </span>
          </div>

          <div className="flex items-center.gap-3 flex items-center gap-2.5">
            <ThemeToggle />

            {/* Dropdown de Notificações Rápido */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl relative size-10 border-border/70">
                  <Bell className="size-4 text-muted-foreground" />
                  <span className="absolute top-2 right-2 size-2 rounded-full bg-primary animate-pulse" />
                  <span className="sr-only">Notificações</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2 shadow-elevated">
                <DropdownMenuLabel className="font-display font-semibold text-sm">Notificações Recentes</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-3 space-y-2 text-xs text-muted-foreground">
                  <div className="rounded-xl bg-muted/50 p-2.5">
                    <p className="font-medium text-foreground">Sistema operacional atualizado</p>
                    <p className="mt-0.5">Todos os cálculos de créditos e formatos estão a operar normalmente.</p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button asChild className="rounded-xl shadow-sm">
              <Link to="/documents/new">
                <FilePlus2 className="mr-1.5 size-4" />
                <span className="hidden sm:inline">Criar novo documento</span>
                <span className="sm:hidden">Criar</span>
              </Link>
            </Button>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-7 md:px-7 md:py-9">{children}</main>

        {/* Rodapé Corporativo */}
        <footer className="mt-auto border-t border-border/40 px-4 py-6 text-center text-xs text-muted-foreground md:px-7 flex flex-col sm:flex-row items-center justify-between gap-2 bg-background/40">
          <p>© {new Date().getFullYear()} Dokvera. Todos os direitos reservados.</p>
          <p className="text-muted-foreground/80">Plataforma inteligente gerida por Ruqzora</p>
        </footer>
      </div>
    </div>
  );
}
