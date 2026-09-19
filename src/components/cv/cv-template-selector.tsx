import React, { useRef, useState } from "react";
import { Check, LayoutTemplate, Palette, ChevronLeft, ChevronRight, User } from "lucide-react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(() => {
    const idx = CV_TEMPLATES.findIndex((t) => t.id === selectedTemplate);
    return idx >= 0 ? idx : 0;
  });

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-border/80 bg-card/90 p-5 sm:p-7 shadow-soft backdrop-blur-xl">
      {/* Header & Color Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h3 className="flex items-center gap-2 font-display text-base sm:text-lg font-bold text-foreground">
            <LayoutTemplate className="size-5 text-primary" />
            Modelo Visual & Paleta de Cores
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Selecione o estilo visual e a cor de destaque do seu documento.
          </p>
        </div>

        {/* Seletor de Cores de Destaque */}
        <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-2xl border border-border/50 self-start sm:self-auto">
          <Palette className="size-4 text-muted-foreground ml-1" />
          <span className="text-xs font-semibold text-muted-foreground mr-1">Cor:</span>
          <div className="flex items-center gap-2">
            {CV_ACCENT_COLORS.map((c) => {
              const isSelected = c.id === selectedAccent;
              return (
                <button
                  key={c.id}
                  type="button"
                  title={c.label}
                  onClick={() => onSelectAccent(c.id)}
                  className={cn(
                    "size-6 rounded-full transition-all duration-200 relative flex items-center justify-center cursor-pointer",
                    c.bg,
                    isSelected ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-sm" : "hover:scale-105 opacity-80"
                  )}
                >
                  {isSelected && <Check className="size-3.5 text-white stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* EXECUTIVE STUDIO CAROUSEL TRACK */}
      <div className="relative group/carousel">
        {/* Left Scroll Button */}
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 flex size-9 items-center justify-center rounded-full bg-background/95 border border-border shadow-md text-foreground hover:bg-muted transition-all cursor-pointer opacity-90 group-hover/carousel:opacity-100"
          title="Ver modelo anterior"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Right Scroll Button */}
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 flex size-9 items-center justify-center rounded-full bg-background/95 border border-border shadow-md text-foreground hover:bg-muted transition-all cursor-pointer opacity-90 group-hover/carousel:opacity-100"
          title="Ver próximo modelo"
        >
          <ChevronRight className="size-5" />
        </button>

        {/* Scroll Snap Slider Track */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 px-1"
        >
          {CV_TEMPLATES.map((tmpl, idx) => {
            const isSelected = selectedTemplate === tmpl.id;

            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => {
                  setActiveSlide(idx);
                  onSelectTemplate(tmpl.id);
                }}
                className={cn(
                  "snap-start shrink-0 w-[240px] sm:w-[260px] relative flex flex-col text-left rounded-2xl border p-4 transition-all duration-300 cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/40 scale-[1.01]"
                    : "border-border/60 bg-background/70 hover:border-border hover:bg-card hover:shadow-md"
                )}
              >
                {/* Badge */}
                {tmpl.badge && (
                  <span
                    className={cn(
                      "absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wide shadow-xs z-10",
                      tmpl.isPopular
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground border border-border"
                    )}
                  >
                    {tmpl.badge}
                  </span>
                )}

                {/* HIGH-FIDELITY REALISTIC A4 CANVAS MOCKUP (210/297) */}
                <div className="relative mb-3.5 aspect-[210/297] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md p-2.5 text-[7px] text-slate-800 leading-tight">
                  {/* Modern Template Preview */}
                  {tmpl.id === "modern" && (
                    <div className="grid h-full grid-cols-12 rounded bg-slate-50 border border-slate-200/80 overflow-hidden shadow-xs">
                      {/* Sidebar */}
                      <div className="col-span-4 bg-slate-900 text-white p-2 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="size-7 rounded-full bg-slate-700 mx-auto border border-white/20 flex items-center justify-center">
                            <User className="size-3.5 opacity-60" />
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-[8px] truncate">Carlos Sitoe</div>
                            <div className="text-[6px] opacity-75 truncate" style={{ color: currentAccent.hex }}>Gestor de TI</div>
                          </div>
                          <div className="pt-1 border-t border-slate-800 space-y-1 text-[6px]">
                            <div className="font-bold uppercase tracking-wider text-slate-400">Contactos</div>
                            <div className="opacity-80 truncate">Maputo, MZ</div>
                            <div className="opacity-80 truncate">carlos@email.com</div>
                          </div>
                          <div className="pt-1 border-t border-slate-800 space-y-1 text-[6px]">
                            <div className="font-bold uppercase tracking-wider text-slate-400">Skills</div>
                            <div className="bg-slate-800 px-1 py-0.5 rounded text-[5.5px]">Gestão de Projetos</div>
                            <div className="bg-slate-800 px-1 py-0.5 rounded text-[5.5px]">Liderança Técnica</div>
                          </div>
                        </div>
                      </div>
                      {/* Main Column */}
                      <div className="col-span-8 p-2.5 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div>
                            <div className="font-bold text-[9px] text-slate-900" style={{ color: currentAccent.hex }}>Experiência Profissional</div>
                            <div className="text-[6.5px] font-semibold text-slate-800 mt-0.5">Gestor Sénior — Empresa X</div>
                            <div className="text-[5.5px] text-slate-500">2021 – Presente</div>
                            <div className="text-[5.5px] text-slate-600 mt-0.5 line-clamp-2">Liderança de equipas multidisciplinares e gestão de infraestruturas.</div>
                          </div>
                          <div className="pt-1 border-t border-slate-200">
                            <div className="font-bold text-[8.5px] text-slate-900" style={{ color: currentAccent.hex }}>Formação Académica</div>
                            <div className="text-[6.5px] font-semibold text-slate-800 mt-0.5">Licenciatura em Engenharia</div>
                            <div className="text-[5.5px] text-slate-500">UEM — 2020</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Classic ATS Preview */}
                  {tmpl.id === "classic" && (
                    <div className="h-full rounded bg-slate-50 p-2.5 flex flex-col justify-between border border-slate-200/80 shadow-xs">
                      <div>
                        <div className="text-center pb-2 border-b border-slate-300">
                          <div className="font-bold text-[10px] text-slate-900" style={{ color: currentAccent.hex }}>Carlos Alberto Sitoe</div>
                          <div className="text-[6.5px] text-slate-600 font-semibold">Diretor Financeiro & Auditor</div>
                          <div className="text-[5.5px] text-slate-500 mt-0.5">Maputo | +258 84 123 4567 | carlos@email.com</div>
                        </div>
                        <div className="mt-2 space-y-1.5">
                          <div className="font-bold text-[8px] uppercase tracking-wider border-b border-slate-200 pb-0.5" style={{ color: currentAccent.hex }}>
                            Resumo Profissional
                          </div>
                          <div className="text-[5.5px] text-slate-700 leading-relaxed line-clamp-2">
                            Profissional com mais de 8 anos de experiência em gestão financeira e auditoria bancária...
                          </div>
                          <div className="font-bold text-[8px] uppercase tracking-wider border-b border-slate-200 pb-0.5 pt-1" style={{ color: currentAccent.hex }}>
                            Experiência Profissional
                          </div>
                          <div className="text-[6.5px] font-semibold text-slate-800">Diretor de Contabilidade — Banco Y</div>
                          <div className="text-[5.5px] text-slate-500">2019 – 2024</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Minimal Clean Preview */}
                  {tmpl.id === "minimal" && (
                    <div className="h-full rounded bg-slate-50 p-2.5 flex flex-col justify-between border border-slate-200/80 shadow-xs">
                      <div>
                        <div className="pb-2 border-b border-slate-900">
                          <div className="font-extrabold text-[11px] text-slate-900 tracking-tight">Carlos Sitoe</div>
                          <div className="text-[6.5px] text-slate-500">Consultor de Estratégia</div>
                        </div>
                        <div className="mt-2 space-y-2">
                          <div className="grid grid-cols-12 gap-1 text-[6px]">
                            <div className="col-span-4 font-bold text-slate-400 uppercase">Perfil</div>
                            <div className="col-span-8 text-slate-700 line-clamp-2">Especialista em transformação digital e otimização de processos...</div>
                          </div>
                          <div className="grid grid-cols-12 gap-1 text-[6px] border-t border-slate-200 pt-1.5">
                            <div className="col-span-4 font-bold text-slate-400 uppercase">Carreira</div>
                            <div className="col-span-8 text-slate-800 font-semibold">Consultor Sénior — Empresa Z</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bold Creative Preview */}
                  {tmpl.id === "bold" && (
                    <div className="h-full rounded bg-slate-50 flex flex-col border border-slate-200/80 overflow-hidden shadow-xs">
                      <div className="p-2 text-white shadow-xs" style={{ backgroundColor: currentAccent.hex }}>
                        <div className="font-bold text-[9.5px]">Carlos Sitoe</div>
                        <div className="text-[6px] opacity-90">Engenheiro de Software</div>
                      </div>
                      <div className="p-2 space-y-1.5 flex-1 text-[6px]">
                        <div className="font-bold text-[8px] text-slate-900">Resumo das Qualificações</div>
                        <div className="text-[5.5px] text-slate-600 line-clamp-2">Desenvolvimento full-stack, arquitetura de sistemas escaláveis e cloud...</div>
                        <div className="font-bold text-[8px] text-slate-900 pt-1">Experiência Recente</div>
                        <div className="bg-slate-100 p-1 rounded border border-slate-200 text-[5.5px] font-semibold text-slate-800">
                          Tech Lead — Startup Tech (2022-2025)
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Selection Info */}
                <div className="flex items-center justify-between mt-1">
                  <span className="font-display text-xs font-bold text-foreground">
                    {tmpl.label}
                  </span>
                  <div
                    className={cn(
                      "flex size-4.5 items-center justify-center rounded-full border transition-all",
                      isSelected ? "border-primary bg-primary text-primary-foreground shadow-xs" : "border-muted-foreground/40"
                    )}
                  >
                    {isSelected && <Check className="size-3 stroke-[3]" />}
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
    </div>
  );
}


