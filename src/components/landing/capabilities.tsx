import {
  FileStack,
  Layers,
  Sparkles,
  Sliders,
  Download,
  CheckCircle,
  FileCheck2,
  Wand2,
  FileSpreadsheet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Capabilities() {
  const capabilities = [
    {
      icon: Layers,
      title: "Arquitetura Documental Completa",
      badge: "Estrutura",
      description:
        "Diferente de assistentes convencionais que geram blocos contínuos de texto, o Dokvera projeta uma árvore lógica de seções, com sumários, capítulos, subcapítulos e anexos devidamente interligados.",
      featureList: [
        "Índice hierárquico navegável",
        "Divisão equilibrada de tópicos",
        "Conectivos e transições argumentativas",
      ],
    },
    {
      icon: Sparkles,
      title: "Redação com Rigor Técnico e Contextual",
      badge: "Inteligência",
      description:
        "O nosso motor de IA ajusta o vocabulário, as fórmulas protocolares e a profundidade conforme a área do conhecimento, garantindo formalidade académica ou persuasão corporativa.",
      featureList: [
        "Ajuste fino de tom (Formal, Técnico, Executivo)",
        "Terminologia especializada por setor",
        "Eliminação de repetições e generalismos",
      ],
    },
    {
      icon: Sliders,
      title: "Edição Cirúrgica com Assistência de IA",
      badge: "Controlo",
      description:
        "Você não precisa de regenerar o documento inteiro para melhorar um detalhe. Comande a IA para expandir uma tabela, reescrever um parágrafo ou incluir citações em seções pontuais.",
      featureList: [
        "Edição contextual parágrafo a parágrafo",
        "Comandos pontuais de refinamento",
        "Histórico e salvamento contínuo em nuvem",
      ],
    },
    {
      icon: Download,
      title: "Exportação Nativa para Word e PDF",
      badge: "Entrega",
      description:
        "Sem quebras de margem ou perda de fontes. Baixe arquivos .docx com títulos e tabelas nativas do Microsoft Word, ou gere PDFs com diagramação executiva prontos para impressão.",
      featureList: [
        "Ficheiros .docx 100% editáveis no Word",
        "PDFs nítidos em alta resolução vetorial",
        "Modelos visuais executivos e minimalistas",
      ],
    },
  ];

  return (
    <section
      id="capacidades"
      className="py-20 bg-surface/30 border-y border-border/70 scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl px-5">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-3">
            <Wand2 className="size-3 text-primary" />
            <span>Engenharia do Produto</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl md:text-5xl tracking-tight">
            Mais do que gerar texto: criação pensada para documentos
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Combinamos inteligência artificial avançada com design editorial para entregar
            documentos que cumprem as exigências reais do mercado.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-soft flex flex-col justify-between hover:border-primary/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5.5" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {cap.badge}
                    </Badge>
                  </div>

                  <h3 className="font-display text-xl font-bold text-foreground mb-3">
                    {cap.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                    {cap.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60">
                  <ul className="space-y-2 text-xs">
                    {cap.featureList.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-foreground/90 font-medium"
                      >
                        <CheckCircle className="size-3.5 text-primary shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
