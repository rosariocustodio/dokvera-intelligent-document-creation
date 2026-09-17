import { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Layers,
  Cpu,
  BookOpen,
  Briefcase,
  UserCheck,
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
  steps: { label: string }[];
  chapters: {
    number: string;
    title: string;
    excerpt: string;
    tag: string;
  }[];
}

const PRESETS: PresetScenario[] = [
  {
    id: "academico",
    label: "Trabalhos Académicos & Teses",
    icon: BookOpen,
    prompt:
      "Elaborar uma monografia científica sobre a aplicação da IA na otimização de redes de distribuição e sustentabilidade urbana.",
    docTitle: "A Inteligência Artificial e a Sustentabilidade Urbana",
    category: "Investigação Científica & Normas Formais",
    steps: [
      { label: "Delimitação do problema e estrutura de capítulos" },
      { label: "Aplicação automática de normas de formatação" },
      { label: "Geração de índice, introdução e fundamentação" },
    ],
    chapters: [
      {
        number: "01",
        title: "Introdução & Formulação da Hipótese",
        excerpt:
          "Contextualização rigorosa do problema de estudo, definição de objetivos gerais e específicos com justificativa científica.",
        tag: "Introdução",
      },
      {
        number: "02",
        title: "Revisão da Literatura & Estado da Arte",
        excerpt:
          "Quadro concetual fundamentado nos principais autores seminais e contemporâneos do setor.",
        tag: "Fundamentação",
      },
      {
        number: "03",
        title: "Metodologia & Análise de Dados",
        excerpt:
          "Metodologia mista com amostragem intencional e procedimentos de validação empírica.",
        tag: "Metodologia",
      },
      {
        number: "04",
        title: "Conclusões & Recomendações",
        excerpt:
          "Síntese dos achados de investigação em resposta direta à pergunta central da pesquisa.",
        tag: "Conclusão",
      },
    ],
  },
  {
    id: "executivo",
    label: "Relatórios & Propostas Executivas",
    icon: Briefcase,
    prompt:
      "Criar uma Proposta Comercial e Técnica formal para transformação digital e migração para infraestrutura Cloud segura.",
    docTitle: "Proposta de Transformação Digital & Segurança Cloud",
    category: "Gestão Corporativa & Negócios",
    steps: [
      { label: "Mapeamento dos requisitos e desafios do cliente" },
      { label: "Desenho da solução técnica e cronograma" },
      { label: "Formatação executiva de alto impacto visual" },
    ],
    chapters: [
      {
        number: "01",
        title: "Sumário Executivo & Diagnóstico",
        excerpt:
          "Análise dos desafios operacionais atuais e oportunidade de otimização de custos e processos.",
        tag: "Diagnóstico",
      },
      {
        number: "02",
        title: "Arquitetura da Solução & Entregáveis",
        excerpt:
          "Especificação pormenorizada dos componentes em nuvem com alta disponibilidade e redundância.",
        tag: "Arquitetura",
      },
      {
        number: "03",
        title: "Cronograma de Implementação & SLAs",
        excerpt:
          "Fases de migração progressiva sem interrupção de serviço e garantias contratuais de nível de serviço.",
        tag: "Cronograma",
      },
      {
        number: "04",
        title: "Investimento & Condições Comerciais",
        excerpt:
          "Quadro analítico de custos, retorno do investimento (ROI) e prazos de liquidação.",
        tag: "Proposta",
      },
    ],
  },
  {
    id: "curriculo",
    label: "Currículos Visuais Premium",
    icon: UserCheck,
    prompt:
      "Gerar um Currículo Profissional Executivo focado em Liderança de Operações e Gestão de Projetos Tecnológicos.",
    docTitle: "Currículo Profissional — Modelo Executive",
    category: "Carreira & Perfil Profissional",
    steps: [
      { label: "Organização estratégica de conquistas e métricas" },
      { label: "Seleção do modelo visual refinado" },
      { label: "Hierarquia impecável para leitura rápida" },
    ],
    chapters: [
      {
        number: "01",
        title: "Perfil Executivo & Resumo de Carreira",
        excerpt:
          "Apresentação concisa da trajetória profissional com destaque para resultados quantificáveis e liderança de equipas.",
        tag: "Perfil",
      },
      {
        number: "02",
        title: "Experiência Profissional & Conquistas",
        excerpt:
          "Histórico detalhado por funções, projetos liderados e impacto gerado nas organizações anteriores.",
        tag: "Experiência",
      },
      {
        number: "03",
        title: "Competências Chave & Tecnologias",
        excerpt:
          "Mapeamento claro de soft skills, proficiências técnicas, certificações e idiomas dominados.",
        tag: "Competências",
      },
      {
        number: "04",
        title: "Formação Académica & Certificados",
        excerpt:
          "Graus académicos, especializações e qualificações relevantes em instituições acreditadas.",
        tag: "Formação",
      },
    ],
  },
];

export function InteractiveFlow() {
  const [activePresetId, setActivePresetId] = useState<string>("academico");
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);

  const activePreset = PRESETS.find((p) => p.id === activePresetId) ?? PRESETS[0];
  const activeChapter = activePreset.chapters[activeChapterIndex] ?? activePreset.chapters[0];

  return (
    <div className="w-full">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
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
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs md:text-sm font-semibold transition-all cursor-pointer",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                  : "bg-card text-muted-foreground border border-border/80 hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-4" />
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Main Interactive Card */}
      <div className="rounded-3xl border border-border/80 bg-card/70 p-5 md:p-8 backdrop-blur-xl shadow-xl transition-all">
        {/* Transformation Pipeline Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-6 border-b border-border/70 text-xs font-semibold">
          <div className="flex items-center gap-2.5 text-foreground">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[11px]">
              01
            </span>
            <span>A Sua Ideia / Requisito</span>
          </div>

          <div className="flex items-center gap-2.5 text-primary">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-[11px]">
              02
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="size-3.5" />
              Estruturação Inteligente IA
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-foreground">
            <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
              03
            </span>
            <span className="flex items-center gap-1.5">
              <FileCheck className="size-3.5 text-emerald-500" />
              Documento Final Pronto
            </span>
          </div>
        </div>

        {/* 3 Columns Transformation Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Col 1: Prompt/Requirement */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-border/80 bg-background/70 p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  Instrução Inicial
                </span>
                <Badge variant="outline" className="text-[10px]">
                  Input Livre
                </Badge>
              </div>

              <div className="rounded-xl bg-card p-4 border border-border/60 text-xs text-foreground leading-relaxed italic font-sans shadow-inner">
                "{activePreset.prompt}"
              </div>

              <div className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
                <div>
                  <strong className="text-foreground">Categoria:</strong> {activePreset.category}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Pronto para processar</span>
              <span className="flex size-2 rounded-full bg-emerald-500" />
            </div>
          </div>

          {/* Col 2: AI Pipeline */}
          <div className="lg:col-span-3 flex flex-col justify-center rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
              <Layers className="size-3.5" />
              Processamento Dokvera
            </div>

            <div className="space-y-2.5 text-xs">
              {activePreset.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl bg-background/90 p-2.5 border border-border/70 shadow-2xs"
                >
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-[11px] font-medium text-foreground leading-snug">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Interactive Output Preview */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5 text-primary" />
                  Documento Estruturado
                </span>
                <div className="flex items-center gap-1">
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

              {/* Chapters List */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {activePreset.chapters.map((ch, idx) => {
                  const isSelected = idx === activeChapterIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveChapterIndex(idx)}
                      className={cn(
                        "text-left rounded-xl p-2 border transition-all cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-xs"
                          : "border-border/60 bg-muted/20 hover:border-border hover:bg-muted/50",
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
                      <div className="mt-0.5 text-[11px] font-semibold text-foreground truncate">
                        {ch.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Chapter Excerpt */}
              <div className="mt-3 rounded-xl border border-border/70 bg-background/90 p-3 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Seção ({activeChapter.number})
                  </span>
                  <span className="text-[9px] text-muted-foreground font-mono">Formatado</span>
                </div>
                <div className="text-xs font-bold text-foreground mb-1">{activeChapter.title}</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {activeChapter.excerpt}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground font-medium">Pronto para descarregar</span>
              <span className="font-bold text-primary flex items-center gap-1">
                Ficheiro Editável <ArrowRight className="size-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
