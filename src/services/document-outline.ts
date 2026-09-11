/**
 * Turns a saved document (spec + chosen options) into a deterministic outline.
 * Used both to brief the AI service and to build PDF/DOCX exports, so the
 * document structure is always exactly what the user selected.
 */

import { getSpec, type DocSpec } from "@/lib/document-specs";
import type { DocumentDraftValues } from "@/lib/pricing";

export type OutlineSection = {
  id: string;
  heading: string;
};

export type DocumentOutline = {
  spec: DocSpec;
  title: string;
  values: DocumentDraftValues;
  sections: OutlineSection[];
  /** Human readable "Instituição: X · Curso: Y" style pairs for cover pages. */
  metaPairs: { label: string; value: string }[];
  students: string[];
  pages: string | null;
  instructions: string;
};

export function parseValues(options: unknown): DocumentDraftValues {
  const raw = (options ?? {}) as Record<string, unknown>;
  const fields = (raw["fields"] ?? {}) as Record<string, unknown>;
  const structure = Array.isArray(raw["structure"]) ? (raw["structure"] as string[]) : [];
  return {
    fields,
    structure,
    ...(typeof raw["pageTierId"] === "string" ? { pageTierId: raw["pageTierId"] } : {}),
    ...(typeof raw["studentsCount"] === "number" ? { studentsCount: raw["studentsCount"] } : {}),
    ...(typeof raw["templateId"] === "string" ? { templateId: raw["templateId"] } : {}),
    ...(typeof raw["layoutId"] === "string" ? { layoutId: raw["layoutId"] } : {}),
    ...(typeof raw["instructions"] === "string" ? { instructions: raw["instructions"] } : {}),
  };
}

function asText(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.filter(Boolean).join("\n");
  return String(value);
}

export function buildOutline(
  docType: string,
  title: string,
  options: unknown,
  instructions?: string | null,
): DocumentOutline | null {
  const spec = getSpec(docType);
  if (!spec) return null;
  const values = parseValues(options);

  const sections: OutlineSection[] = (spec.structure ?? [])
    .filter((option) => values.structure.includes(option.id))
    .map((option) => ({ id: option.id, heading: option.label }));

  const metaPairs: { label: string; value: string }[] = [];
  for (const group of spec.groups) {
    for (const field of group.fields) {
      if (field.type === "students") continue;
      const value = asText(values.fields[field.id]).trim();
      if (!value) continue;
      metaPairs.push({ label: field.label, value });
    }
  }

  const studentsRaw = values.fields["students"];
  const students = Array.isArray(studentsRaw)
    ? studentsRaw.map((s) => String(s).trim()).filter(Boolean)
    : [];

  const tier = spec.pageTiers?.find((t) => t.id === values.pageTierId);

  return {
    spec,
    title,
    values,
    sections,
    metaPairs,
    students,
    pages: tier?.label ?? null,
    instructions: (instructions ?? values.instructions ?? "").trim(),
  };
}

/** Deterministic brief handed to the AI service. */
export function outlineToBrief(outline: DocumentOutline): string {
  const lines: string[] = [];
  lines.push(`Tipo de documento: ${outline.spec.label}`);
  lines.push(`Título: ${outline.title}`);
  if (outline.pages) lines.push(`Extensão pretendida: ${outline.pages}`);
  if (outline.values.templateId) lines.push(`Modelo escolhido: ${outline.values.templateId}`);
  if (outline.values.layoutId) lines.push(`Layout escolhido: ${outline.values.layoutId}`);
  if (outline.students.length > 0) {
    lines.push(`Autor(es): ${outline.students.join(", ")}`);
  }
  for (const pair of outline.metaPairs) {
    lines.push(`${pair.label}: ${pair.value}`);
  }
  lines.push("");
  lines.push("Secções a incluir no documento, exactamente nesta ordem (formata obrigatoriamente cada secção principal com o prefixo '## '):");
  outline.sections.forEach((section, index) => {
    lines.push(`## ${index + 1}. ${section.heading}`);
  });
  if (outline.instructions) {
    lines.push("");
    lines.push(`Instruções personalizadas do utilizador: ${outline.instructions}`);
  }
  return lines.join("\n");
}
