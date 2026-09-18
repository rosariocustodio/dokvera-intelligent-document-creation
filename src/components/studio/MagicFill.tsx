import React, { useState } from "react";
import { Wand2, Upload, FileText, Loader2, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { type DocSpec } from "@/lib/document-specs";

interface MagicFillProps {
  spec: DocSpec;
  onApplyFields: (extracted: Record<string, unknown>, suggestedInstructions?: string) => void;
}

export function MagicFill({ spec, onApplyFields }: MagicFillProps) {
  const [open, setOpen] = useState(false);
  const [rawText, setRawText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessText = () => {
    if (!rawText.trim()) {
      toast.error("Por favor insere o texto do teu enunciado ou rascunho.");
      return;
    }

    setIsProcessing(true);

    // Heuristic Smart Extractor for instant UX
    setTimeout(() => {
      const text = rawText;
      const extracted: Record<string, unknown> = {};
      let instructions = "";

      // Smart pattern matching for common Mozambican / Academic terms
      const themeMatch = text.match(/(?:tema|assunto|título|titulo|sobre)[:\s]+([^\n\.]+)/i);
      if (themeMatch && themeMatch[1]) {
        if (spec.titleFieldId) extracted[spec.titleFieldId] = themeMatch[1].trim();
        else extracted["theme"] = themeMatch[1].trim();
      }

      const subjectMatch = text.match(/(?:disciplina|cadeira|módulo|modulo)[:\s]+([^\n\.]+)/i);
      if (subjectMatch && subjectMatch[1]) extracted["subject"] = subjectMatch[1].trim();

      const instMatch = text.match(/(?:universidade|instituição|instituicao|escola|faculdade)[:\s]+([^\n\.]+)/i);
      if (instMatch && instMatch[1]) extracted["institution"] = instMatch[1].trim();

      const teacherMatch = text.match(/(?:docente|professor|orientador|tutor)[:\s]+([^\n\.]+)/i);
      if (teacherMatch && teacherMatch[1]) extracted["teacher"] = teacherMatch[1].trim();

      const courseMatch = text.match(/(?:curso|licenciatura|mestrado)[:\s]+([^\n\.]+)/i);
      if (courseMatch && courseMatch[1]) extracted["course"] = courseMatch[1].trim();

      // Anything left or full context becomes special instructions
      instructions = `Auto-extraído do enunciado: ${text.slice(0, 300)}...`;

      onApplyFields(extracted, instructions);
      setIsProcessing(false);
      setOpen(false);
      setRawText("");
      toast.success("Campos preenchidos com sucesso a partir do texto!");
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "application/pdf" || file.name.endsWith(".pdf") || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setRawText(text || `Documento carregado: ${file.name}`);
        toast.info("Texto do ficheiro carregado. Clica em Extrair.");
      };
      reader.readAsText(file);
    } else {
      toast.error("Por favor envia um ficheiro de texto (.txt) ou cola o texto do PDF diretamente.");
    }
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-4 shadow-xs">
      {!open ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs shrink-0">
              <Wand2 className="size-4 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-display text-foreground flex items-center gap-1.5">
                Preenchimento Mágico IA
                <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-primary">
                  NOVO
                </span>
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Tens um enunciado ou guia em PDF? Deixa a IA extrair o tema, docentes e regras.
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => setOpen(true)}
            className="rounded-xl text-xs font-semibold gap-1.5 shrink-0"
          >
            <Sparkles className="size-3.5" />
            Usar Preenchimento Mágico
          </Button>
        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Wand2 className="size-3.5 text-primary" />
              Cola aqui o Enunciado, Edital ou Rascunho
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-7 px-2 text-xs"
            >
              Cancelar
            </Button>
          </div>

          <Textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Ex.: Trabalho de Gestão sobre Impacto da Digitalização na Banca. Docente: Prof. Silva. Universidade Eduardo Mondlane..."
            className="min-h-24 text-xs rounded-xl bg-background"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="cursor-pointer text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1.5 border border-border/60 rounded-lg px-2.5 py-1.5 bg-background">
              <Upload className="size-3.5 text-primary" />
              <span>Ou carregar ficheiro (.txt)</span>
              <input type="file" accept=".txt,.pdf" className="hidden" onChange={handleFileUpload} />
            </label>

            <Button
              type="button"
              size="sm"
              onClick={handleProcessText}
              disabled={isProcessing || !rawText.trim()}
              className="rounded-xl text-xs font-semibold gap-2"
            >
              {isProcessing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
              Extrair e Preencher
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
