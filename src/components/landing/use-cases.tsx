import { useState } from "react";
import {
  GraduationCap,
  Briefcase,
  Building2,
  Scale,
  CheckCircle2,
  ArrowRight,
  FileText,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface UseCaseCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof GraduationCap;
  tag: string;
  description: string;
  documentTypes: string[];
  samplePreview: {
    title: string;
    sectionsCount: string;
    excerpt: string;
    badges: string[];
  };
}

const CATEGORIES: UseCaseCategory[] = [
  {
    id: "academico",
    title: "Académico & Investigação",
    subtitle: "Rigor científico e conformidade metodológica",
    icon: GraduationCap,
    tag: "Normas Académicas",
    description:
      "Desenvolva teses, monografias, artigos de revisão e relatórios de estágio com a estrutura formal exata exigida por comissões avaliadoras e periódicos.",
    documentTypes: [
      "Monografias e Teses",
      "Artigos de Revisão Científica",
      "Projetos de Pesquisa",
      "Relatórios de Estágio Curricular",
      "Ensaios Académicos e Resenhas",
    ],
    samplePreview: {
      title: "Monografia: Eficiência Energética em Redes de Distribuição Urbana",
      sectionsCount: "6 Capítulos Estruturados",
      excerpt:
        "Estruturação completa com Introdução, Justificativa, Delimitação do Problema, Revisão da Literatura, Metodologia Quantitativa e Referências segundo normas formais.",
      badges: ["Capa e Contracapa", "Sumário Automático", "Citações ABNT/APA"],
    },
  },
  {
    id: "profissional",
    title: "Profissional & Carreira",
    subtitle: "Destaque e autoridade em processos seletivos",
    icon: Briefcase,
    tag: "Compatível com ATS",
    description:
      "Construa currículos executivos de alto impacto visual, cartas de motivação direcionadas e pareceres profissionais que superam filtros automatizados de recrutamento.",
    documentTypes: [
      "Currículos Executivos (4 Modelos Visuais)",
      "Cartas de Apresentação e Motivação",
      "Pareceres Técnicos e Recomendações",
      "Portfólios Estruturados de Conquistas",
    ],
    samplePreview: {
      title: "Currículo Executivo: Direção de Operações e Tecnologia",
      sectionsCount: "Design em 2 Colunas",
      excerpt:
        "Resumo de qualificações estratégicas, métricas quantitativas de impacto, histórico profissional hierarquizado e competências técnicas com legibilidade otimizada.",
      badges: ["Design ATS-Friendly", "4 Modelos de Estilo", "Exportação Word e PDF"],
    },
  },
  {
    id: "negocios",
    title: "Negócios & Empresas",
    subtitle: "Documentos comerciais que geram credibilidade e fecham contratos",
    icon: Building2,
    tag: "Corporativo & Estratégico",
    description:
      "Apresente a sua empresa com planos de negócios robustos, propostas comerciais de alto valor, relatórios de auditoria e atas executivas claras.",
    documentTypes: [
      "Planos Estratégicos de Negócios",
      "Propostas Comerciais e Técnicas",
      "Relatórios Gerenciais e de Auditoria",
      "Atas de Assembleia e Governança",
    ],
    samplePreview: {
      title: "Proposta Comercial: Transformação Digital e Infraestrutura em Nuvem",
      sectionsCount: "Escopo e SLAs Detalhados",
      excerpt:
        "Apresentação da solução com matriz de entregáveis, cronograma em marcos, tabela detalhada de investimentos e termos de confidencialidade.",
      badges: ["Tabelas de Custos", "Cronograma de Fases", "Minuta Contratual"],
    },
  },
  {
    id: "administrativo",
    title: "Administrativo & Formal",
    subtitle: "Protocolo impecável para instituições públicas e privadas",
    icon: Scale,
    tag: "Fórmulas Protocolares",
    description:
      "Redija requerimentos oficiais, declarações institucionais, ofícios e minutas com o vocabulário protocolar e a redação jurídica correta.",
    documentTypes: [
      "Requerimentos Administrativos",
      "Declarações Oficiais e Termos",
      "Ofícios e Comunicações Formais",
      "Cartas Institucionais de Solicitação",
    ],
    samplePreview: {
      title: "Requerimento Administrativo: Solicitação de Certidão Oficial",
      sectionsCount: "Fórmula Protocolar Padrão",
      excerpt:
        "Cabeçalho institucional alinhado, qualificação formal do requerente, exposição fundamentada dos fatos, amparo legal e fecho protocolar com data e assinatura.",
      badges: ["Linguagem Jurídica", "Timbre e Margens", "Pronto para Assinatura"],
    },
  },
];

export function UseCases() {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("academico");

  const activeCategory = CATEGORIES.find((c) => c.id === activeCategoryId) ?? CATEGORIES[0];

  return (
    <section id="solucoes" className="py-20 bg-background scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-3">
            <Sparkles className="size-3 text-primary" />
            <span>Soluções por Área de Atuação</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl md:text-5xl tracking-tight">
            Criado para documentos que exigem excelência
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Uma plataforma versátil projetada para atender aos mais altos padrões de redação
            técnica, científica e corporativa.
          </p>
        </div>

        {/* Category Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = cat.id === activeCategoryId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryId(cat.id)}
                className={cn(
                  "flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-soft ring-2 ring-primary/20"
                    : "border-border/80 bg-card hover:border-border hover:bg-muted/50",
                )}
              >
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl mb-3",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-4.5" />
                </div>
                <span className="text-xs font-bold text-foreground mb-0.5">{cat.title}</span>
                <span className="text-[11px] text-muted-foreground line-clamp-1">
                  {cat.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Category Deep Dive Card */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-10 shadow-soft">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-6">
              <Badge variant="outline" className="text-[11px] font-bold mb-3">
                {activeCategory.tag}
              </Badge>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-3">
                {activeCategory.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                {activeCategory.description}
              </p>

              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                Tipos de Documentos Suportados:
              </span>
              <ul className="space-y-2 text-xs">
                {activeCategory.documentTypes.map((docType, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-foreground font-medium">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>{docType}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button asChild size="sm" className="rounded-xl px-5 text-xs font-bold shadow-soft">
                  <Link to="/auth">
                    Criar neste formato agora
                    <ArrowRight className="ml-1.5 size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Preview Card */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-border/80 bg-background/95 p-6 md:p-8 shadow-inner">
                <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <FileText className="size-3.5" />
                    Exemplo de Estrutura Gerada
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {activeCategory.samplePreview.sectionsCount}
                  </Badge>
                </div>

                <h4 className="font-display text-sm md:text-base font-bold text-foreground mb-3 leading-snug">
                  {activeCategory.samplePreview.title}
                </h4>

                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                  {activeCategory.samplePreview.excerpt}
                </p>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/60">
                  {activeCategory.samplePreview.badges.map((b, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground border border-border/60"
                    >
                      ✓ {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
