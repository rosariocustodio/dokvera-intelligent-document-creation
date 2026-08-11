import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, showParent = false }: { className?: string; showParent?: boolean }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)}>
      <span className="gradient-brand shadow-glow flex size-9 items-center justify-center rounded-xl text-brand-foreground">
        <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
          <path
            d="M5 4.5A1.5 1.5 0 0 1 6.5 3h6.2L19 9.3v10.2A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5v-15Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M12.5 3v6h6.4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M8.4 14.2l2.2 2.3 4.6-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold tracking-tight">Dokvera</span>
        {showParent ? (
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            by Ruqzora
          </span>
        ) : null}
      </span>
    </Link>
  );
}
