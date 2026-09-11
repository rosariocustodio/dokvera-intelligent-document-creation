import { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Layers,
  Cpu,
  Download,
  BookOpen,
  Briefcase,
  TrendingUp,
  FileCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PresetScenario {
  id: string;
  label: string;
  icon: typeof FileText;
  prompt: string;
  docTitle: string;
  category: string;
  steps: { label: string; status: "done" | "active" }[];
  chapters: {
    number: string;
    title: string;
    excerpt: string;
    tag: string;
  }[];
}

const PRESETS: PresetScenario[] = [
  {
    id: "negocios",
    label: "Plano Estratégico",
    icon: TrendingUp,
    prompt:
      "Elaborar um Plano de Negócios completo para expansão de operações B2B, com diagnóstico de mercado, modelo financeiro e mitigação de riscos.",
    docTitle: "Plano Estratégico de Crescimento e Expansão B2B",
    category: "Gestão Corporativa & Investimentos",
    steps: [
      { label: "Análise de modelo operacional e mercado", status: "done" },
      { label: "Geração de matriz de viabilidade e riscos", status: "done" },
      { label: "Estruturação executiva em capítulos ABNT/ISO", status: "done" },
    ],
    chapters: [
      {
        number: "01",
        title: "Sumário Executivo & Tese de Valor",
        excerpt:
          "Definição clara da oportunidade de mercado, diferenciais competitivos e plano de captação de clientes institucionais no primeiro biênio.",
        tag: "Visão Geral",
      },
      {
        number: "02",
        title: "Diagnóstico de Mercado & Concorrência",
        excerpt:
          "Análise setorial detalhada com dados quantitativos, identificação de barreiras de entrada e posicionamento de preço premium.",
        tag: "Pesquisa de Mercado",
      },
      {
        number: "03",
        title: "Plano Operacional & Recursos Críticos",
        excerpt:
          "Cronograma de implementação por marcos, alocação de tecnologia e dimensionamento de equipa técnica necessária.",
        tag: "Operações",
      },
      {
        number: "04",
        title: "Projeções Financeiras & Retorno (ROI)",
        excerpt:
          "Fluxo de caixa projetado a 36 meses, análise de ponto de equilíbrio (Break-even) e métricas de retorno sobre o investimento.",
        tag: "Finanças",
      },
    ],
  },
  {
    id: "academico",
    label: "Investigação Científica",
    icon: BookOpen,
    prompt:
      "Estruturar uma monografia académica sobre o impacto da transformação digital na sustentabilidade de cadeias de suprimentos urbanas.",
    docTitle: "A Transformação Digital e a Sustentabilidade em Cadeias de Suprimentos",
    category: "Monografia Científica & Revisão Teórica",
    steps: [
      { label: "Definição de problema e hipóteses de estudo", status: "done" },
      { label: "Mapeamento metodológico e referencial teórico", status: "done" },
      { label: "Adequação estrita às normas académicas formais", status: "done" },
    ],
    chapters: [
      {
        number: "01",
        title: "Introdução & Delimitação do Tema",
        excerpt:
          "Contextualização do problema de pesquisa, formulação da pergunta central e justificativa da relevância científica e social.",
        tag: "Introdução",
      },
      {
        number: "02",
        title: "Revisão da Literatura & Estado da Arte",
        excerpt:
          "Quadro conceitual abrangendo estudos seminais e contemporâneos sobre logística reversa e automação de processos logísticos.",
        tag: "Referencial",
      },
      {
        number: "03",
        title: "Metodologia & Coleta de Evidências",
        excerpt:
          "Abordagem mista (qualitativa e quantitativa) com amostragem intencional de operadores logísticos e análise descritiva de dados.",
        tag: "Metodologia",
      },
      {
        number: "04",
        title: "Discussão dos Resultados & Conclusões",
        excerpt:
          "Triangulação empírica dos dados coletados em contraste com a teoria, respondendo diretamente aos objetivos propostos.",
        tag: "Conclusão",
      },
    ],
  },
  {
    id: "proposta",
    label: "Proposta Comercial",
    icon: Briefcase,
    prompt:
      "Criar uma proposta técnica e comercial formal para fornecimento de infraestrutura em nuvem e segurança de dados corporativa.",
    docTitle: "Proposta Comercial & Técnica: Soluções Cloud e Segurança",
    category: "Proposta Comercial de Alto Valor",
    steps: [
      { label: "Mapeamento dos requisitos do cliente e SLAs", status: "done" },
      { label: "Desenho da arquitetura e matriz de entregáveis", status: "done" },
      { label: "Formatação contratual com valores e cronograma", status: "done" },
    ],
    chapters: [
      {
        number: "01",
        title: "Compreensão dos Desafios do Cliente",
        excerpt:
          "Diagnóstico das vulnerabilidades atuais e alinhamento dos objetivos estratégicos de proteção de dados com a nova arquitetura.",
        tag: "Diagnóstico",
      },
      {
        number: "02",
        title: "Escopo Técnico & Arquitetura Proposta",
        excerpt:
          "Especificação minuciosa de ambientes em nuvem com redundância geográfica, criptografia em repouso e políticas zero-trust.",
        tag: "Engenharia",
      },
      {
        number: "03",
        title: "Cronograma de Implantação e SLAs",
        excerpt:
          "Plano de migração progressiva em 4 fases, com garantia contratual de 99.95% de disponibilidade e suporte técnico 24/7.",
        tag: "Prazos & Níveis",
      },
      {
        number: "04",
        title: "Investimento, Faturamento & Termos",
        excerpt:
          "Tabela analítica de custos recorrentes e pontuais, formas de liquidação e cláusulas de conformidade com privacidade.",
        tag: "Comercial",
      },
    ],
  },
];

export function InteractiveFlow() {
  const [activePresetId, setActivePresetId] = useState<string>("negocios");
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);

  const activePreset = PRESETS.find((p) => p.id === activePresetId) ?? PRESETS[0];
  const activeChapter = activePreset.chapters[activeChapterIndex] ?? activePreset.chapters[0];

  return (
    <div className="w-full">
      {/* Preset Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <span className="text-xs font-semibold text-muted-foreground mr-2">
          Exemplos de fluxo real:
        </span>
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isSelected = preset.id === activePresetId;
          return (
            <button
              key={preset.id}
              onClick={() => {
                setActivePresetId(preset.id);
                setActiveChapterIndex(0);
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                isSelected
                  ? "bg-foreground text-background shadow-xs ring-2 ring-foreground/20"
                  : "bg-card text-muted-foreground border border-border/80 hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-3.5" />
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Main Interactive Flow Box */}
      <div className="rounded-3xl border border-border/80 bg-card/60 p-5 md:p-8 backdrop-blur-xl shadow-elevated transition-all">
        {/* Step Indicator Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-6 border-b border-border/70 text-xs font-semibold">
          <div className="flex items-center gap-2.5 text-foreground">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[11px]">
              01
            </span>
            <span>A Sua Ideia ou Demanda</span>
          </div>

          <div className="flex items-center gap-2.5 text-primary">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-[11px] animate-pulse">
              02
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="size-3.5 animate-spin" />
              Processamento & Estruturação IA
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-foreground">
            <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
              03
            </span>
            <span className="flex items-center gap-1.5">
              <FileCheck className="size-3.5 text-emerald-500" />
              Documento Profissional Estruturado
            </span>
          </div>
        </div>

        {/* The 3 Columns Transformation Engine */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Column 1: Natural Language Input Card */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-border/80 bg-background/70 p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  Instrução Inicial
                </span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  Input Livre
                </Badge>
              </div>

              <div className="rounded-xl bg-card p-4 border border-border/60 text-xs text-foreground leading-relaxed italic font-sans shadow-inner">
                "{activePreset.prompt}"
              </div>

              <div className="mt-4 space-y-2">
                <div className="text-[11px] text-muted-foreground">
                  <strong className="text-foreground">Objetivo:</strong> Produzir documento com
                  estrutura executiva completa, sem atalhos ou generalismos.
                </div>
                <div className="text-[11px] text-muted-foreground">
                  <strong className="text-foreground">Categoria:</strong> {activePreset.category}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Pronto para processar</span>
              <span className="flex size-2 rounded-full bg-emerald-500" />
            </div>
          </div>

          {/* Column 2: The AI Structuring Pipeline */}
          <div className="lg:col-span-3 flex flex-col justify-center rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <Layers className="size-3.5" />
              Raciocínio da IA Dokvera
            </div>

            <div className="space-y-3.5 text-xs">
              {activePreset.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl bg-background/80 p-3 border border-border/70 shadow-2xs"
                >
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-[11px] font-medium text-foreground leading-snug">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl bg-primary/10 p-3 text-center text-[10px] font-semibold text-primary">
              ✦ Hierarquia lógica e rigor técnico garantidos
            </div>
          </div>

          {/* Column 3: Generated Document Hierarchy & Preview */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5 text-primary" />
                  Estrutura Criada
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    Exporta para:
                  </span>
                  <Badge variant="secondary" className="text-[9px] font-bold px-1.5 py-0.5">
                    Word (.docx)
                  </Badge>
                  <Badge variant="secondary" className="text-[9px] font-bold px-1.5 py-0.5">
                    PDF
                  </Badge>
                </div>
              </div>

              <h4 className="font-display text-sm font-bold text-foreground leading-snug">
                {activePreset.docTitle}
              </h4>

              {/* Interactive Chapters List */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activePreset.chapters.map((ch, idx) => {
                  const isSelected = idx === activeChapterIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveChapterIndex(idx)}
                      className={cn(
                        "text-left rounded-xl p-2.5 border transition-all cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border/60 bg-muted/30 hover:border-border hover:bg-muted/60",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold font-mono text-primary">
                          {ch.number}
                        </span>
                        <span className="text-[9px] font-semibold text-muted-foreground">
                          {ch.tag}
                        </span>
                      </div>
                      <div className="mt-1 text-xs font-semibold text-foreground truncate">
                        {ch.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Chapter Live Excerpt Card */}
              <div className="mt-4 rounded-xl border border-border/70 bg-background/90 p-3.5 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Seção Selecionada ({activeChapter.number})
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Pronta para edição
                  </span>
                </div>
                <div className="text-xs font-bold text-foreground mb-1">{activeChapter.title}</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {activeChapter.excerpt}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">
                Documento completo pronto para refinar ou exportar
              </span>
              <span className="font-bold text-primary flex items-center gap-1">
                Visualizar documento <ArrowRight className="size-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
