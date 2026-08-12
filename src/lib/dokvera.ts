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
