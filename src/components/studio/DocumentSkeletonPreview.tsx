import React from "react";
import { FileText, CheckCircle2, Layers, BookOpen, User, Hash, Sparkles, LayoutTemplate } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type DocSpec } from "@/lib/document-specs";

interface DocumentSkeletonPreviewProps {
  spec: DocSpec;
  fields: Record<string, unknown>;
  structure: string[];
  pageTierId?: string;
  templateId?: string;
  instructions?: string;
  title: string;
}

export function DocumentSkeletonPreview({
  spec,
  fields,
  structure,
  pageTierId,
  templateId,
  instructions,
  title,
}: DocumentSkeletonPreviewProps) {
  const selectedTier = spec.pageTiers?.find((t) => t.id === pageTierId);
  const activeSections = (spec.structure ?? []).filter((s) => structure.includes(s.id) || s.required);

  // Compute completion progress based on required & filled fields
  const totalFields = spec.groups.flatMap((g) => g.fields);
  const requiredFields = totalFields.filter((f) => f.required);
  const filledRequired = requiredFields.filter((f) => {
    const val = fields[f.id];
    if (Array.isArray(val)) return val.length > 0;
    return val != null && String(val).trim().length > 0;
  });
  const progressPercent = requiredFields.length > 0
    ? Math.round((filledRequired.length / requiredFields.length) * 100)
    : 100;

  return (
    <div className="space-y-5">
      {/* Upper Status Bar */}
      <div className="flex items-center justify-between rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
            <LayoutTemplate className="size-5" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
              Estrutura A4 em Tempo Real
            </h4>
            <p className="text-sm font-bold text-foreground font-display">
              {spec.label}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-muted-foreground">Progresso</span>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="h-2 w-20 sm:w-24 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-extrabold text-primary font-mono">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Main A4 Paper Preview Sheet */}
      <div className="relative mx-auto w-full max-w-[540px] aspect-[1/1.414] rounded-3xl border border-border/80 bg-background p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-hidden group transition-all duration-300">
        {/* Subtle Paper Texture & Watermark Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* Paper Header */}
        <div className="relative z-10 space-y-4 border-b border-border/60 pb-5">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="rounded-md border-primary/30 text-primary text-[9px] font-mono uppercase tracking-widest bg-primary/5">
              Dokvera Studio Output
            </Badge>
            {selectedTier && (
              <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                Est. {selectedTier.minPages}–{selectedTier.maxPages} pág.
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold font-display text-foreground leading-tight tracking-tight break-words">
              {title || spec.label}
            </h2>
            {Boolean(fields["subject"]) && (
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <BookOpen className="size-3.5 text-primary/80" />
                {String(fields["subject"])} {fields["institution"] ? `• ${fields["institution"]}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Paper Body Preview (Active Sections & Structure) */}
        <div className="relative z-10 my-auto py-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Índice de Capítulos ({activeSections.length})
            </span>
            <Badge variant="secondary" className="text-[10px] font-medium">
              Formato {fields["citation_style"] ? String(fields["citation_style"]).toUpperCase() : "Oficial"}
            </Badge>
          </div>

          <div className="grid gap-2">
            {activeSections.slice(0, 6).map((sec, idx) => (
              <div
                key={sec.id}
                className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5 text-xs border border-border/50 transition-colors group-hover:bg-muted/60"
              >
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <span className="flex size-5 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold font-mono text-primary">
                    {idx + 1}
                  </span>
                  {sec.label}
                </span>
                <CheckCircle2 className="size-3.5 text-emerald-500" />
              </div>
            ))}
            {activeSections.length > 6 && (
              <p className="text-center text-[10px] text-muted-foreground font-mono">
                + {activeSections.length - 6} secções adicionais incluídas
              </p>
            )}
          </div>
        </div>

        {/* Paper Footer */}
        <div className="relative z-10 border-t border-border/60 pt-4 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">
            {fields["institution"] ? String(fields["institution"]) : "Dokvera Engineered Document"}
          </span>
          <span className="font-mono">Página 1</span>
        </div>
      </div>
    </div>
  );
}
