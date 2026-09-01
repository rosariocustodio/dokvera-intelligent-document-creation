import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Coins,
  FilePlus2,
  Files,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "@/hooks/use-session";
import { creditsQuery, profileQuery } from "@/lib/queries";
import { creditsToCurrency, formatCurrency } from "@/lib/dokvera";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/documents/new", label: "Criar Documento", icon: FilePlus2 },
  { to: "/documents", label: "Meus Documentos", icon: Files },
  { to: "/history", label: "Histórico", icon: History },
  { to: "/credits", label: "Créditos", icon: Coins },
  { to: "/settings", label: "Configurações", icon: Settings },
] as const;

// Picks the most specific NAV entry that matches the current path, so a
// sub-route like "/documents/123" highlights "Meus Documentos" while
// "/documents/new" — itself a NAV entry — never falls through to it.
function getActiveNavPath(pathname: string): string | null {
  let match: string | null = null;
  for (const item of NAV) {
    const isMatch = pathname === item.to || pathname.startsWith(`${item.to}/`);
    if (isMatch && (!match || item.to.length > match.length)) {
      match = item.to;
    }
  }
  return match;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return (parts[0] ?? "").slice(0, 2).toUpperCase();
  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function NavLinks({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activePath = getActiveNavPath(pathname);

  return (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = item.to === activePath;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className={cn("size-4.5", active && "text-primary")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function CreditsBadge({ userId, country }: { userId: string; country?: string | null | undefined }) {
  const { data: balance, isLoading } = useQuery(creditsQuery(userId));
  const credits = balance ?? 0;

  return (
    <Link
      to="/credits"
      className="gradient-brand shadow-glow block rounded-2xl p-4 text-brand-foreground transition-transform duration-200 hover:-translate-y-0.5"
    >
      <p className="text-[11px] font-medium uppercase tracking-wider opacity-85">Saldo</p>
      <p className="mt-1 font-display text-2xl font-bold">
        {isLoading ? (
          <span className="inline-block h-6 w-10 animate-pulse rounded bg-brand-foreground/20" />
        ) : (
          credits
        )}
      </p>
      <p className="text-xs opacity-85">
        {isLoading ? (
          <span className="mt-1 inline-block h-3 w-16 animate-pulse rounded bg-brand-foreground/20" />
        ) : (
          formatCurrency(creditsToCurrency(credits, country), country)
        )}
      </p>
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
    navigate({ to: "/auth", replace: true });
  }

  const displayName = profile?.full_name?.trim() || user?.email || "Utilizador";
  const initials = getInitials(displayName);

  function renderSidebar(onNavigate?: () => void) {
    return (
      <div className="flex h-full flex-col gap-6 p-5">
        <Logo showParent />
        {user?.id ? <CreditsBadge userId={user.id} country={profile?.country} /> : null}
        <NavLinks onNavigate={onNavigate} />
        <div className="mt-auto space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3">
            <Avatar className="size-9">
              {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={displayName} /> : null}
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4.5" />
            Terminar sessão
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-sidebar-border bg-sidebar lg:block">
        {renderSidebar()}
      </aside>

      <div className="lg:pl-72">
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
                {renderSidebar(() => setOpen(false))}
              </SheetContent>
            </Sheet>
            <span className="font-display text-sm font-semibold text-muted-foreground lg:hidden">
              Dokvera
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild className="rounded-xl">
              <Link to="/documents/new">
                <FilePlus2 className="mr-1.5 size-4" />
                Criar novo documento
              </Link>
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-7 md:px-7 md:py-9">{children}</main>

        <footer className="px-4 pb-8 text-center text-xs text-muted-foreground md:px-7">
          Dokvera by Ruqzora
        </footer>
      </div>
    </div>
  );
}
