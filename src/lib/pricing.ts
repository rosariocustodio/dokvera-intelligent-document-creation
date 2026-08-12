/**
 * Dokvera pricing engine — 100% deterministic, computed in code.
 * AI is NEVER involved in any cost calculation.
 */

import { CREDIT_PRICE_MZN, creditsToMzn } from "@/lib/dokvera";
import type { DocSpec } from "@/lib/document-specs";

export type CostLine = {
  id: string;
  label: string;
  credits: number;
};

export type CostBreakdown = {
  lines: CostLine[];
  totalCredits: number;
  totalMzn: number;
  pricePerCredit: number;
};

export type DocumentDraftValues = {
  /** Free-form values from the dynamic form. */
  fields: Record<string, unknown>;
  /** Ids of the structure options the user chose to include. */
  structure: string[];
  /** Selected page tier id, when the type has tiers. */
  pageTierId?: string;
  /** Number of students/authors, when supported. */
  studentsCount?: number;
  templateId?: string;
  layoutId?: string;
  instructions?: string;
};

/** Rounds to 2 decimals, avoiding float noise (0.39 * 3 = 1.1700000000000002). */
export function roundCredits(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeCost(spec: DocSpec, values: DocumentDraftValues): CostBreakdown {
  const lines: CostLine[] = [];

  // 1. Base cost — page tier when available, otherwise the type base.
  const tier = spec.pageTiers?.find((t) => t.id === values.pageTierId) ?? spec.pageTiers?.[0];
  if (tier) {
    lines.push({ id: "base", label: `${spec.label} · ${tier.label}`, credits: tier.credits });
  } else {
    lines.push({ id: "base", label: spec.label, credits: spec.baseCredits });
  }

  // 2. Extra students/authors above the free allowance.
  if (spec.students) {
    const count = Math.max(1, Math.min(spec.students.max, values.studentsCount ?? 1));
    const extra = Math.max(0, count - spec.students.includedFree);
    if (extra > 0) {
      lines.push({
        id: "students",
        label: `${extra} estudante(s) adicional(is) × ${spec.students.extraPerStudent} cr`,
        credits: roundCredits(extra * spec.students.extraPerStudent),
      });
    }
  }

  // 3. Paid optional sections the user chose to include.
  for (const option of spec.structure ?? []) {
    if (!option.extraCredits) continue;
    if (!values.structure.includes(option.id)) continue;
    lines.push({ id: `opt-${option.id}`, label: option.label, credits: option.extraCredits });
  }

  const totalCredits = roundCredits(lines.reduce((sum, l) => sum + l.credits, 0));

  return {
    lines,
    totalCredits,
    totalMzn: creditsToMzn(totalCredits),
    pricePerCredit: CREDIT_PRICE_MZN,
  };
}

export type AffordabilityResult = {
  cost: number;
  balance: number;
  affordable: boolean;
  missingCredits: number;
  missingMzn: number;
};

export function checkBalance(balance: number, cost: number): AffordabilityResult {
  const missingCredits = roundCredits(Math.max(0, cost - balance));
  return {
    cost,
    balance,
    affordable: balance + 1e-9 >= cost,
    missingCredits,
    missingMzn: creditsToMzn(missingCredits),
  };
}

export function studentsExtra(spec: DocSpec, count: number): { extraStudents: number; extraCredits: number } {
  if (!spec.students) return { extraStudents: 0, extraCredits: 0 };
  const capped = Math.max(1, Math.min(spec.students.max, count));
  const extraStudents = Math.max(0, capped - spec.students.includedFree);
  return { extraStudents, extraCredits: roundCredits(extraStudents * spec.students.extraPerStudent) };
}
