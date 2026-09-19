import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactElement } from "react";
import { 
  ArrowLeft, 
  Copy, 
  Download, 
  FileText, 
  Loader2, 
  Check, 
  FileWarning, 
  Calendar, 
  Coins,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { documentQuery, documentEventsQuery, profileQuery } from "@/lib/queries";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { exportToPdf, exportToDocx } from "@/services/export";
import { formatDate, formatDateTime, documentTypeLabel, statusMeta } from "@/lib/dokvera";

export const Route = createFileRoute("/_authenticated/documents/$id")({
  head: ({ params }) => ({
    meta: [
      { title: "Visualizar Documento — Dokvera" },
      { name: "description", content: "Visualiza e exporta o teu documento inteligente." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DocumentView,
});

function MarkdownView({ content }: { content: string }) {
  const paragraphs = content.split(/\n\s*\n/);
  
  return (
    <div className="prose max-w-none dark:prose-invert space-y-4">
      {paragraphs.map((p, i) => {
        const trimmed = p.trim();
        if (!trimmed) return null;
        
        // Headers
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={i} className="text-lg font-bold mt-6 mb-2 text-foreground">
              {renderTextWithFormatting(trimmed.slice(4))}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={i} className="text-xl font-bold mt-8 mb-3 text-foreground border-b border-border/40 pb-1">
              {renderTextWithFormatting(trimmed.slice(3))}
            </h2>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={i} className="text-2xl font-extrabold mt-10 mb-4 text-foreground border-b border-border/70 pb-2">
              {renderTextWithFormatting(trimmed.slice(2))}
            </h1>
          );
        }
        
        // Lists
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split(/\n[-*]\s+/);
          return (
            <ul key={i} className="list-disc pl-6 space-y-1.5 my-3">
              {items.map((item, idx) => {
                const text = idx === 0 ? item.substring(2) : item;
                return (
                  <li key={idx} className="text-foreground/90">
                    {renderTextWithFormatting(text)}
                  </li>
                );
              })}
            </ul>
          );
        }

        if (/^\d+[.)]\s+/.test(trimmed)) {
          const items = trimmed.split(/\n\d+[.)]\s+/);
          return (
            <ol key={i} className="list-decimal pl-6 space-y-1.5 my-3">
              {items.map((item, idx) => {
                // strip leading number if first item
                let text = item;
                if (idx === 0) {
                  const match = item.match(/^\d+[.)]\s+/);
                  if (match) {
                    text = item.substring(match[0].length);
                  }
                }
                return (
                  <li key={idx} className="text-foreground/90">
                    {renderTextWithFormatting(text)}
                  </li>
                );
              })}
            </ol>
          );
        }

        // Standard paragraph
        const lines = trimmed.split("\n");
        return (
          <p key={i} className="text-foreground/90 leading-relaxed">
            {lines.map((line, lineIdx) => (
              <span key={lineIdx} className={lineIdx > 0 ? "block mt-1" : "inline"}>
                {renderTextWithFormatting(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function renderTextWithFormatting(text: string) {
  const parts: (string | ReactElement)[] = [];
  let current = text;
  
  // Simple bold parser
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  let lastIndex = 0;
  
  while ((match = boldRegex.exec(current)) !== null) {
    if (match.index > lastIndex) {
      parts.push(current.substring(lastIndex, match.index));
    }
    parts.push(
      <strong key={`bold-${match.index}`} className="font-bold text-foreground">
        {match[1]}
      </strong>
    );
    lastIndex = boldRegex.lastIndex;
  }
  
  if (lastIndex < current.length) {
    parts.push(current.substring(lastIndex));
  }
  
  if (parts.length === 0) return text;
  
  // Parse italic on each of the remaining parts
  return parts.map((part, index) => {
    if (typeof part !== "string") return part;
    
    const italicParts: (string | ReactElement)[] = [];
    const italicRegex = /\*(.*?)\*/g;
    let iMatch;
    let iLastIndex = 0;
    
    while ((iMatch = italicRegex.exec(part)) !== null) {
      if (iMatch.index > iLastIndex) {
        italicParts.push(part.substring(iLastIndex, iMatch.index));
      }
      italicParts.push(
        <em key={`italic-${index}-${iMatch.index}`} className="italic text-foreground/90">
          {iMatch[1]}
        </em>
      );
      iLastIndex = italicRegex.lastIndex;
    }
    
    if (iLastIndex < part.length) {
      italicParts.push(part.substring(iLastIndex));
    }
    
    return italicParts.length > 0 ? <span key={index}>{italicParts}</span> : part;
  });
}

function DocumentView() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const { user } = useSession();

  const { data: profile } = useQuery({
    ...profileQuery(user?.id ?? ""),
    enabled: Boolean(user?.id),
  });
  const country = profile?.country;

  const { data: doc, isLoading, error } = useQuery({
    ...documentQuery(id),
    enabled: Boolean(id),
  });

  const { data: events } = useQuery({
    ...documentEventsQuery(id),
    enabled: Boolean(id),
  });

  const handleCopy = async () => {
    if (!doc?.content) return;
    try {
      await navigator.clipboard.writeText(doc.content);
      setCopied(true);
      toast.success("Texto copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Erro ao copiar o texto.");
    }
  };

  const handleDownloadPdf = () => {
    if (!doc) return;
    try {
      const templateId = (doc.metadata?.templateId as string) || (doc.options?.templateId as string) || (doc.options?.cvTemplate as string) || "modern";
      const accentColor = (doc.metadata?.accentColor as string) || (doc.options?.accentColor as string) || (doc.options?.cvAccent as string) || "indigo";
      const fields = (doc.options?.fields as Record<string, unknown>) || (doc.metadata?.fields as Record<string, unknown>);

      exportToPdf(doc.title, doc.content || "", {
        footer: `Dokvera — ${doc.title}`,
        docType: doc.doc_type,
        templateId,
        accentColor,
        fields,
        country,
      });

      toast.success("PDF descarregado com sucesso!");
    } catch (err) {
      toast.error("Erro ao gerar o PDF.");
      console.error(err);
    }
  };

  const handleDownloadWord = async () => {
    if (!doc) return;
    try {
      const templateId = (doc.metadata?.templateId as string) || (doc.options?.templateId as string) || (doc.options?.cvTemplate as string) || "modern";
      const accentColor = (doc.metadata?.accentColor as string) || (doc.options?.accentColor as string) || (doc.options?.cvAccent as string) || "indigo";
      const fields = (doc.options?.fields as Record<string, unknown>) || (doc.metadata?.fields as Record<string, unknown>);

      await exportToDocx(doc.title, doc.content || "", {
        footer: `Dokvera — ${doc.title}`,
        docType: doc.doc_type,
        templateId,
        accentColor,
        fields,
        country,
      });

      toast.success("Documento Word descarregado com sucesso!");
    } catch (err) {
      toast.error("Erro ao gerar o documento Word.");
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">A carregar o seu documento...</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="shadow-soft rounded-2xl border border-dashed border-border bg-card p-12 text-center max-w-md mx-auto mt-10">
        <FileWarning className="size-12 mx-auto text-destructive mb-4" />
        <h3 className="font-semibold text-lg text-foreground">Documento não encontrado</h3>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          O documento solicitado não existe ou não tem permissão para o visualizar.
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/documents">Voltar à Lista</Link>
        </Button>
      </div>
    );
  }

  const meta = statusMeta(doc.status);

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header com ações rápidas */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/60 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Button asChild variant="ghost" size="icon" className="rounded-xl size-9 -ml-2 text-muted-foreground hover:text-foreground">
              <Link to="/documents">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <Badge variant="outline" className="rounded-full text-xs py-0.5 px-2.5 capitalize font-semibold border-primary/20 bg-primary/5 text-primary">
              {documentTypeLabel(doc.doc_type)}
            </Badge>
            <Badge className={`rounded-full border-0 text-[11px] font-semibold py-0.5 px-2.5 ${
              doc.status === 'ready' ? 'bg-success/15 text-success' : 
              doc.status === 'generating' ? 'bg-primary/15 text-primary' :
              doc.status === 'error' ? 'bg-destructive/15 text-destructive' : 'bg-muted text-muted-foreground'
            }`}>
              {meta.label}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{doc.title}</h1>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground font-medium pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              Criado em {formatDateTime(doc.created_at)}
            </span>
            {doc.estimated_cost > 0 && (
              <span className="flex items-center gap-1.5">
                <Coins className="size-3.5" />
                Custo: {doc.estimated_cost} cr
              </span>
            )}
          </div>
        </div>

        {/* Botões rápidos */}
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" className="rounded-xl h-10 px-4 font-medium border-border/80 text-muted-foreground hover:text-foreground">
            <Link to="/documents">
              <ArrowLeft className="mr-1.5 size-4" />
              Voltar à Lista
            </Link>
          </Button>

          {doc.status === "draft" && (
            <Button asChild className="rounded-xl h-10 px-4 font-semibold shadow-sm">
              <Link to="/documents/new" search={{ draftId: doc.id }}>
                <Sparkles className="mr-1.5 size-4" />
                Continuar Rascunho
              </Link>
            </Button>
          )}

          {doc.status === "ready" && doc.content && (
            <>
              <Button 
                onClick={handleCopy} 
                variant="outline" 
                className="rounded-xl h-10 px-4 font-medium border-border/80 text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="mr-1.5 size-4 text-success" /> : <Copy className="mr-1.5 size-4" />}
                {copied ? "Copiado!" : "Copiar Texto"}
              </Button>
              
              <Button 
                onClick={handleDownloadPdf} 
                variant="outline" 
                className="rounded-xl h-10 px-4 font-medium border-border/80 text-muted-foreground hover:text-foreground"
              >
                <Download className="mr-1.5 size-4" />
                Descarregar PDF
              </Button>

              <Button 
                onClick={handleDownloadWord} 
                variant="outline" 
                className="rounded-xl h-10 px-4 font-medium border-border/80 text-muted-foreground hover:text-foreground"
              >
                <Download className="mr-1.5 size-4" />
                Descarregar Word
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Visualização de Conteúdo */}
      <div className="bg-card border border-border/70 rounded-2xl p-6 md:p-8 shadow-soft min-h-[400px]">
        {doc.status === "generating" ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <Loader2 className="size-12 animate-spin text-primary" />
            <h3 className="font-semibold text-lg text-foreground">O seu documento está a ser gerado</h3>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              A nossa inteligência artificial está a estruturar, formatar e escrever o seu documento personalizado. Isto poderá demorar alguns segundos.
            </p>
          </div>
        ) : doc.status === "error" ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <FileWarning className="size-12 text-destructive" />
            <h3 className="font-semibold text-lg text-foreground">Erro na geração do documento</h3>
            <p className="text-sm text-destructive max-w-sm leading-relaxed bg-destructive/5 border border-destructive/20 rounded-xl p-4">
              {doc.error_message || "Ocorreu um erro desconhecido ao tentar gerar o documento."}
            </p>
          </div>
        ) : doc.status === "draft" && !doc.content ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 text-muted-foreground">
            <FileText className="size-12" />
            <h3 className="font-semibold text-lg text-foreground">Documento em Rascunho</h3>
            <p className="text-sm leading-relaxed max-w-sm">
              Este documento foi guardado como rascunho mas ainda não foi processado. Pode carregar em "Continuar Rascunho" acima para configurar e avançar.
            </p>
          </div>
        ) : doc.content ? (
          <MarkdownView content={doc.content} />
        ) : (
          <p className="text-center py-20 text-muted-foreground font-medium">Este documento não tem conteúdo de momento.</p>
        )}
      </div>

      {/* Histórico de Atividade */}
      {events && events.length > 0 && (
        <div className="bg-card border border-border/70 rounded-2xl p-6 shadow-soft">
          <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            Histórico de Atividade do Documento
          </h3>
          <div className="relative pl-6 border-l border-border/75 space-y-6">
            {events.map((ev, i) => {
              // Custom human-friendly descriptions for common events
              let title = ev.event.replace(/_/g, " ");
              let detailText = "";
              if (ev.event === "document_created") {
                title = "Rascunho Criado";
                detailText = "Os metadados iniciais e a estrutura básica do documento foram salvos.";
              } else if (ev.event === "document_updated") {
                title = "Rascunho Atualizado";
                detailText = "As configurações do rascunho foram editadas.";
              } else if (ev.event === "generation_started") {
                title = "Geração Iniciada";
                detailText = "O motor de IA iniciou a escrita do conteúdo.";
              } else if (ev.event === "generation_completed") {
                title = "Geração Concluída";
                detailText = "O documento foi estruturado e gerado com sucesso.";
              }

              return (
                <div key={ev.id} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-[31px] top-1.5 size-2.5 rounded-full border-2 border-card bg-primary" />
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <div>
                      <span className="font-semibold text-sm text-foreground capitalize">
                        {title}
                      </span>
                      {detailText ? (
                        <p className="text-xs text-muted-foreground mt-0.5">{detailText}</p>
                      ) : (
                        ev.detail && Object.keys(ev.detail).length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {JSON.stringify(ev.detail)}
                          </p>
                        )
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium sm:mt-0.5">
                      {formatDateTime(ev.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
