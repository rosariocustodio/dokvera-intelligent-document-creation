import { useState } from "react";
import {
  FileText,
  Download,
  Sparkles,
  ChevronRight,
  Check,
  Layers,
  Wand2,
  FileCode,
  Share2,
  Maximize2,
  Search,
  BookOpen,
  Briefcase,
  TrendingUp,
  Sliders,
  CornerDownRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DocSample {
  id: string;
  tabLabel: string;
  icon: typeof FileText;
  filename: string;
  docTitle: string;
  category: string;
  meta: {
    words: string;
    pages: string;
    readingTime: string;
    standard: string;
  };
  sections: {
    id: string;
    title: string;
    level: 1 | 2;
  }[];
  content: {
    heading: string;
    leadParagraph: string;
    callout: {
      type: "highlight" | "methodology" | "metric";
      title: string;
      body: string;
    };
    table?: {
      headers: string[];
      rows: string[][];
    };
    secondaryHeading: string;
    bodyParagraphs: string[];
  };
}

const DOC_SAMPLES: DocSample[] = [
  {
    id: "estrategico",
    tabLabel: "Plano Estratégico",
    icon: TrendingUp,
    filename: "Plano_Estrategico_Expansao_2026.docx",
    docTitle: "Plano Estratégico de Expansão e Entrada de Mercado",
    category: "Gestão Executiva & Investimentos",
    meta: {
      words: "3.420 palavras",
      pages: "12 páginas",
      readingTime: "14 min",
      standard: "Padrão Executivo",
    },
    sections: [
      { id: "sumario", title: "1. Sumário Executivo", level: 1 },
      { id: "tese", title: "1.1 Tese de Oportunidade", level: 2 },
      { id: "diagnostico", title: "2. Diagnóstico Competitivo", level: 1 },
      { id: "operacoes", title: "3. Modelo Operacional", level: 1 },
      { id: "projecoes", title: "4. Projeções e ROI", level: 1 },
    ],
    content: {
      heading: "1. Sumário Executivo & Alinhamento Estratégico",
      leadParagraph:
        "Este documento consolida o planejamento de expansão para operações de médio e grande porte, com foco na consolidação de canais digitais e otimização da cadeia de distribuição regional. A proposta estabelece metas claras de escala com disciplina financeira rigorosa.",
      callout: {
        type: "highlight",
        title: "Objetivo Central do Triénio",
        body: "Atingir 28% de participação de mercado no segmento institucional até ao final do terceiro trimestre, com rentabilidade operacional superior a 22%.",
      },
      table: {
        headers: ["Fase de Expansão", "Horizonte Temporal", "Alocação Estimada", "Meta de Retorno"],
        rows: [
          [
            "Fase 1: Infraestrutura Piloto",
            "Meses 01 — 06",
            "18% do Orçamento",
            "Validação Técnica",
          ],
          ["Fase 2: Escala Comercial", "Meses 07 — 18", "46% do Orçamento", "+140% Crescimento"],
          [
            "Fase 3: Consolidação e SLAs",
            "Meses 19 — 36",
            "36% do Orçamento",
            "EBITDA Sustentável",
          ],
        ],
      },
      secondaryHeading: "2. Diagnóstico Setorial e Matriz de Riscos",
      bodyParagraphs: [
        "A análise estrutural indica que a retenção de clientes corporativos depende diretamente de níveis de serviço (SLAs) transparentes e conformidade documental estrita.",
        "A governança do projeto adotará revisões trimestrais com auditoria independente, garantindo que as premissas econômicas permaneçam aderentes à volatilidade do mercado.",
      ],
    },
  },
  {
    id: "tecnico",
    tabLabel: "Relatório Técnico",
    icon: Briefcase,
    filename: "Relatorio_Auditoria_Arquitetura_Cloud.docx",
    docTitle: "Relatório Técnico de Auditoria de Infraestrutura e Cibersegurança",
    category: "Engenharia de Sistemas & Conformidade",
    meta: {
      words: "4.850 palavras",
      pages: "16 páginas",
      readingTime: "18 min",
      standard: "ISO/IEC 27001",
    },
    sections: [
      { id: "escopo", title: "1. Escopo da Avaliação", level: 1 },
      { id: "arquitetura", title: "2. Arquitetura Atual", level: 1 },
      { id: "vulnerabilidades", title: "2.1 Vetores Identificados", level: 2 },
      { id: "remediacao", title: "3. Plano de Remediação", level: 1 },
      { id: "conclusao", title: "4. Parecer e Recomendações", level: 1 },
    ],
    content: {
      heading: "1. Escopo da Auditoria e Parâmetros Metodológicos",
      leadParagraph:
        "O presente relatório técnico examina os protocolos de resiliência, redundância de armazenamento e isolamento perimetral dos clusters de produção. A avaliação seguiu os padrões internacionais de conformidade e mitigação proativa de falhas.",
      callout: {
        type: "methodology",
        title: "Critério de Avaliação Técnica",
        body: "Todos os serviços analisados foram submetidos a testes de carga distribuída e validação estrita de políticas de controle de acesso por privilégio mínimo (Zero Trust).",
      },
      table: {
        headers: [
          "Componente Avaliado",
          "Nível de Criticidade",
          "Status Atual",
          "Ação Recomendada",
        ],
        rows: [
          [
            "Camada de Banco de Dados",
            "Crítica (Tier 1)",
            "Conforme",
            "Ativação de réplica geográfica",
          ],
          [
            "Gateways de API e Borda",
            "Alta (Tier 2)",
            "Atenção Requerida",
            "Reforço de taxa limite (WAF)",
          ],
          ["Serviços de Background", "Média (Tier 3)", "Otimizado", "Revisão de retenção de logs"],
        ],
      },
      secondaryHeading: "2. Plano de Remediação e Marcos de Entrega",
      bodyParagraphs: [
        "Recomenda-se a implementação prioritária do pipeline de testes automatizados de segurança nas primeiras 4 semanas após a homologação deste parecer.",
        "O monitoramento em tempo real garantirá que anomalias sejam contidas antes de qualquer impacto na disponibilidade dos serviços finais.",
      ],
    },
  },
  {
    id: "academico",
    tabLabel: "Monografia Académica",
    icon: BookOpen,
    filename: "Monografia_Sustentabilidade_Logistica.docx",
    docTitle: "Estudo Monográfico: Modelos de Eficiência Energética em Transporte Urbano",
    category: "Investigação Científica & Publicação",
    meta: {
      words: "8.120 palavras",
      pages: "28 páginas",
      readingTime: "32 min",
      standard: "Normas Académicas",
    },
    sections: [
      { id: "intro", title: "1. Introdução Geral", level: 1 },
      { id: "problema", title: "1.1 Justificativa e Hipóteses", level: 2 },
      { id: "referencial", title: "2. Fundamentação Teórica", level: 1 },
      { id: "metodologia", title: "3. Procedimentos Metodológicos", level: 1 },
      { id: "conclusoes", title: "4. Considerações Finais", level: 1 },
    ],
    content: {
      heading: "1. Introdução Geral e Delimitação do Problema",
      leadParagraph:
        "A crescente densidade das áreas urbanas exige uma reconfiguração profunda dos sistemas de distribuição de última milha. Esta investigação propõe um modelo analítico comparativo entre modais elétricos e rotas de roteirização inteligente.",
      callout: {
        type: "metric",
        title: "Hipótese Primária da Pesquisa",
        body: "A adoção de algoritmos preditivos de carga reduz o consumo ponderado de energia fóssil em até 31%, mantendo a aderência aos horários de entrega.",
      },
      table: {
        headers: [
          "Variável Observada",
          "Grupo Amostral A",
          "Grupo Amostral B",
          "Diferença Relativa",
        ],
        rows: [
          ["Consumo Energético / km", "1.42 kWh/km", "1.08 kWh/km", "-23.9% (p < 0.01)"],
          ["Tempo Médio de Espera", "24.5 min", "16.2 min", "-33.8% (p < 0.05)"],
          ["Custo por Entrega", "Ref. Base (100%)", "74.6%", "-25.4% Economia"],
        ],
      },
      secondaryHeading: "2. Metodologia e Coleta de Evidências Empíricas",
      bodyParagraphs: [
        "A coleta foi conduzida através de sensores telemétricos instalados em frotas ativas durante 90 dias ininterruptos de operação comercial contínua.",
        "Os resultados foram normalizados por regressão multivariada para eliminar distorções causadas por variações sazonais de tráfego.",
      ],
    },
  },
];

export function ProductDemo() {
  const [activeSampleId, setActiveSampleId] = useState<string>("estrategico");
  const [activeSectionId, setActiveSectionId] = useState<string>("sumario");
  const [aiActionFeedback, setAiActionFeedback] = useState<string | null>(null);

  const sample = DOC_SAMPLES.find((s) => s.id === activeSampleId) ?? DOC_SAMPLES[0];

  const handleAiAction = (actionName: string) => {
    setAiActionFeedback(`IA Dokvera: ${actionName} aplicado com sucesso.`);
    setTimeout(() => setAiActionFeedback(null), 3000);
  };

  return (
    <section
      id="demonstracao"
      className="scroll-mt-20 py-20 bg-surface/40 border-y border-border/70"
    >
      <div className="mx-auto max-w-6xl px-5">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-3">
            <Sparkles className="size-3 text-primary" />
            <span>Demonstração ao Vivo do Editor</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl md:text-5xl tracking-tight">
            A experiência de criar com o Dokvera
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Uma interface concebida para clareza absoluta: navegue pelo índice, ajuste seções com IA
            e exporte documentos impecáveis.
          </p>
        </div>

        {/* Document Type Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
          {DOC_SAMPLES.map((s) => {
            const Icon = s.icon;
            const isSelected = s.id === activeSampleId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveSampleId(s.id);
                  setActiveSectionId(s.sections[0].id);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                  isSelected
                    ? "bg-foreground text-background shadow-sm ring-2 ring-foreground/20"
                    : "bg-card text-muted-foreground border border-border/80 hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-4" />
                <span>{s.tabLabel}</span>
              </button>
            );
          })}
        </div>

        {/* The SaaS Window Chrome Mockup */}
        <div className="rounded-3xl border border-border/90 bg-card shadow-elevated overflow-hidden">
          {/* Top Window Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-muted/40 px-5 py-3">
            {/* macOS window controls + filename */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="size-3 rounded-full bg-red-500/80" />
                <span className="size-3 rounded-full bg-amber-500/80" />
                <span className="size-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="h-4 w-px bg-border/80 mx-1" />
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground font-mono">
                <FileText className="size-3.5 text-primary" />
                <span>{sample.filename}</span>
              </div>
            </div>

            {/* Sync & Export actions */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Salvo na nuvem</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl text-xs font-semibold gap-1.5 border-border/80"
                onClick={() => handleAiAction("Exportação para Word (.docx)")}
              >
                <Download className="size-3.5 text-primary" />
                <span className="hidden sm:inline">Exportar</span> Word
              </Button>

              <Button
                size="sm"
                className="h-8 rounded-xl text-xs font-bold gap-1.5 shadow-xs"
                onClick={() => handleAiAction("Exportação para PDF")}
              >
                <Download className="size-3.5" />
                <span className="hidden sm:inline">Exportar</span> PDF
              </Button>
            </div>
          </div>

          {/* Editor Core Body: Sidebar + Document Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
            {/* Left Sidebar: Document Outline & Metadata */}
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-border/80 bg-surface/60 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-4">
                  <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px] flex items-center gap-1.5">
                    <Layers className="size-3 text-primary" />
                    Índice do Documento
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {sample.meta.standard}
                  </Badge>
                </div>

                {/* Outline Items */}
                <div className="space-y-1.5">
                  {sample.sections.map((sec) => {
                    const isActive = sec.id === activeSectionId;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setActiveSectionId(sec.id)}
                        className={cn(
                          "w-full text-left rounded-xl px-3 py-2 text-xs font-medium transition-all flex items-center justify-between cursor-pointer",
                          sec.level === 2 && "pl-6",
                          isActive
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                        )}
                      >
                        <span className="truncate">{sec.title}</span>
                        {isActive && <ChevronRight className="size-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Document Stats Box */}
                <div className="mt-8 rounded-2xl border border-border/70 bg-card p-4 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2.5">
                    Métricas do Documento
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground text-[11px] block">Volume:</span>
                      <strong className="text-foreground font-semibold">{sample.meta.words}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[11px] block">Extensão:</span>
                      <strong className="text-foreground font-semibold">{sample.meta.pages}</strong>
                    </div>
                    <div className="col-span-2 pt-1.5 border-t border-border/50 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Tempo estimado de leitura:</span>
                      <strong className="text-foreground">{sample.meta.readingTime}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Pro Tip */}
              <div className="mt-6 pt-4 border-t border-border/60 text-[11px] text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>Formatação automática sincronizada com as normas técnicas.</span>
              </div>
            </div>

            {/* Right Main Area: The Document Sheet Canvas */}
            <div className="lg:col-span-8 bg-muted/20 p-5 md:p-8 flex flex-col justify-between">
              {/* The Virtual A4 Sheet */}
              <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border/80 bg-background p-6 md:p-10 shadow-soft">
                {/* Document Header */}
                <div className="border-b border-border/60 pb-5 mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-1">
                    {sample.category}
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                    {sample.docTitle}
                  </h3>
                </div>

                {/* Section Content */}
                <div className="space-y-4 text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  <h4 className="font-display text-base sm:text-lg font-bold text-foreground">
                    {sample.content.heading}
                  </h4>

                  <p className="text-muted-foreground leading-relaxed">
                    {sample.content.leadParagraph}
                  </p>

                  {/* Callout Box */}
                  <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 my-4 text-xs">
                    <div className="flex items-center gap-2 font-bold text-primary mb-1">
                      <Sparkles className="size-3.5" />
                      <span>{sample.content.callout.title}</span>
                    </div>
                    <p className="text-foreground/80 leading-relaxed font-sans">
                      {sample.content.callout.body}
                    </p>
                  </div>

                  {/* Data Table Preview if present */}
                  {sample.content.table && (
                    <div className="overflow-x-auto my-4 rounded-xl border border-border/70">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-muted/70 border-b border-border/70 text-foreground font-semibold">
                            {sample.content.table.headers.map((h, i) => (
                              <th key={i} className="p-2.5">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {sample.content.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-muted/30">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-2.5 text-muted-foreground text-[11px]">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <h5 className="font-display text-sm sm:text-base font-bold text-foreground pt-2">
                    {sample.content.secondaryHeading}
                  </h5>

                  {sample.content.bodyParagraphs.map((para, idx) => (
                    <p key={idx} className="text-muted-foreground leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              {/* Floating Contextual AI Toolbar */}
              <div className="mt-6 mx-auto w-full max-w-2xl rounded-2xl border border-primary/30 bg-card/95 p-3 backdrop-blur-md shadow-elevated">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <span className="flex size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Wand2 className="size-3.5" />
                    </span>
                    <span>Ações Rápidas de IA:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAiAction("Refinamento de Tom Executivo")}
                      className="h-7 rounded-lg text-[11px] font-semibold hover:bg-primary/10 hover:text-primary"
                    >
                      Ajustar tom
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAiAction("Expansão de Dados e Métricas")}
                      className="h-7 rounded-lg text-[11px] font-semibold hover:bg-primary/10 hover:text-primary"
                    >
                      Expandir seção
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAiAction("Inclusão de Citações e Fontes")}
                      className="h-7 rounded-lg text-[11px] font-semibold hover:bg-primary/10 hover:text-primary"
                    >
                      Adicionar fontes
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAiAction("Validação de Conformidade Formal")}
                      className="h-7 rounded-lg text-[11px] font-semibold hover:bg-primary/10 hover:text-primary"
                    >
                      Verificar normas
                    </Button>
                  </div>
                </div>

                {/* Temporary feedback banner */}
                {aiActionFeedback && (
                  <div className="mt-2 text-center text-[11px] font-medium text-primary animate-fade-in">
                    ✓ {aiActionFeedback}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
