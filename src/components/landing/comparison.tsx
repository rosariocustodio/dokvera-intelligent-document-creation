import { Check, X, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function Comparison() {
  const comparisonRows = [
    {
      criterion: "Formato & Apresentação",
      genericChat: "Blocos de texto contínuos no chat, sem paginação nem layout formal.",
      dokvera: "Documento real com paginação virtual, sumário e diagramação executiva.",
    },
    {
      criterion: "Profundidade & Extensão",
      genericChat: "Tende a resumir excessivamente e perder o fio condutor em textos longos.",
      dokvera: "Estruturação aprofundada seção por seção, mantendo coerência do início ao fim.",
    },
    {
      criterion: "Trabalho de Formatação",
      genericChat: "Exige copiar, colar e horas de ajustes manuais de fontes, margens e tabelas.",
      dokvera: "Diagramado automaticamente segundo normas técnicas e padrões editoriais.",
    },
    {
      criterion: "Exportação de Ficheiros",
      genericChat: "Inexistente: não gera arquivos Word nativos (.docx) com hierarquia de estilos.",
      dokvera: "Exportação em 1 clique para Microsoft Word (.docx) e PDF de alta qualidade.",
    },
    {
      criterion: "Organização & Versionamento",
      genericChat: "Mensagens soltas que se perdem no histórico interminável de conversas.",
      dokvera: "Espaço de trabalho privado, rascunhos salvos na nuvem e controle de versões.",
    },
  ];

  return (
    <section id="comparativo" className="py-20 bg-background scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-3">
            <Sparkles className="size-3 text-primary" />
            <span>Diferenciação Tecnológica</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl md:text-5xl tracking-tight">
            Não é apenas IA. É IA pensada para documentos.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Descubra por que assistentes de conversação comuns falham quando o objetivo é entregar
            um documento formal e estruturado.
          </p>
        </div>

        {/* Comparison Table / Cards */}
        <div className="rounded-3xl border border-border/80 bg-card shadow-elevated overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 border-b border-border/80 bg-muted/30 p-5 md:p-6 text-sm font-bold">
            <div className="md:col-span-4 text-muted-foreground uppercase text-[11px] tracking-wider mb-2 md:mb-0">
              Critério de Avaliação
            </div>
            <div className="md:col-span-4 text-muted-foreground flex items-center gap-2 mb-2 md:mb-0">
              <span className="flex size-5 items-center justify-center rounded-full bg-destructive/10 text-destructive text-xs">
                ✕
              </span>
              <span>Chatbots Genéricos</span>
            </div>
            <div className="md:col-span-4 text-primary flex items-center gap-2 font-display text-base">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                ✓
              </span>
              <span>Dokvera AI</span>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/60">
            {comparisonRows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 p-5 md:p-6 text-xs sm:text-sm items-center hover:bg-muted/20 transition-colors"
              >
                <div className="md:col-span-4 font-bold text-foreground mb-1 md:mb-0">
                  {row.criterion}
                </div>
                <div className="md:col-span-4 text-muted-foreground mb-3 md:mb-0 pr-4 flex items-start gap-2">
                  <X className="size-4 text-destructive shrink-0 mt-0.5" />
                  <span>{row.genericChat}</span>
                </div>
                <div className="md:col-span-4 text-foreground font-medium flex items-start gap-2 bg-primary/5 p-3 rounded-2xl md:bg-transparent md:p-0">
                  <Check className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>{row.dokvera}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Callout */}
          <div className="border-t border-border/80 bg-surface/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground text-center sm:text-left">
              Poupe horas de retrabalho com uma plataforma construída especificamente para
              documentos sérios.
            </div>
            <Button asChild size="sm" className="rounded-xl px-5 text-xs font-bold shadow-soft">
              <Link to="/auth">
                Experimentar a Diferença
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
