/**
 * Deterministic CV builder — no AI involved in layout.
 *
 * The AI is only used (upstream) to polish the professional profile text.
 * Everything else is assembled here so the CV is always clean and ordered:
 * header → contacts → profile → experience → education → skills → …
 */

import type { DocumentOutline } from "@/services/document-outline";
import { formatDate } from "@/lib/dokvera";

function text(fields: Record<string, unknown>, key: string): string {
  const value = fields[key];
  if (value == null) return "";
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean).join("\n");
  return String(value).trim();
}

function items(fields: Record<string, unknown>, key: string): string[] {
  const value = fields[key];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const TRAVEL_LABELS: Record<string, string> = {
  yes: "Disponível para viagens e mudança de residência",
  travel_only: "Disponível para viagens",
  no: "Sem disponibilidade para viagens",
};

export type CvSection = { id: string; heading: string; fieldId: string };

const CV_SECTIONS: CvSection[] = [
  { id: "experience", heading: "Experiência Profissional", fieldId: "experience" },
  { id: "education", heading: "Formação Académica", fieldId: "education" },
  { id: "skills", heading: "Competências", fieldId: "skills" },
  { id: "languages", heading: "Idiomas", fieldId: "languages" },
  { id: "certifications", heading: "Certificações e Cursos", fieldId: "certifications" },
  { id: "projects", heading: "Projectos", fieldId: "projects" },
  { id: "volunteering", heading: "Voluntariado", fieldId: "volunteering" },
  { id: "references", heading: "Referências", fieldId: "references_list" },
];

/** Builds a clean, ordered CV in Markdown. `profileText` may come from the AI. */
export function buildCvMarkdown(
  outline: DocumentOutline,
  country?: string | null,
  profileText?: string,
): string {
  const fields = outline.values.fields as Record<string, unknown>;
  const selected = outline.values.structure;
  const include = (id: string) => selected.length === 0 || selected.includes(id);

  const name = text(fields, "full_name") || outline.title;
  const headline = text(fields, "headline");

  const contacts = [
    text(fields, "email"),
    text(fields, "phone"),
    text(fields, "address") || text(fields, "location"),
    text(fields, "linkedin"),
  ].filter(Boolean);

  const personal = [
    text(fields, "birth_date") ? `Data de nascimento: ${formatDate(text(fields, "birth_date"), country)}` : "",
    text(fields, "nationality") ? `Nacionalidade: ${text(fields, "nationality")}` : "",
    text(fields, "bi_number") ? `BI: ${text(fields, "bi_number")}` : "",
    text(fields, "nuit_number") ? `NUIT: ${text(fields, "nuit_number")}` : "",
    text(fields, "driving_license") ? `Carta de condução: ${text(fields, "driving_license")}` : "",
    TRAVEL_LABELS[text(fields, "travel_availability")] ?? "",
  ].filter(Boolean);

  const lines: string[] = [];
  lines.push(`# ${name}`);
  if (headline) lines.push(`**${headline}**`);
  if (contacts.length > 0) lines.push("", contacts.join(" · "));

  if (personal.length > 0) {
    lines.push("", "## Dados Pessoais", "");
    personal.forEach((item) => lines.push(`- ${item}`));
  }

  const profile = (profileText ?? "").trim() || text(fields, "profile");
  if (profile && include("profile")) {
    lines.push("", "## Perfil Profissional", "", profile);
  }

  for (const section of CV_SECTIONS) {
    if (!include(section.id)) continue;
    const entries = items(fields, section.fieldId);
    if (entries.length === 0) continue;
    lines.push("", `## ${section.heading}`, "");
    entries.forEach((entry) => lines.push(`- ${entry}`));
  }

  if (include("photo")) {
    lines.push("", "_[Espaço reservado para fotografia]_");
  }

  return lines.join("\n").trim();
}
