import { MessageSquareText, Cpu, FileDown, CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      badge: "Entrada Inteligente",
      title: "Diga o que precisa",
      description:
        "Descreva o objetivo do seu documento em linguagem simples e natural. Indique o público-alvo, os pontos obrigatórios ou apenas o tema central que deseja desenvolver.",
      visual: (
        <div className="rounded-2xl border border-border/80 bg-background/90 p-4 font-mono text-[11px] text-muted-foreground shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider text-primary font-bold mb-1">
            Prompt / Instrução
          </div>
          <p className="text-foreground leading-snug">
            "Preciso de uma proposta comercial para consultoria em segurança de dados com
            metodologia e cronograma."
          </p>
        </div>
      ),
    },
    {
      number: "02",
      badge: "Engenharia de Conteúdo",
      title: "A IA estrutura e desenvolve",
      description:
        "O motor de IA do Dokvera não gera texto genérico: ele projeta um índice navegável, capítulos proporcionais, vocabulário técnico rigoroso e elementos de suporte (tabelas e callouts).",
      visual: (
        <div className="rounded-2xl border border-border/80 bg-background/90 p-4 text-[11px] space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
            <span>Estruturação Ativa</span>
            <span className="text-emerald-500 font-bold">100% Completo</span>
          </div>
          <div className="flex items-center gap-2 text-foreground font-medium">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>Capítulo 1: Diagnóstico e Escopo</span>
          </div>
          <div className="flex items-center gap-2 text-foreground font-medium">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>Capítulo 2: Metodologia e SLAs</span>
          </div>
        </div>
      ),
    },
    {
      number: "03",
      badge: "Controle & Exportação",
      title: "Aperfeiçoe e utilize",
      description:
        "Tenha controle total: edite diretamente no canvas, use a barra de IA contextual para refinar parágrafos específicos e exporte em Word (.docx) 100% editável ou PDF pronto para envio.",
      visual: (
        <div className="rounded-2xl border border-border/80 bg-background/90 p-4 shadow-2xs flex items-center justify-around gap-3">
          <div className="flex flex-col items-center">
            <Badge variant="outline" className="text-[10px] font-bold py-1 px-3 mb-1">
              Word (.docx)
            </Badge>
            <span className="text-[10px] text-muted-foreground">Totalmente editável</span>
          </div>
          <div className="h-8 w-px bg-border/80" />
          <div className="flex flex-col items-center">
            <Badge variant="secondary" className="text-[10px] font-bold py-1 px-3 mb-1">
              PDF Vetorial
            </Badge>
            <span className="text-[10px] text-muted-foreground">Pronto para imprimir</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      id="como-funciona"
      className="py-20 bg-surface/30 border-y border-border/70 scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl px-5">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-3">
            <span>Processo Simplificado</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl md:text-5xl tracking-tight">
            Como funciona a criação no Dokvera
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Três etapas simples separam a sua ideia inicial de um documento executivo finalizado.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-soft"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-display text-4xl md:text-5xl font-extrabold text-primary/20">
                    {step.number}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {step.badge}
                  </Badge>
                </div>

                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                  {step.description}
                </p>
              </div>

              {/* Visual Micro-Card */}
              <div className="pt-2">{step.visual}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
