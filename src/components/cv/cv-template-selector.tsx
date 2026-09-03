import React from "react";
import { Check, Sparkles, LayoutTemplate, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { CV_ACCENT_COLORS, type CvAccentColor } from "./cv-document-sheet";

export interface CvTemplateOption {
  id: string;
  label: string;
  description: string;
  badge?: string;
  isPopular?: boolean;
}

export const CV_TEMPLATES: CvTemplateOption[] = [
  {
    id: "modern",
    label: "Moderno Executivo",
    description: "Duas colunas com barra lateral escura para contactos, competências e destaques.",
    badge: "Mais Popular",
    isPopular: true,
  },
  {
    id: "classic",
    label: "Clássico / ATS",
    description: "Uma coluna equilibrada, tipografia sóbria, 100% legível por robôs de RH e banca.",
    badge: "Recomendado ATS",
  },
  {
    id: "minimal",
    label: "Minimalista Clean",
    description: "Espaçamento generoso, estilo suíço contemporâneo, foco direto nas conquistas.",
  },
  {
    id: "bold",
    label: "Destaque Criativo",
    description: "Faixa de cabeçalho impactante com cor de destaque, cartões e ícones elegantes.",
  },
];

interface CvTemplateSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  selectedAccent: CvAccentColor;
  onSelectAccent: (accent: CvAccentColor) => void;
}

export function CvTemplateSelector({
  selectedTemplate,
  onSelectTemplate,
  selectedAccent,
  onSelectAccent,
}: CvTemplateSelectorProps) {
  const currentAccent = CV_ACCENT_COLORS.find((c) => c.id === selectedAccent) ?? CV_ACCENT_COLORS[0];

  return (
    <div className="space-y-5 rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
            <LayoutTemplate className="size-4.5 text-primary" />
            Escolha o Modelo Visual do CV
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Modelos profissionais com pré-visualização instantânea na folha.
          </p>
        </div>

        {/* Seletor de Cores de Destaque */}
        <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-2xl border border-border/50">
          <Palette className="size-3.5 text-muted-foreground ml-1" />
          <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">Cor:</span>
          <div className="flex items-center gap-1.5">
            {CV_ACCENT_COLORS.map((c) => {
              const isSelected = c.id === selectedAccent;
              return (
                <button
                  key={c.id}
                  type="button"
                  title={c.label}
                  onClick={() => onSelectAccent(c.id)}
                  className={cn(
                    "size-5.5 rounded-full transition-all duration-200 relative flex items-center justify-center",
                    c.bg,
                    isSelected ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-sm" : "hover:scale-105 opacity-80"
                  )}
                >
                  {isSelected && <Check className="size-3 text-white stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grelha de Modelos com Miniaturas Reais */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {CV_TEMPLATES.map((tmpl) => {
          const isSelected = selectedTemplate === tmpl.id;
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onSelectTemplate(tmpl.id)}
              className={cn(
                "group relative flex flex-col text-left rounded-2xl border p-3.5 transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/5 shadow-soft ring-2 ring-primary/30"
                  : "border-border/60 bg-background/50 hover:border-border hover:bg-muted/30"
              )}
            >
              {/* Badge de Destaque */}
              {tmpl.badge && (
                <span
                  className={cn(
                    "absolute -top-2 right-3 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide shadow-sm",
                    tmpl.isPopular
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground border border-border"
                  )}
                >
                  {tmpl.badge}
                </span>
              )}

              {/* Miniatura Gráfica do Layout da Folha */}
              <div className="relative mb-3 aspect-[210/260] w-full overflow-hidden rounded-xl border border-border/80 bg-white p-2 shadow-inner">
                {/* Modern Template Mockup */}
                {tmpl.id === "modern" && (
                  <div className="grid h-full grid-cols-12 gap-1 rounded bg-slate-50">
                    <div className="col-span-4 rounded-l bg-slate-900 p-1 space-y-1">
                      <div className="size-3 rounded-full mx-auto" style={{ backgroundColor: currentAccent.hex }} />
                      <div className="h-1 w-full bg-slate-700 rounded" />
                      <div className="h-1 w-3/4 bg-slate-700 rounded" />
                      <div className="my-1 border-t border-slate-800" />
                      <div className="h-1 w-full bg-slate-800 rounded" />
                      <div className="h-1 w-2/3 bg-slate-800 rounded" />
                    </div>
                    <div className="col-span-8 p-1 space-y-1">
                      <div className="h-2 w-3/4 rounded" style={{ backgroundColor: currentAccent.hex }} />
                      <div className="h-1 w-1/2 bg-slate-300 rounded" />
                      <div className="my-1 border-t border-slate-200" />
                      <div className="h-1 w-full bg-slate-200 rounded" />
                      <div className="h-1 w-full bg-slate-200 rounded" />
                      <div className="h-1 w-5/6 bg-slate-200 rounded" />
                      <div className="h-1.5 w-1/3 bg-slate-300 rounded mt-2" />
                      <div className="h-1 w-full bg-slate-200 rounded" />
                    </div>
                  </div>
                )}

                {/* Classic Template Mockup */}
                {tmpl.id === "classic" && (
                  <div className="h-full rounded bg-slate-50 p-2 space-y-1.5 flex flex-col justify-between">
                    <div className="space-y-1 text-center">
                      <div className="h-2 w-2/3 mx-auto rounded" style={{ backgroundColor: currentAccent.hex }} />
                      <div className="h-1 w-1/3 mx-auto bg-slate-400 rounded" />
                      <div className="h-0.5 w-full bg-slate-300 my-1" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-1 w-1/4 rounded font-bold" style={{ backgroundColor: currentAccent.hex }} />
                      <div className="h-1 w-full bg-slate-200 rounded" />
                      <div className="h-1 w-4/5 bg-slate-200 rounded" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-1 w-1/4 rounded font-bold" style={{ backgroundColor: currentAccent.hex }} />
                      <div className="h-1 w-full bg-slate-200 rounded" />
                      <div className="h-1 w-3/4 bg-slate-200 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-1 pt-1">
                      <div className="h-1 bg-slate-200 rounded" />
                      <div className="h-1 bg-slate-200 rounded" />
                    </div>
                  </div>
                )}

                {/* Minimal Template Mockup */}
                {tmpl.id === "minimal" && (
                  <div className="h-full rounded bg-slate-50 p-2 space-y-2">
                    <div className="h-2.5 w-1/2 rounded bg-slate-900" />
                    <div className="h-1 w-1/3 bg-slate-400 rounded" />
                    <div className="grid grid-cols-12 gap-1 pt-2 border-t border-slate-200">
                      <div className="col-span-4 h-1 bg-slate-400 rounded" />
                      <div className="col-span-8 h-1 bg-slate-200 rounded" />
                    </div>
                    <div className="grid grid-cols-12 gap-1 pt-2 border-t border-slate-200">
                      <div className="col-span-4 h-1 bg-slate-400 rounded" />
                      <div className="col-span-8 space-y-1">
                        <div className="h-1 w-full bg-slate-200 rounded" />
                        <div className="h-1 w-3/4 bg-slate-200 rounded" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bold Template Mockup */}
                {tmpl.id === "bold" && (
                  <div className="h-full rounded bg-slate-50 flex flex-col">
                    <div className="h-6 w-full rounded-t p-1" style={{ backgroundColor: currentAccent.hex }}>
                      <div className="h-1.5 w-1/2 bg-white/90 rounded" />
                      <div className="h-1 w-1/3 bg-white/60 rounded mt-0.5" />
                    </div>
                    <div className="p-1.5 space-y-1.5 flex-1">
                      <div className="h-1 w-1/3 rounded" style={{ backgroundColor: currentAccent.hex }} />
                      <div className="h-1 w-full bg-slate-200 rounded" />
                      <div className="h-1 w-4/5 bg-slate-200 rounded" />
                      <div className="h-1 w-1/3 rounded mt-2" style={{ backgroundColor: currentAccent.hex }} />
                      <div className="h-2 w-full bg-slate-100 border border-slate-200 rounded" />
                    </div>
                  </div>
                )}
              </div>

              {/* Informação do Template */}
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold text-foreground">
                  {tmpl.label}
                </span>
                <div
                  className={cn(
                    "flex size-4 items-center justify-center rounded-full border transition-all",
                    isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                  )}
                >
                  {isSelected && <Check className="size-2.5 stroke-[3]" />}
                </div>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground line-clamp-2">
                {tmpl.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
