import React, { useState, useEffect, useRef } from "react";
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
  Expand,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.60);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [modalScale, setModalScale] = useState<number>(0.90);

  const zoomLevels = [0.45, 0.52, 0.60, 0.70, 0.80, 0.90, 1.0];

  // Auto-fit inicial baseado na largura disponível do container
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          // A4 largura padrão = 210mm (~794px a 96 DPI)
          const targetScale = Math.min(0.85, Math.max(0.42, (width - 48) / 794));
          setScale(Number(targetScale.toFixed(2)));
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  function handleZoomIn() {
    const currentIdx = zoomLevels.findIndex((z) => Math.abs(z - scale) < 0.05);
    if (currentIdx < zoomLevels.length - 1) {
      setScale(zoomLevels[currentIdx + 1]);
    } else {
      setScale((prev) => Math.min(1.1, prev + 0.05));
    }
  }

  function handleZoomOut() {
    const currentIdx = zoomLevels.findIndex((z) => Math.abs(z - scale) < 0.05);
    if (currentIdx > 0) {
      setScale(zoomLevels[currentIdx - 1]);
    } else {
      setScale((prev) => Math.max(0.40, prev - 0.05));
    }
  }

  function handleFit() {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const targetScale = Math.min(0.85, Math.max(0.42, (width - 48) / 794));
      setScale(Number(targetScale.toFixed(2)));
    } else {
      setScale(0.60);
    }
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

        {/* Controles de Zoom, Ajuste e Tela Cheia */}
        <div className="flex items-center gap-1.5 bg-background/80 rounded-xl p-1 border border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={handleZoomOut}
            disabled={scale <= 0.40}
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
            disabled={scale >= 1.1}
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
            title="Auto-Ajustar à Largura"
          >
            <Maximize2 className="size-3.5" />
          </Button>

          {/* Modal de Inspeção em Alta Resolução (100%) */}
          <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                title="Abrir em Modo Tela Cheia"
              >
                <Expand className="size-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] lg:max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-0 rounded-3xl">
              <DialogHeader className="p-4 border-b bg-muted/30 flex flex-row items-center justify-between">
                <div>
                  <DialogTitle className="text-base font-bold font-display">
                    Inspeção de Alta Fidelidade (Impressão A4)
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    Visualize o layout final em tamanho original antes de gerar.
                  </p>
                </div>
                <div className="flex items-center gap-2 mr-6">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-xl text-xs"
                    onClick={() => setModalScale((s) => Math.max(0.6, s - 0.1))}
                  >
                    -
                  </Button>
                  <span className="font-mono text-xs">{Math.round(modalScale * 100)}%</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-xl text-xs"
                    onClick={() => setModalScale((s) => Math.min(1.2, s + 0.1))}
                  >
                    +
                  </Button>
                </div>
              </DialogHeader>
              <div className="flex-1 overflow-auto bg-slate-900/10 dark:bg-slate-950 p-6 flex justify-center items-start min-h-[600px]">
                <div className="relative transition-all duration-300 shrink-0 shadow-2xl rounded-sm border border-slate-300/80 bg-white overflow-hidden">
                  <CvDocumentSheet
                    data={data}
                    template={template}
                    accentColor={accentColor}
                    country={country}
                    scale={modalScale}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
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

      {/* Área da Folha A4 com Scroll Suave e Background Texturizado */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-auto bg-slate-900/10 dark:bg-slate-950/60 p-4 sm:p-6 flex justify-center items-start min-h-[520px] max-h-[780px]"
      >
        <div className="relative transition-all duration-300 shrink-0 shadow-2xl rounded-sm border border-slate-300/80 bg-white overflow-hidden">
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
        <span>Folha A4 Oficial • 210 x 297 mm</span>
        <span className="text-[10px] text-primary font-medium">Renderização em Tempo Real</span>
      </div>
    </div>
  );
}
