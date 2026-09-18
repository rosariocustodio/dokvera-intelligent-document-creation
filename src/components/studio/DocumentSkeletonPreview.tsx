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
    <div className="space-y-4">
      {/* Upper Status Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LayoutTemplate className="size-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Estrutura em Tempo Real
            </h4>
            <p className="text-sm font-bold text-foreground font-display">
              {spec.label}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-medium text-muted-foreground">Progresso dos Campos</span>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
            <span className="text-xs font-bold text-primary">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Main A4 Paper Preview Sheet */}
      <div className="relative mx-auto w-full max-w-[540px] aspect-[1/1.414] rounded-2xl border border-border/80 bg-background p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-hidden group">
        {/* Subtle Paper Texture & Watermark Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* Paper Header */}
        <div className="relative z-10 space-y-4 border-b border-border/60 pb-5">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="rounded-md border-primary/30 text-primary text-[10px] font-mono uppercase tracking-widest bg-primary/5">
              Dokvera Studio Output
            </Badge>
            {selectedTier && (
              <span className="text-[11px] font-mono text-muted-foreground">
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

        {/* Paper Body - Dynamic Section Skeleton */}
        <div className="relative z-10 flex-1 py-6 overflow-y-auto space-y-3 custom-scrollbar">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="size-3.5 text-primary" /> Secções Seleccionadas ({activeSections.length})
          </p>

          <div className="grid gap-2">
            {activeSections.map((sec, idx) => (
              <div 
                key={sec.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border/50 bg-muted/30 transition-all hover:bg-muted/60"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-[10px] font-bold font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-foreground truncate">
                    {sec.label}
                  </span>
                </div>
                {sec.required ? (
                  <Badge variant="secondary" className="text-[9px] rounded-md shrink-0">
                    Obrigatório
                  </Badge>
                ) : (
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                )}
              </div>
            ))}
          </div>

          {instructions && instructions.trim().length > 0 && (
            <div className="mt-4 p-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 text-xs text-muted-foreground space-y-1">
              <span className="font-semibold text-primary flex items-center gap-1 text-[11px]">
                <Sparkles className="size-3" /> Instruções Especiais Aplicadas
              </span>
              <p className="line-clamp-2 text-[11px] italic">"{instructions}"</p>
            </div>
          )}
        </div>

        {/* Paper Footer / Metadata */}
        <div className="relative z-10 border-t border-border/60 pt-4 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            {fields["students"] && Array.isArray(fields["students"]) && (fields["students"] as string[]).length > 0 && (
              <span className="flex items-center gap-1 font-medium">
                <User className="size-3 text-primary" />
                {(fields["students"] as string[]).length} Autor(es)
              </span>
            )}
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70">
            Formatação Profissional • Dokvera Engine
          </span>
        </div>
      </div>
    </div>
  );
}
