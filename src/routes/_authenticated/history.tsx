import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/hooks/use-session";
import { documentsQuery } from "@/lib/queries";
import { documentTypeLabel, formatDateTime, statusMeta } from "@/lib/dokvera";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "Histórico — Dokvera" },
      { name: "description", content: "Histórico de actividade dos teus documentos no Dokvera." },
      { property: "og:title", content: "Histórico — Dokvera" },
      { property: "og:description", content: "Actividade recente da tua conta." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { user } = useSession();
  const userId = user?.id ?? "";
  const { data: documents, isLoading } = useQuery({
    ...documentsQuery(userId),
    enabled: Boolean(userId),
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Histórico"
        subtitle="Cada alteração aos teus documentos, por ordem de actividade."
      />

      <div className="shadow-soft overflow-hidden rounded-2xl border border-border/70 bg-card">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : documents && documents.length > 0 ? (
          <ul className="divide-y divide-border/70">
            {documents.map((doc) => {
              const status = statusMeta(doc.status);
              return (
                <li
                  key={doc.id}
                  className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-surface sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{doc.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {documentTypeLabel(doc.doc_type)} · criado {formatDateTime(doc.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Actualizado {formatDateTime(doc.updated_at)}</span>
                    <Badge variant="secondary" className="rounded-full text-[11px]">
                      {status.label}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="p-12 text-center text-sm text-muted-foreground">
            Ainda não existe actividade registada.
          </p>
        )}
      </div>
    </div>
  );
}
