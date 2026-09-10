import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  FileStack,
  FolderTree,
  Layers,
  ListOrdered,
  ShieldCheck,
  Sparkles,
  Wand2,
  GraduationCap,
  Briefcase,
  Building2,
  Scale,
  MessageSquare,
  FileText,
  Smartphone,
  Download,
  Eye,
  Star,
  Users,
  Zap,
  HelpCircle,
  ChevronDown,
  LayoutTemplate,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  listCountries,
  DEFAULT_COUNTRY,
  getCountryConfig,
  type CountryCode,
} from "@/lib/countries";
import {
  CREDIT_PACKS,
  creditsToCurrency,
  formatCurrency,
  packPriceInCountry,
  packTotalCredits,
} from "@/lib/dokvera";
import { DOC_CATEGORIES, DOC_SPECS, type DocCategory } from "@/lib/document-specs";

const title = "Dokvera — Documentos Académicos e Profissionais com IA Estruturada";
const description =
  "Crie monografias, relatórios, currículos (CV), requerimentos e cartas oficiais com IA estruturada e formatação profissional. Experimente grátis com 10 créditos.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Landing,
});

const comparisonData = [
  {
    feature: "Estrutura e Capa Oficial",
    chatgpt: "Texto corrido sem capa nem normas formais",
    dokvera: "Capa, contracapa, índice e normas de Moçambique/CPLP prontas",
  },
  {
    feature: "Pré-visualização em Folha A4",
    chatgpt: "Nenhuma (apenas mensagens soltas em chat)",
    dokvera: "Folha A4 em tempo real com zoom e modelos executivos",
  },
  {
    feature: "Exportação Fiel",
    chatgpt: "Copiar e colar manual que desconfigura as margens",
    dokvera: "Exportação em 1 clique para Word (.docx) e PDF Timbrado",
  },
  {
    feature: "Modelos Profissionais de CV",
    chatgpt: "Listas de texto simples sem design gráfico",
    dokvera: "4 modelos visuais (Moderno, Clássico ATS, Minimalista, Destaque)",
  },
  {
    feature: "Organização e Histórico",
    chatgpt: "Conversas perdidas no histórico do chat",
    dokvera: "Espaço privado com rascunhos, versionamento e duplicador",
  },
];

const useCases = [
  {
    role: "Estudantes & Investigadores",
    icon: GraduationCap,
    headline: "Monografias, Resenhas e Relatórios sem o pesadelo da formatação.",
    text: "O Dokvera estrutura os objetivos gerais e específicos, introdução, capítulos, metodologia e referências bibliográficas no padrão exigido pelas universidades.",
    tag: "Normas Académicas",
  },
  {
    role: "Profissionais & Candidatos",
    icon: Briefcase,
    headline: "Currículos e Cartas de Apresentação que passam nos filtros de RH.",
    text: "Crie um CV moderno de alta fidelidade com foto, 2 colunas executivas e destaques em minutos. Aumente em até 3x a sua taxa de resposta em processos seletivos.",
    tag: "100% Compatível com ATS",
  },
  {
    role: "Empreendedores & Empresas",
    icon: Building2,
    headline: "Propostas comerciais, contratos e planos de negócios de autoridade.",
    text: "Apresente a sua empresa com documentos formais timbrados, tabelas claras de valores e cláusulas estruturadas que fecham contratos.",
    tag: "Documentos de Negócios",
  },
  {
    role: "Cidadãos & Funcionários",
    icon: Scale,
    headline: "Requerimentos, declarações e ofícios no protocolo certo.",
    text: "Formulação jurídica e administrativa impecável para entidades públicas, ministérios, governos provinciais e instituições privadas em Moçambique.",
    tag: "Protocolo Administrativo",
  },
];

const faqs = [
  {
    q: "Como funcionam os 10 créditos de boas-vindas?",
    a: "Ao criar a sua conta gratuita, recebe imediatamente 10 créditos de saldo. Pode usá-los para gerar um Currículo Executivo, uma Carta de Apresentação ou um Requerimento Oficial sem pagar nada e sem introduzir cartão de crédito.",
  },
  {
    q: "Como posso pagar recargas de créditos em Moçambique?",
    a: "Aceitamos pagamentos instantâneos via M-Pesa, e-Mola e Transferência Bancária. O processo é simples: escolhe o pacote, transfere para o número oficial e os seus créditos são aprovados com segurança.",
  },
  {
    q: "Os documentos podem ser editados no Microsoft Word?",
    a: "Sim! Todos os documentos gerados pelo Dokvera podem ser exportados diretamente no formato Microsoft Word (.docx) 100% editável, ou em formato PDF pronto para impressão ou envio por e-mail.",
  },
  {
    q: "O Dokvera segue as normas oficiais de Moçambique?",
    a: "Sim. Os modelos foram desenhados especificamente com as fórmulas protocolares de Moçambique e da CPLP, incluindo o timbre oficial da República de Moçambique para requerimentos e ofícios administrativos.",
  },
  {
    q: "Os meus dados e documentos estão seguros e privados?",
    a: "Totalmente. Utilizamos isolamento estrito de dados (Row-Level Security no PostgreSQL). Apenas você tem acesso aos seus documentos gerados e rascunhos salvos.",
  },
  {
    q: "Existe alguma mensalidade ou subscrição oculta?",
    a: "Não. O Dokvera não tem subscrições obrigatórias. Você só compra créditos quando precisa e eles nunca expiram.",
  },
];

function Landing() {
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTabPreview, setActiveTabPreview] = useState<"cv" | "monografia" | "requerimento">("cv");

  const countryConfig = getCountryConfig(country);

  const filteredSpecs = selectedCategory === "all"
    ? DOC_SPECS.slice(0, 9)
    : DOC_SPECS.filter((s) => s.category === selectedCategory).slice(0, 9);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top Banner de Oferta Especial */}
      <aside aria-label="Oferta de Boas-Vindas" className="border-b border-primary/20 bg-primary/5 py-2 px-4 text-center text-xs font-medium text-primary">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2">
          <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span><strong>Oferta Especial de Lançamento:</strong> Crie a sua conta hoje e receba <strong>10 Créditos Grátis</strong> para criar o seu primeiro documento!</span>
          <Link to="/auth" className="underline font-bold hover:text-primary/80 ml-1">
            Resgatar agora →
          </Link>
        </div>
      </aside>

      {/* Header Sticky com Backdrop Blur */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo showParent />

          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
            <a href="#beneficios" className="transition-colors hover:text-foreground">
              Diferenciais
            </a>
            <a href="#modelos" className="transition-colors hover:text-foreground">
              Catálogo de Documentos
            </a>
            <a href="#como-funciona" className="transition-colors hover:text-foreground">
              Como Funciona
            </a>
            <a href="#precos" className="transition-colors hover:text-foreground">
              Créditos & Preços
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              Perguntas Frequentes
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Seletor de País e Moeda */}
            <Select value={country} onValueChange={(value) => setCountry(value as CountryCode)}>
              <SelectTrigger className="h-9 w-[115px] rounded-xl text-xs font-semibold bg-muted/50 border-border/80" aria-label="País e moeda">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" className="rounded-2xl shadow-elevated">
                {listCountries().map((c) => (
                  <SelectItem key={c.code} value={c.code} className="text-xs">
                    {c.name} ({c.currencySymbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ThemeToggle />

            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex rounded-xl text-xs font-semibold">
              <Link to="/auth">Entrar</Link>
            </Button>

            <Button asChild size="sm" className="rounded-xl px-4 text-xs font-bold shadow-soft">
              <Link to="/auth">Criar Conta Grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION DE ALTO IMPACTO & CONVERSÃO                               */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="glow-backdrop pointer-events-none absolute inset-x-0 top-0 h-[600px] opacity-70" />
        <div className="grid-backdrop pointer-events-none absolute inset-x-0 top-0 h-[600px] opacity-40" />

        <div className="relative mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge de Autoridade */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6 animate-fade-in shadow-xs">
              <Sparkles className="size-3.5 text-primary" />
              <span>Plataforma Inteligente de Documentação Oficial</span>
            </div>

            {/* Headline Principal */}
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">
              Crie Documentos Oficiais Perfeitos em{" "}
              <span className="text-gradient-brand">Minutos com IA</span>
            </h1>

            {/* Sub-headline Focada no Benefício */}
            <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
              Do trabalho académico ao currículo profissional e requerimentos protocolares. 
              O Dokvera estrutura o conteúdo, aplica as normas oficiais de Moçambique e entrega o documento pronto para <strong>Word</strong> e <strong>PDF Timbrado</strong>.
            </p>

            {/* CTAs Principais */}
            <div className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Button asChild size="lg" className="h-13 w-full rounded-2xl px-8 text-sm font-bold shadow-glow sm:w-auto gap-2">
                <Link to="/auth">
                  Começar com 10 Créditos Grátis
                  <ArrowRight className="size-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="h-13 w-full rounded-2xl border-border/80 bg-background/60 px-7 text-sm font-semibold hover:bg-muted sm:w-auto">
                <a href="#modelos">
                  <LayoutTemplate className="mr-2 size-4 text-primary" />
                  Ver 30+ Modelos Disponíveis
                </a>
              </Button>
            </div>

            {/* Badges de Confiança */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="size-4 text-emerald-500 stroke-[2.5]" /> Sem cartão de crédito
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-4 text-emerald-500 stroke-[2.5]" /> Pagamento via M-Pesa & e-Mola
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-4 text-emerald-500 stroke-[2.5]" /> Exportação Word (.docx) e PDF
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SHOWCASE VISUAL INTERATIVO (LIVE PREVIEW DE ALTA FIDELIDADE)             */}
          {/* ========================================================================= */}
          <div className="relative mx-auto mt-14 max-w-4xl">
            {/* Seletor de Demonstração de Documento */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setActiveTabPreview("cv")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeTabPreview === "cv"
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                📄 Currículo Executivo (CV)
              </button>
              <button
                type="button"
                onClick={() => setActiveTabPreview("requerimento")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeTabPreview === "requerimento"
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                🏛️ Requerimento Oficial Timbrado
              </button>
              <button
                type="button"
                onClick={() => setActiveTabPreview("monografia")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeTabPreview === "monografia"
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                🎓 Monografia Académica (Capa & Índice)
              </button>
            </div>

            {/* Moldura do Documento com Sombras Realistas */}
            <div className="glass shadow-elevated rounded-3xl p-3 sm:p-5 border border-border/80">
              <div className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-inner">
                {/* Barra Superior da Janela */}
                <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-rose-500/80" />
                    <span className="size-3 rounded-full bg-amber-500/80" />
                    <span className="size-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-xs text-muted-foreground font-mono">
                      dokvera.app/documento/preview-a4
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] gap-1 font-semibold text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                    <CheckCircle2 className="size-3" /> Folha A4 Oficial
                  </Badge>
                </div>

                {/* Conteúdo Simulado da Folha */}
                <div className="p-6 sm:p-10 bg-slate-50 dark:bg-slate-900/60 min-h-[380px] flex items-center justify-center">
                  {activeTabPreview === "cv" && (
                    <div className="w-full max-w-xl bg-white text-slate-900 rounded-xl shadow-lg p-6 border border-slate-200">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4 bg-slate-900 text-white p-4 rounded-lg space-y-3">
                          <div className="size-12 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg text-white mx-auto">
                            RC
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-xs">Rosário Custódio</p>
                            <p className="text-[10px] text-slate-400">Engenheiro de Software</p>
                          </div>
                          <div className="border-t border-slate-800 pt-2 text-[9px] text-slate-300 space-y-1">
                            <p>📞 +258 84 xxx xxxx</p>
                            <p>📍 Maputo, Moçambique</p>
                            <p>✉️ rosario@dokvera.app</p>
                          </div>
                        </div>
                        <div className="col-span-8 space-y-3 p-1">
                          <div>
                            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wide">Perfil Profissional</h4>
                            <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                              Profissional orientado a resultados, com sólida experiência no desenvolvimento de sistemas de alta escala.
                            </p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wide">Experiência Recente</h4>
                            <div className="text-[10px] mt-1 space-y-1">
                              <p className="font-semibold text-slate-800">Líder Técnico — Empresa Tecnológica (2022 - Presente)</p>
                              <p className="text-slate-600">Coordenação de arquitetura e implantação de plataformas digitais.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTabPreview === "requerimento" && (
                    <div className="w-full max-w-xl bg-white text-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 space-y-4 text-center">
                      <div className="space-y-1 border-b-2 border-amber-600 pb-3">
                        <p className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">República de Moçambique</p>
                        <p className="text-[10px] text-slate-500 font-semibold">MINISTÉRIO DA ADMINISTRAÇÃO ESTRATÉGICA</p>
                      </div>
                      <div className="text-left text-[11px] text-slate-800 space-y-2 leading-relaxed">
                        <p className="font-bold">Exmo. Senhor Ministro,</p>
                        <p>
                          Rosário Custódio, de nacionalidade moçambicana, titular do Bilhete de Identidade n.º 1102..., vem muito respeitosamente requerer a V. Excia. a emissão da certidão oficial...
                        </p>
                        <p className="text-right font-semibold pt-4">Pede Deferimento.</p>
                        <p className="text-right text-[10px] text-slate-500">Maputo, aos {new Date().toLocaleDateString("pt-MZ")}</p>
                      </div>
                    </div>
                  )}

                  {activeTabPreview === "monografia" && (
                    <div className="w-full max-w-xl bg-white text-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 text-center space-y-6">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800 uppercase">UNIVERSIDADE EDUARDO MONDLANE</p>
                        <p className="text-[10px] text-slate-500">Faculdade de Engenharia e Tecnologia</p>
                      </div>
                      <div className="py-4">
                        <h4 className="text-sm font-extrabold text-slate-900 uppercase">
                          O Impacto da Inteligência Artificial na Produtividade Académica
                        </h4>
                        <p className="text-[10px] text-slate-600 mt-1">Trabalho de Conclusão de Curso (Monografia)</p>
                      </div>
                      <div className="text-[10px] text-slate-700 flex justify-between border-t pt-3">
                        <span>Autor: Rosário Custódio</span>
                        <span>Maputo, Moçambique</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. TABELA COMPARATIVA: POR QUE O DOKVERA É SUPERIOR AO CHATGPT GENÉRICO    */}
      {/* ========================================================================= */}
      <section id="beneficios" className="scroll-mt-20 border-y border-border/60 bg-surface/50 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Diferencial Exclusivo</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
              Por que usar o Dokvera em vez de IAs comuns?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              IAs genéricas geram textos sem formatação. O Dokvera entrega o documento pronto para imprimir, protocolar ou enviar.
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/40">
                    <th className="p-4 sm:p-5 font-bold text-foreground">Recursos & Qualidade</th>
                    <th className="p-4 sm:p-5 font-semibold text-muted-foreground">ChatGPT / IAs Genéricas</th>
                    <th className="p-4 sm:p-5 font-bold text-primary bg-primary/5">Dokvera Inteligente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 sm:p-5 font-semibold text-foreground">{row.feature}</td>
                      <td className="p-4 sm:p-5 text-muted-foreground">{row.chatgpt}</td>
                      <td className="p-4 sm:p-5 font-medium text-emerald-600 dark:text-emerald-400 bg-primary/5 flex items-center gap-2">
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                        <span>{row.dokvera}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CASOS DE USO REAIS (ESTUDANTES, PROFISSIONAIS, EMPRESAS)               */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Soluções Adaptadas</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
            Feito sob medida para quem precisa de resultados oficiais
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((uc) => (
            <div
              key={uc.role}
              className="flex flex-col justify-between rounded-3xl border border-border/70 bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-elevated"
            >
              <div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <uc.icon className="size-6" />
                </div>
                <Badge variant="secondary" className="mt-4 text-[10px] font-semibold">
                  {uc.tag}
                </Badge>
                <h3 className="mt-3 text-base font-bold text-foreground">{uc.role}</h3>
                <p className="mt-2 text-xs font-semibold text-primary">{uc.headline}</p>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{uc.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CATÁLOGO INTERATIVO DE DOCUMENTOS COM PREÇOS NA MOEDA LOCAL            */}
      {/* ========================================================================= */}
      <section id="modelos" className="scroll-mt-20 border-y border-border/60 bg-surface/50 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">30+ Modelos Prontos</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
                Catálogo Completo de Documentos
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Escolha o tipo e veja o custo exacto antes de avançar.
              </p>
            </div>

            <Button asChild className="rounded-xl shadow-soft self-start md:self-auto">
              <Link to="/auth">
                Acessar Todos os Documentos <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>

          {/* Abas de Categorias */}
          <div className="mt-8 flex flex-wrap gap-2 rounded-2xl bg-muted/60 p-1.5 border border-border/60">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                selectedCategory === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos os Modelos
            </button>
            {DOC_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid de Cards de Documentos */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSpecs.map((spec) => {
              const approxPrice = creditsToCurrency(spec.baseCredits, country);
              return (
                <div
                  key={spec.id}
                  className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-soft hover:border-primary/40 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-foreground">{spec.label}</span>
                      <Badge variant="secondary" className="text-[10px] font-bold">
                        {spec.baseCredits} créditos
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{spec.description}</p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                    <span className="font-semibold text-primary">
                      ≈ {formatCurrency(approxPrice, country)}
                    </span>
                    <Link to="/auth" className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1">
                      Criar agora <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. COMO FUNCIONA (4 ETAPAS SIMPLES E INTUITIVAS)                         */}
      {/* ========================================================================= */}
      <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Passo a Passo</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
            Como funciona a criação no Dokvera
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { n: "01", title: "Escolha o Modelo", text: "Selecione o tipo de documento desejado no catálogo oficial com mais de 30 opções." },
            { n: "02", title: "Preencha os Dados", text: "Responda aos campos estruturados e adicione suas instruções personalizadas." },
            { n: "03", title: "Veja a Folha A4", text: "Inspecione a folha em tempo real com zoom e escolha o modelo visual e a paleta de cores." },
            { n: "04", title: "Exporte em 1 Clique", text: "Baixe o documento finalizado em Microsoft Word (.docx) e PDF Timbrado oficial." },
          ].map((s) => (
            <div key={s.n} className="relative rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
              <span className="font-display text-4xl font-black text-primary/20">{s.n}</span>
              <h3 className="mt-3 text-base font-bold text-foreground">{s.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TABELA DE PREÇOS E PACOTES DE CRÉDITOS TRANSPARENTES                    */}
      {/* ========================================================================= */}
      <section id="precos" className="scroll-mt-20 border-y border-border/60 bg-surface/50 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Sem Subscrições</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
              Pague apenas pelo que utilizar
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              1 crédito = {formatCurrency(countryConfig.creditPrice, country)}. Sem taxas escondidas, sem mensalidades obrigatórias.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {CREDIT_PACKS.map((p) => {
              const price = packPriceInCountry(p, country);
              const totalCreds = packTotalCredits(p);
              return (
                <div
                  key={p.id}
                  className={`relative flex flex-col justify-between rounded-3xl p-7 transition-all duration-300 ${
                    p.highlight
                      ? "border-2 border-primary bg-card shadow-elevated scale-105 z-10 ring-4 ring-primary/10"
                      : "border border-border/70 bg-card shadow-soft"
                  }`}
                >
                  {p.highlight && (
                    <Badge className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 font-bold text-[11px] shadow-sm">
                      🔥 Mais Escolhido por Estudantes
                    </Badge>
                  )}

                  <div>
                    <h3 className="text-lg font-bold">{p.name}</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="font-display text-4xl font-black">
                        {formatCurrency(price, country)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-primary">
                      {totalCreds} créditos incluídos
                      {(p.bonus ?? 0) > 0 ? ` (${p.credits} + ${p.bonus} bónus)` : ""}
                    </p>

                    <ul className="mt-6 space-y-3 text-xs">
                      {p.perks.map((perk) => (
                        <li key={perk} className="flex items-start gap-2.5 text-muted-foreground">
                          <Check className="size-4 shrink-0 text-emerald-500 stroke-[2.5]" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    asChild
                    size="lg"
                    variant={p.highlight ? "default" : "outline"}
                    className="mt-8 h-12 w-full rounded-2xl font-bold text-xs"
                  >
                    <Link to="/auth">Recarregar {p.name}</Link>
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Formas de Pagamento em Destaque */}
          <div className="mt-12 mx-auto max-w-2xl rounded-2xl border border-border/70 bg-card p-5 text-center shadow-xs">
            <p className="text-xs font-bold text-foreground">
              💳 Métodos de Pagamento 100% Convenientes & Locais:
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-muted-foreground">
              <span className="rounded-xl bg-muted px-3 py-1.5 border">🇲🇿 M-Pesa (Vodacom)</span>
              <span className="rounded-xl bg-muted px-3 py-1.5 border">🇲🇿 e-Mola (Movitel)</span>
              <span className="rounded-xl bg-muted px-3 py-1.5 border">🏦 Transferência Bancária / IUM</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FAQ ESTRUTURADO (TRATAMENTO DE OBJEÇÕES)                               */}
      {/* ========================================================================= */}
      <section id="faq" className="mx-auto max-w-4xl scroll-mt-20 px-5 py-20">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Dúvidas Frequentes</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
            Tudo o que precisa de saber antes de começar
          </h2>
        </div>

        <div className="mt-10">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="rounded-2xl border border-border/70 bg-card px-5 shadow-xs"
              >
                <AccordionTrigger className="text-left text-sm font-bold hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. CTA FINAL DE FECHAMENTO (MAXIMIZAÇÃO DE CONVERSÕES)                    */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="gradient-brand shadow-glow relative overflow-hidden rounded-3xl px-8 py-16 text-center text-brand-foreground">
          <Sparkles className="absolute -top-6 -right-6 size-36 opacity-15" />
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl md:text-5xl">
            Pronto para criar o seu documento oficial?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base opacity-90 leading-relaxed">
            Registe-se em 30 segundos, ganhe <strong>10 créditos de boas-vindas</strong> e crie o seu primeiro trabalho académico ou currículo executivo.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="h-13 w-full rounded-2xl px-8 text-sm font-bold sm:w-auto shadow-md"
            >
              <Link to="/auth">
                Criar Conta Grátis Agora <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs opacity-75">
            Sem compromisso · Sem cartão de crédito · 10 créditos grátis incluídos
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. RODAPÉ INSTITUCIONAL                                                   */}
      {/* ========================================================================= */}
      <footer className="border-t border-border/60 bg-background py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:flex-row">
          <Logo showParent />
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            © {new Date().getFullYear()} Dokvera. Todos os direitos reservados.
            <br />
            Plataforma oficial desenvolvida por <strong className="font-semibold text-foreground">Dokvera by Ruqzora</strong>.
          </p>
        </div>
      </footer>
    </div>
  );
}
