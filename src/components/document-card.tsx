import { CalendarDays, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DocumentRow } from "@/lib/queries";
import { documentTypeLabel, formatDate, formatDateTime, statusMeta } from "@/lib/dokvera";
import { cn } from "@/lib/utils";

const toneClass = {
  muted: "bg-muted text-muted-foreground",
  warning: "bg-warning/15 text-warning-foreground dark:text-warning",
  success: "bg-success/15 text-success",
} as const;

export function DocumentCard({ doc }: { doc: DocumentRow }) {
  const status = statusMeta(doc.status);
  return (
    <article className="shadow-soft group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
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
      </div>
      <dl className="mt-5 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-3.5" />
          <dt className="sr-only">Criado</dt>
          <dd>Criado a {formatDate(doc.created_at)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-3.5" />
          <dt className="sr-only">Actualizado</dt>
          <dd>Actualizado {formatDateTime(doc.updated_at)}</dd>
        </div>
      </dl>
    </article>
  );
}
