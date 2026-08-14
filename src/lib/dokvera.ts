/**
 * Dokvera domain constants and pure calculations.
 * IMPORTANT: every financial/credit calculation lives here or in
 * `src/lib/pricing.ts` (code only — never AI).
 */

export const BRAND = {
  name: "Dokvera",
  parent: "Ruqzora",
  signature: "Dokvera by Ruqzora",
} as const;

/** Price of a single credit bought individually, in Mozambican Metical (MZN/MT). */
export const CREDIT_PRICE_MZN = 10;

export function creditsToMzn(credits: number): number {
  return Math.round(credits * CREDIT_PRICE_MZN);
}

export function formatMzn(value: number): string {
  return `${new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 0 }).format(Math.round(value))} MT`;
}

/** Credits may be fractional (0,39 per extra student), so show up to 2 decimals. */
export function formatCreditsNumber(credits: number): string {
  return new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 2 }).format(credits);
}

export function formatCredits(credits: number): string {
  return `${formatCreditsNumber(credits)} ${credits === 1 ? "crédito" : "créditos"}`;
}

/** Credits + monetary equivalent, the standard way Dokvera shows a price. */
export function formatCreditsWithMzn(credits: number): string {
  return `${formatCreditsNumber(credits)} cr · ${formatMzn(creditsToMzn(credits))}`;
}

/* ------------------------------------------------------------------ */
/* Credit packs — price per credit MUST be lower than buying单 avulso.  */
/* ------------------------------------------------------------------ */

export type CreditPack = {
  id: string;
  name: string;
  credits: number;
  /** Total price in MZN for the whole pack. */
  priceMzn: number;
  highlight?: boolean;
  /** Legacy bonus display, kept for existing pricing sections. */
  bonus?: number;
  perks: string[];
};

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "start",
    name: "Início",
    credits: 10,
    priceMzn: 100,
    perks: ["Ideal para experimentar", "Todos os tipos de documento", "Créditos sem validade"],
  },
  {
    id: "student",
    name: "Estudante",
    credits: 25,
    priceMzn: 250,
    highlight: true,
    perks: ["Cobre trabalhos completos", "Histórico e reedição de documentos", "Exportação PDF e DOCX"],
  },
  {
    id: "pro",
    name: "Profissional",
    credits: 60,
    priceMzn: 550,
    perks: ["Para uso intensivo e grupos", "Prioridade de processamento", "Suporte prioritário"],
  },
  {
    id: "institution",
    name: "Instituição",
    credits: 150,
    priceMzn: 1300,
    perks: ["Para turmas e escritórios", "Melhor preço por crédito", "Factura com NUIT"],
  },
];

export function packPricePerCredit(pack: CreditPack): number {
  return pack.priceMzn / pack.credits;
}

/** How much the pack saves versus buying the same credits one by one. */
export function packSavingsMzn(pack: CreditPack): number {
  return Math.max(0, creditsToMzn(pack.credits) - pack.priceMzn);
}

export function packSavingsPercent(pack: CreditPack): number {
  const full = creditsToMzn(pack.credits);
  if (full <= 0) return 0;
  return Math.round((packSavingsMzn(pack) / full) * 100);
}

/* ------------------------------------------------------------------ */
/* Document status                                                     */
/* ------------------------------------------------------------------ */

export type DocumentStatus = "draft" | "generating" | "ready" | "error";

export const DOCUMENT_STATUS: Record<
  DocumentStatus,
  { label: string; tone: "muted" | "info" | "warning" | "success" | "danger"; description: string }
> = {
  draft: {
    label: "Rascunho",
    tone: "muted",
    description: "Configurado e guardado. Podes continuar a editar.",
  },
  generating: {
    label: "A gerar",
    tone: "info",
    description: "O documento está em processamento.",
  },
  ready: {
    label: "Concluído",
    tone: "success",
    description: "Documento pronto para abrir e exportar.",
  },
  error: {
    label: "Erro",
    tone: "danger",
    description: "Algo falhou na geração. Os créditos são devolvidos.",
  },
};

export function statusMeta(status: string) {
  return (
    DOCUMENT_STATUS[status as DocumentStatus] ?? {
      label: status,
      tone: "muted" as const,
      description: "",
    }
  );
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-MZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-MZ", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function relativeTime(value: string | null | undefined): string {
  if (!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `há ${days} d`;
  return formatDate(value);
}

/* ------------------------------------------------------------------ */
/* Compatibility layer                                                 */
/* Kept so existing screens keep compiling while they migrate to       */
/* `src/lib/document-specs.ts` + `src/lib/pricing.ts`.                 */
/* ------------------------------------------------------------------ */

export function packTotalCredits(pack: CreditPack): number {
  return pack.credits;
}

export function packPriceMzn(pack: CreditPack): number {
  return pack.priceMzn;
}

export type DocumentTypeId = string;

export type DocumentTypeDef = {
  id: string;
  label: string;
  description: string;
  cost: number;
  icon: string;
};

export const DOCUMENT_TYPES: DocumentTypeDef[] = [
  // Académico (Gerações complexas com IA)
  { id: "academic", label: "Trabalho Académico", description: "Estrutura académica com capa, índice e referências.", cost: 25, icon: "GraduationCap" },
  { id: "academic_report", label: "Relatório Académico", description: "Relatórios de estágio, atividade ou projeto universitário.", cost: 25, icon: "ClipboardList" },
  { id: "tcc", label: "Monografia/TCC", description: "Trabalhos de conclusão de curso com estrutura formal completa.", cost: 25, icon: "BookOpen" },
  { id: "academic_summary", label: "Resumo Académico", description: "Resumos e sínteses de textos académicos e aulas.", cost: 10, icon: "AlignLeft" },
  { id: "scientific_article", label: "Artigo Científico", description: "Artigo estruturado para publicação em revistas científicas ou conferências.", cost: 25, icon: "BookOpen" },
  { id: "research_project", label: "Projeto de Pesquisa", description: "Proposta e anteprojeto de tema para investigação ou TCC.", cost: 25, icon: "FileText" },
  { id: "reading_sheet", label: "Ficha de Leitura", description: "Ficha de revisão e síntese bibliográfica sistemática.", cost: 10, icon: "AlignLeft" },

  // Escolar (IA simples)
  { id: "school", label: "Trabalho Escolar", description: "Trabalhos escolares rápidos para o ensino básico e secundário.", cost: 15, icon: "BookOpen" },
  { id: "school_research", label: "Pesquisa Escolar", description: "Relatórios de pesquisa e pequenos projetos de aula.", cost: 15, icon: "Search" },
  { id: "school_summary", label: "Resumo Escolar", description: "Resumos de capítulos, livros ou conteúdos escolares.", cost: 8, icon: "AlignLeft" },

  // Profissional (Híbridos / Código)
  { id: "cv", label: "CV", description: "Currículo profissional pronto a enviar.", cost: 5, icon: "IdCard" },
  { id: "cover_letter", label: "Carta de Apresentação", description: "Carta de candidatura personalizada para vagas de emprego.", cost: 4, icon: "FileText" },
  { id: "proposal", label: "Proposta Profissional", description: "Proposta de serviços, orçamentos ou projetos de negócios.", cost: 15, icon: "FilePlus2" },

  // Cartas e Ofícios (SEM IA - Geração de Código)
  { id: "request", label: "Requerimento", description: "Requerimentos formais para secretarias e órgãos públicos.", cost: 3, icon: "FileSignature" },
  { id: "formal_req", label: "Pedido Formal", description: "Cartas formais solicitando deferimentos ou autorizações.", cost: 3, icon: "FileText" },
  { id: "formal_letter", label: "Carta Formal", description: "Correspondência formal para empresas e instituições.", cost: 3, icon: "Mail" },
  { id: "official_letter", label: "Ofício", description: "Ofícios oficiais para administração pública.", cost: 3, icon: "FileSignature" },
  { id: "declaration", label: "Declaração", description: "Declaração formal de factos, atividade ou compromisso.", cost: 3, icon: "FileCheck" },

  // Pessoal (SEM IA - Geração de Código)
  { id: "personal_letter", label: "Carta Pessoal", description: "Correspondência pessoal, convites ou notas amigáveis.", cost: 3, icon: "Mail" },
  { id: "simple_cv", label: "Curriculum Vitae Simples", description: "Currículo limpo e simples para candidaturas rápidas.", cost: 5, icon: "IdCard" },
];

export function getDocumentType(id: string): DocumentTypeDef | undefined {
  return DOCUMENT_TYPES.find((t) => t.id === id);
}

export function documentTypeLabel(id: string): string {
  return getDocumentType(id)?.label ?? "Documento";
}

export type PageRangeOption = {
  id: string;
  label: string;
  minPages: number;
  maxPages: number;
  cost: number;
};

export const PAGE_RANGES: PageRangeOption[] = [
  { id: "10-15", label: "10–15 páginas", minPages: 10, maxPages: 15, cost: 25 },
  { id: "16-20", label: "16–20 páginas", minPages: 16, maxPages: 20, cost: 28 },
];

export function calculateStudentExtraCost(totalStudents: number): {
  additionalStudents: number;
  extraCost: number;
} {
  const additionalStudents = Math.max(0, totalStudents - 4);
  return { additionalStudents, extraCost: Number((additionalStudents * 0.39).toFixed(2)) };
}

export function calculateTotalDocumentCost(baseCost: number, numberOfStudents: number): number {
  return Number((baseCost + calculateStudentExtraCost(numberOfStudents).extraCost).toFixed(2));
}

export type AffordabilityCheck = {
  cost: number;
  balance: number;
  affordable: boolean;
  missing: number;
  costInMzn: number;
  missingInMzn: number;
};

export function checkAffordability(balance: number, cost: number): AffordabilityCheck {
  const missing = Math.max(0, Number((cost - balance).toFixed(2)));
  return {
    cost,
    balance,
    affordable: balance >= cost,
    missing,
    costInMzn: creditsToMzn(cost),
    missingInMzn: creditsToMzn(missing),
  };
}
