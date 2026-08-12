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
export const CREDIT_PRICE_MZN = 55;

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
    priceMzn: 520,
    perks: ["Ideal para experimentar", "Todos os tipos de documento", "Créditos sem validade"],
  },
  {
    id: "student",
    name: "Estudante",
    credits: 25,
    priceMzn: 1225,
    highlight: true,
    perks: ["Cobre 4–5 trabalhos completos", "Histórico e reedição de documentos", "Exportação PDF e DOCX"],
  },
  {
    id: "pro",
    name: "Profissional",
    credits: 60,
    priceMzn: 2700,
    perks: ["Para uso intensivo e grupos", "Prioridade de processamento", "Suporte prioritário"],
  },
  {
    id: "institution",
    name: "Instituição",
    credits: 150,
    priceMzn: 6300,
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
  { id: "academic", label: "Trabalho Académico", description: "Monografias e trabalhos universitários com estrutura formal.", cost: 5, icon: "GraduationCap" },
  { id: "school", label: "Trabalho Escolar", description: "Trabalhos do ensino básico e secundário.", cost: 4, icon: "BookOpen" },
  { id: "cv", label: "CV", description: "Currículo profissional pronto a enviar.", cost: 3, icon: "IdCard" },
  { id: "report", label: "Relatório", description: "Relatórios de estágio, actividade ou projecto.", cost: 6, icon: "ClipboardList" },
  { id: "summary", label: "Resumo", description: "Resumos e sínteses de textos ou aulas.", cost: 2, icon: "AlignLeft" },
  { id: "request", label: "Requerimento", description: "Requerimentos e cartas formais.", cost: 2, icon: "FileSignature" },
  { id: "other", label: "Outro Documento", description: "Descreve o que precisas e organizamos a estrutura.", cost: 3, icon: "FilePlus2" },
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
  { id: "10-15", label: "10–15 páginas", minPages: 10, maxPages: 15, cost: 5 },
  { id: "16-20", label: "16–20 páginas", minPages: 16, maxPages: 20, cost: 7 },
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
