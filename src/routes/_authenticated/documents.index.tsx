import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { DocumentCard } from "@/components/document-card";
import { useSession } from "@/hooks/use-session";
import { documentsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/documents/")({
  head: () => ({
    meta: [
      { title: "Meus documentos — Dokvera" },
      { name: "description", content: "Todos os documentos que criaste no Dokvera." },
      { property: "og:title", content: "Meus documentos — Dokvera" },
      { property: "og:description", content: "Todos os teus documentos organizados." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { user } = useSession();
  const userId = user?.id ?? "";
  const { data: documents, isLoading } = useQuery({
    ...documentsQuery(userId),
    enabled: Boolean(userId),
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Meus documentos"
        subtitle="Tudo o que criaste, organizado e sempre acessível."
        action={
          <Button asChild className="rounded-xl">
            <Link to="/documents/new">
              <FilePlus2 className="mr-1.5 size-4" />
              Criar novo documento
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
        ) : documents && documents.length > 0 ? (
          documents.map((doc) => <DocumentCard key={doc.id} doc={doc} />)
        ) : (
          <div className="shadow-soft col-span-full rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-semibold">Nenhum documento ainda</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Escolhe um tipo de documento e o Dokvera monta a estrutura por ti.
            </p>
            <Button asChild className="mt-5 rounded-xl">
              <Link to="/documents/new">Começar</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
