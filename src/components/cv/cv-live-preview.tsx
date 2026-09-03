import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Eye,
  FileText,
  RotateCcw,
  Palette,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CvDocumentSheet,
  CV_ACCENT_COLORS,
  type CvAccentColor,
  type CvData,
} from "./cv-document-sheet";
import { CV_TEMPLATES } from "./cv-template-selector";

interface CvLivePreviewProps {
  data: CvData;
  template: string;
  onSelectTemplate?: (tmpl: string) => void;
  accentColor: CvAccentColor;
  onSelectAccent?: (color: CvAccentColor) => void;
  country?: string | null;
  className?: string;
}

export function CvLivePreview({
  data,
  template,
  onSelectTemplate,
  accentColor,
  onSelectAccent,
  country,
  className,
}: CvLivePreviewProps) {
  // Zoom level state (0.5 to 1.0)
  const [scale, setScale] = useState<number>(0.65);

  const zoomLevels = [0.45, 0.55, 0.65, 0.75, 0.85, 1.0];

  function handleZoomIn() {
    const currentIdx = zoomLevels.findIndex((z) => Math.abs(z - scale) < 0.05);
    if (currentIdx < zoomLevels.length - 1) {
      setScale(zoomLevels[currentIdx + 1]);
    }
  }

  function handleZoomOut() {
    const currentIdx = zoomLevels.findIndex((z) => Math.abs(z - scale) < 0.05);
    if (currentIdx > 0) {
      setScale(zoomLevels[currentIdx - 1]);
    }
  }

  function handleFit() {
    setScale(0.65);
  }

  return (
    <div className={cn("flex flex-col rounded-3xl border border-border/70 bg-card overflow-hidden shadow-soft", className)}>
      {/* Barra Superior de Controles da Pré-visualização */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 border border-emerald-500/20">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
            </span>
            Sincronizado ao vivo
          </div>
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
            Folha A4 Oficial
          </span>
        </div>

        {/* Controles de Zoom e Ajuste */}
        <div className="flex items-center gap-1.5 bg-background/80 rounded-xl p-1 border border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={handleZoomOut}
            disabled={scale <= zoomLevels[0]}
            title="Reduzir Zoom"
          >
            <ZoomOut className="size-3.5" />
          </Button>
          <span className="min-w-[42px] text-center font-mono text-[11px] font-semibold text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={handleZoomIn}
            disabled={scale >= zoomLevels[zoomLevels.length - 1]}
            title="Aumentar Zoom"
          >
            <ZoomIn className="size-3.5" />
          </Button>
          <div className="h-4 w-px bg-border/80 mx-0.5" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={handleFit}
            title="Ajustar à Janela"
          >
            <Maximize2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Barra Secundária: Atalhos Rápidos de Template & Cor */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-muted/10 px-5 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-medium text-[11px]">Modelo:</span>
          <div className="flex items-center gap-1">
            {CV_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => onSelectTemplate?.(tmpl.id)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all",
                  template === tmpl.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tmpl.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Cores rápidas */}
        {onSelectAccent && (
          <div className="flex items-center gap-1.5">
            {CV_ACCENT_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                title={c.label}
                onClick={() => onSelectAccent(c.id)}
                className={cn(
                  "size-4 rounded-full transition-all",
                  c.bg,
                  accentColor === c.id ? "ring-2 ring-primary ring-offset-1 scale-110" : "opacity-70 hover:opacity-100"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Área da Folha A4 com Scroll e Background Texturizado */}
      <div className="relative flex-1 overflow-auto bg-slate-900/5 dark:bg-slate-950/40 p-4 sm:p-8 flex justify-center items-start min-h-[600px] max-h-[850px]">
        <div
          style={{
            width: `${210 * scale}mm`,
            height: `${297 * scale}mm`,
          }}
          className="relative transition-all duration-200"
        >
          <CvDocumentSheet
            data={data}
            template={template}
            accentColor={accentColor}
            country={country}
            scale={scale}
          />
        </div>
      </div>

      {/* Rodapé da Pré-visualização */}
      <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-5 py-2.5 text-[11px] text-muted-foreground">
        <span>Pré-visualização gerada em alta fidelidade</span>
        <span>A4 • 210 x 297 mm</span>
      </div>
    </div>
  );
}
