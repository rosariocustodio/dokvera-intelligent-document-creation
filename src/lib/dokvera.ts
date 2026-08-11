/**
 * Dokvera domain constants and pure calculations.
 * IMPORTANT: every financial/credit calculation lives here (code, never AI).
 */

export const BRAND = {
  name: "Dokvera",
  parent: "Ruqzora",
  signature: "Dokvera by Ruqzora",
} as const;

/** Price of a single credit, in Mozambican Metical (MZN/MT). */
export const CREDIT_PRICE_MZN = 55;

export function creditsToMzn(credits: number): number {
  return Math.round(credits * CREDIT_PRICE_MZN);
}

export function formatMzn(value: number): string {
  return `${new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 0 }).format(value)} MT`;
}

export function formatCredits(credits: number): string {
  return `${new Intl.NumberFormat("pt-MZ").format(credits)} ${credits === 1 ? "crédito" : "créditos"}`;
}

export type DocumentTypeId =
  | "academic"
  | "school"
  | "cv"
  | "report"
  | "summary"
  | "request"
  | "other";

export type DocumentTypeDef = {
  id: DocumentTypeId;
  label: string;
  description: string;
  /** Cost in credits — controlled by code/backend, never by AI. */
  cost: number;
  icon: string;
};

/** Add new document types here — the whole UI is driven by this list. */
export const DOCUMENT_TYPES: DocumentTypeDef[] = [
  {
    id: "academic",
    label: "Trabalho Académico",
    description: "Monografias e trabalhos universitários com estrutura formal.",
    cost: 8,
    icon: "GraduationCap",
  },
  {
    id: "school",
    label: "Trabalho Escolar",
    description: "Trabalhos do ensino básico e secundário, simples e organizados.",
    cost: 4,
    icon: "BookOpen",
  },
  {
    id: "cv",
    label: "CV",
    description: "Currículo profissional pronto a enviar, com layout limpo.",
    cost: 3,
    icon: "IdCard",
  },
  {
    id: "report",
    label: "Relatório",
    description: "Relatórios de estágio, actividade ou projecto.",
    cost: 6,
    icon: "ClipboardList",
  },
  {
    id: "summary",
    label: "Resumo",
    description: "Resumos e sínteses de textos, livros ou aulas.",
    cost: 2,
    icon: "AlignLeft",
  },
  {
    id: "request",
    label: "Requerimento",
    description: "Requerimentos e cartas formais com linguagem correcta.",
    cost: 2,
    icon: "FileSignature",
  },
  {
    id: "other",
    label: "Outro Documento",
    description: "Descreve o que precisas e organizamos a estrutura.",
    cost: 3,
    icon: "FilePlus2",
  },
];

export function getDocumentType(id: string): DocumentTypeDef | undefined {
  return DOCUMENT_TYPES.find((t) => t.id === id);
}

export function documentTypeLabel(id: string): string {
  return getDocumentType(id)?.label ?? "Documento";
}

export type AffordabilityCheck = {
  cost: number;
  balance: number;
  affordable: boolean;
  missing: number;
  costInMzn: number;
  missingInMzn: number;
};

/** Pure credit check used before allowing a document to be created. */
export function checkAffordability(balance: number, cost: number): AffordabilityCheck {
  const missing = Math.max(0, cost - balance);
  return {
    cost,
    balance,
    affordable: balance >= cost,
    missing,
    costInMzn: creditsToMzn(cost),
    missingInMzn: creditsToMzn(missing),
  };
}

export type CreditPack = {
  id: string;
  name: string;
  credits: number;
  bonus: number;
  highlight?: boolean;
  perks: string[];
};

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "start",
    name: "Início",
    credits: 10,
    bonus: 0,
    perks: ["Ideal para experimentar", "Todos os tipos de documento", "Validade ilimitada"],
  },
  {
    id: "student",
    name: "Estudante",
    credits: 40,
    bonus: 5,
    highlight: true,
    perks: ["+5 créditos bónus", "Histórico completo", "Suporte prioritário"],
  },
  {
    id: "pro",
    name: "Profissional",
    credits: 100,
    bonus: 20,
    perks: ["+20 créditos bónus", "Organização por pastas", "Exportações ilimitadas"],
  },
];

export function packTotalCredits(pack: CreditPack): number {
  return pack.credits + pack.bonus;
}

export function packPriceMzn(pack: CreditPack): number {
  return creditsToMzn(pack.credits);
}

export const DOCUMENT_STATUS: Record<string, { label: string; tone: "muted" | "warning" | "success" }> = {
  draft: { label: "Rascunho", tone: "muted" },
  processing: { label: "Em processamento", tone: "warning" },
  ready: { label: "Concluído", tone: "success" },
};

export function statusMeta(status: string) {
  return DOCUMENT_STATUS[status] ?? { label: status, tone: "muted" as const };
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
