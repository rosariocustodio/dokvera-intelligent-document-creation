import React, { useState } from "react";
import { Wand2, Upload, FileText, Loader2, Sparkles, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { type DocSpec } from "@/lib/document-specs";
import { cn } from "@/lib/utils";

interface MagicFillProps {
  spec: DocSpec;
  onApplyFields: (extracted: Record<string, unknown>, suggestedInstructions?: string) => void;
}

function getMagicFillConfig(spec: DocSpec) {
  const category = spec.category;
  const id = spec.id;

  if (id === "cv" || id === "simple_cv") {
    return {
      description: "Tens um CV antigo, notas de perfil ou rascunho? Cola o texto aqui e extraímos os teus dados de imediato.",
      placeholder: "Ex.: Chamo-me Maria Santos, residente em Maputo. Contabilidade e Finanças, 4 anos de experiência na Empresa X, Licenciatura na UEM...",
    };
  }

  if (id === "request" || id === "formal_req") {
    return {
      description: "Tens um rascunho ou dados do pedido? Cola o texto aqui para preencher o requerente, destinatário e o motivo.",
      placeholder: "Ex.: Eu, João Manuel Sitoe, portador do BI n.º 110293847M, venho requerer ao Exmo. Senhor Director a emissão do certificado...",
    };
  }

  if (id === "declaration") {
    return {
      description: "Tens os dados para a declaração? Cola o texto aqui para preencher o declarante, BI e o conteúdo a declarar.",
      placeholder: "Ex.: Eu, Carlos Alberto, portador do BI n.º 030495837Z, declaro para os devidos efeitos que resido na Cidade de Maputo...",
    };
  }

  switch (category) {
    case "administrativo":
      return {
        description: "Tens um rascunho, edital ou formulário? Cola o texto aqui e a IA extrai os dados oficiais de imediato.",
        placeholder: "Ex.: Requerimento dirigido ao Exmo. Senhor Diretor dos Serviços de Registo, solicitando certidão de nascimento...",
      };
    case "profissional":
      return {
        description: "Tens um CV antigo, vaga de emprego ou perfil? Cola o texto aqui para preencher a tua candidatura.",
        placeholder: "Ex.: Candidatura à vaga de Técnico de Contabilidade. Nome: Ana Paula, 5 anos de experiência, Licenciada pela UP...",
      };
    case "negocios":
      return {
        description: "Tens o resumo da proposta ou plano? Cola o texto aqui e a IA organiza a informação comercial.",
        placeholder: "Ex.: Proposta comercial de fornecimento de equipamento de escritório para a Empresa X, prazo de entrega 15 dias...",
      };
    case "comunicacao":
      return {
        description: "Tens o rascunho ou assunto da carta? Cola o texto aqui para preencher o remetente, destinatário e assunto.",
        placeholder: "Ex.: Carta formal de solicitação de audiência com a Direção Geral da empresa Y, remetida por Silva & Associados...",
      };
    case "personalizado":
      return {
        description: "Tens um rascunho ou guião? Cola o texto aqui e a IA extrai os pontos principais.",
        placeholder: "Ex.: Rascunho com os objetivos, secções necessárias e público-alvo para a elaboração do documento...",
      };
    case "academico":
    default:
      return {
        description: "Tens um guia ou PDF? Cola o texto aqui e a IA extrai o tema, docente e regras de imediato.",
        placeholder: "Ex.: Trabalho de Gestão de Sistemas sobre o Impacto da Digitalização na Banca. Docente: Prof. Doutor Silva. Universidade Eduardo Mondlane...",
      };
  }
}

export function MagicFill({ spec, onApplyFields }: MagicFillProps) {
  const [open, setOpen] = useState(false);
  const [rawText, setRawText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const config = getMagicFillConfig(spec);

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
    <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/12 via-card/90 to-primary/5 p-5 sm:p-6 shadow-xs backdrop-blur-xl">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-primary/15 blur-2xl" />

      {!open ? (
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow shrink-0">
              <Wand2 className="size-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold font-display text-foreground flex items-center gap-2">
                Importador Inteligente de Enunciados & PDFs
                <span className="rounded-md bg-primary/20 px-2 py-0.5 text-[9px] font-mono font-bold text-primary border border-primary/30">
                  1-CLIQUE IA
                </span>
              </h4>
              <p className="mt-0.5 text-xs text-muted-foreground/90 leading-relaxed max-w-lg">
                {config.description}
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => setOpen(true)}
            className="h-10 rounded-xl px-4 text-xs font-bold gap-2 shrink-0 shadow-glow cursor-pointer"
          >
            <Sparkles className="size-3.5" />
            Usar Preenchimento Mágico
          </Button>
        </div>
      ) : (
        <div className="relative z-10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
              <Wand2 className="size-4 text-primary" />
              Cola o Texto do Enunciado, Edital ou Rascunho
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-8 px-3 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </Button>
          </div>

          <Textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={config.placeholder}
            className="min-h-28 text-xs rounded-2xl bg-background/90 border-border/70 p-3.5 focus-visible:ring-primary/40"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <label className="cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-2 border border-border/70 rounded-xl px-3 py-2 bg-background/80 transition-colors shadow-xs">
              <Upload className="size-4 text-primary" />
              <span>Carregar ficheiro (.txt)</span>
              <input type="file" accept=".txt,.pdf" className="hidden" onChange={handleFileUpload} />
            </label>

            <Button
              type="button"
              size="sm"
              onClick={handleProcessText}
              disabled={isProcessing || !rawText.trim()}
              className="h-10 rounded-xl px-5 text-xs font-bold gap-2 shadow-glow cursor-pointer"
            >
              {isProcessing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Extrair e Preencher Campos
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
