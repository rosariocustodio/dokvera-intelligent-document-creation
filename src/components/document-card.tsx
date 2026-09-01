import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock, FileText, Users, Layers, Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DocumentRow } from "@/lib/queries";
import { documentTypeLabel, formatDate, formatDateTime, formatCurrency, creditsToCurrency, statusMeta } from "@/lib/dokvera";
import { cn } from "@/lib/utils";

const toneClass = {
  muted: "bg-muted text-muted-foreground",
  info: "bg-primary/15 text-primary",
  danger: "bg-destructive/15 text-destructive",
  warning: "bg-warning/15 text-warning-foreground dark:text-warning",
  success: "bg-success/15 text-success",
} as const;

export function DocumentCard({ doc, country }: { doc: DocumentRow; country?: string | null | undefined }) {
  const status = statusMeta(doc.status);
  const metadata = (doc.metadata as Record<string, any>) ?? {};
  
  const pageRange = metadata['page_range'];
  const studentsCount = metadata['students_count'];
  const estimatedCost = metadata['estimated_cost'];

  return (
    <Link 
      to="/documents/$id" 
      params={{ id: doc.id }}
      className="block"
    >
      <article className="shadow-soft group flex h-full flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md cursor-pointer">
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <FileText className="size-5" />
          </span>
          <Badge className={cn("rounded-full border-0 text-[11px]", toneClass[status.tone])}>
            {status.label}
          </Badge>
        </div>
        <h3 className="mt-4 line-clamp-2 text-base font-semibold">{doc.title}</h3>
        <p className="mt-1 text-xs font-medium text-primary">{documentTypeLabel(doc.doc_type)}</p>

        {/* Metadados específicos de páginas e estudantes se existirem */}
        {(pageRange || studentsCount) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
            {pageRange && (
              <span className="inline-flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-md">
                <Layers className="size-3 text-primary" />
                {pageRange === "10-15" ? "10–15 págs" : "16–20 págs"}
              </span>
            )}
            {studentsCount && (
              <span className="inline-flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-md">
                <Users className="size-3 text-primary" />
                {studentsCount} {studentsCount === 1 ? "estudante" : "estudantes"}
              </span>
            )}
            {estimatedCost !== undefined && (
              <span className="inline-flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded-md font-medium text-primary">
                <Coins className="size-3" />
                {estimatedCost} cr ({formatCurrency(creditsToCurrency(estimatedCost, country), country)})
              </span>
            )}
          </div>
        )}
      </div>

      <dl className="mt-5 space-y-1.5 text-xs text-muted-foreground pt-3 border-t border-border/40">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-3.5" />
          <dt className="sr-only">Criado</dt>
          <dd>Criado a {formatDate(doc.created_at, country)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-3.5" />
          <dt className="sr-only">Actualizado</dt>
          <dd>Actualizado {formatDateTime(doc.updated_at, country)}</dd>
        </div>
      </dl>
    </article>
    </Link>
  );
}
