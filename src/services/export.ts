/**
 * Dokvera Real Client-Side Export Engine for PDF and DOCX.
 *
 * Implements high-fidelity export for:
 * 1. Standard Documents (Letters, Requests, Academic Theses with official Mozambican letterhead).
 * 2. Visual CV Engine matching the 4 visual templates from cv-document-sheet.tsx:
 *    - "modern": 2-Column dark executive sidebar + main content
 *    - "classic": 1-Column centered ATS-friendly executive format
 *    - "minimal": Swiss minimalist asymmetric layout with clean whitespace
 *    - "bold": Creative full-width colored header banner + structured cards
 */

import { jsPDF } from "jspdf";
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  HeightRule,
  LevelFormat,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { CV_ACCENT_COLORS, extractCvDataFromFields, type CvAccentColor, type CvData } from "@/components/cv/cv-document-sheet";
import { getCountryConfig } from "@/lib/countries";

export type Block =
  | { type: "h1" | "h2" | "h3" | "p"; text: string }
  | { type: "bullet"; text: string }
  | { type: "number"; text: string; prefix?: string }
  | { type: "quote"; text: string };

export type RGB = readonly [number, number, number];

export interface ExportOptions {
  docType?: string;
  templateId?: "modern" | "classic" | "minimal" | "bold" | string;
  accentColor?: CvAccentColor | string;
  fields?: Record<string, unknown>;
  country?: string | null;
  footer?: string;
}

const BOLD = /\*\*(.+?)\*\*/g;
const ITALIC = /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g;

function clean(line: string): string {
  return line.replace(BOLD, "$1").replace(ITALIC, "$1").replace(/`/g, "").trim();
}

/** Common academic / administrative section keywords in Portuguese */
const KNOWN_SECTION_KEYWORDS = new RegExp(
  "^(" +
    [
      "introdução",
      "introducao",
      "contextualização",
      "contextualizacao",
      "enquadramento",
      "fundamentação",
      "fundamentacao",
      "revisão da literatura",
      "revisao da literatura",
      "revisão bibliográfica",
      "revisao bibliografica",
      "estado da arte",
      "metodologia",
      "métodos",
      "metodos",
      "materiais e métodos",
      "materiais e metodos",
      "desenvolvimento",
      "resultados",
      "discussão",
      "discussao",
      "análise dos dados",
      "analise dos dados",
      "análise e discussão",
      "analise e discussao",
      "conclusão",
      "conclusao",
      "conclusões",
      "conclusoes",
      "considerações finais",
      "consideracoes finais",
      "recomendações",
      "recomendacoes",
      "referências",
      "referencias",
      "referências bibliográficas",
      "referencias bibliograficas",
      "bibliografia",
      "anexos",
      "apêndices",
      "apendices",
      "resumo",
      "abstract",
      "sumário",
      "sumario",
      "capítulo",
      "capitulo",
      "seção",
      "seccao",
      "secção",
      "objetivos",
      "objectivos",
      "justificativa",
      "problematização",
      "problematizacao",
      "problema de pesquisa",
      "hipóteses",
      "hipoteses",
      "cronograma",
      "orçamento",
      "orcamento",
    ].join("|") +
    ")",
  "i"
);

/**
 * Robustly parses stored Markdown into flat typed blocks.
 * Tolerates AI deviations: bold pseudo-headings, unhashed numbered sections,
 * all-caps headings, roman numerals, unicode bullets, and blockquotes.
 */
export function parseContent(content: string): Block[] {
  const blocks: Block[] = [];
  const rawLines = content.split(/\r?\n/);

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i];
    const line = raw.trim();
    if (!line) continue;

    // 1. Horizontal Rules (---, ***, ___)
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(line)) continue;

    // 2. Setext-style headings (e.g. Line followed by === or ---)
    const nextLine = (rawLines[i + 1] || "").trim();
    if (nextLine && /^={3,}$/.test(nextLine)) {
      blocks.push({ type: "h1", text: clean(line) });
      i++; // skip underline
      continue;
    }
    if (nextLine && /^-{3,}$/.test(nextLine) && !/^\s*[-*+•–—]\s/.test(raw)) {
      blocks.push({ type: "h2", text: clean(line) });
      i++; // skip underline
      continue;
    }

    // 3. Standard Markdown ATX Headings: #, ##, ###, ####+
    if (/^####+\s+/.test(line)) {
      blocks.push({ type: "h3", text: clean(line.replace(/^####+\s+/, "")) });
      continue;
    }
    if (/^###\s+/.test(line)) {
      blocks.push({ type: "h3", text: clean(line.replace(/^###\s+/, "")) });
      continue;
    }
    if (/^##\s+/.test(line)) {
      blocks.push({ type: "h2", text: clean(line.replace(/^##\s+/, "")) });
      continue;
    }
    if (/^#\s+/.test(line)) {
      blocks.push({ type: "h1", text: clean(line.replace(/^#\s+/, "")) });
      continue;
    }

    // 4. Blockquotes: > quote or >> quote
    if (/^>\s*/.test(line)) {
      blocks.push({ type: "quote", text: clean(line.replace(/^>+\s*/, "")) });
      continue;
    }

    // 5. Bullet Lists: -, *, +, •, –, — (supporting leading whitespace/indentation)
    if (/^\s*[-*+•–—]\s+/.test(raw)) {
      const text = clean(raw.replace(/^\s*[-*+•–—]\s+/, ""));
      if (text) {
        blocks.push({ type: "bullet", text });
      }
      continue;
    }

    // 6. Bold-enclosed lines acting as pseudo-headings (e.g. **1. Introdução**, **Metodologia**, **1.2. Objetivos:**)
    const boldMatch = line.match(/^\*{2}(.+?)\*{2}:?$/);
    if (boldMatch) {
      const inner = boldMatch[1].trim();
      // Only treat as heading if it is under 110 chars and doesn't look like a standard narrative sentence
      if (inner.length > 0 && inner.length <= 110 && !inner.endsWith(".")) {
        // Subsections like 1.1, 2.3, 1.1.1, or prefixed with ###
        if (/^\d+\.\d+/.test(inner) || inner.startsWith("###")) {
          blocks.push({ type: "h3", text: clean(inner.replace(/^###\s*/, "")) });
        } else {
          blocks.push({ type: "h2", text: clean(inner.replace(/^##\s*/, "")) });
        }
        continue;
      }
    }

    // 7. Numbered hierarchical sections without markdown marks (e.g. "1.1 Contexto", "2.3.1 Instrumentos")
    const subSectionMatch = line.match(/^(\d+\.\d+(?:\.\d+)*)\.?\s+([A-ZÁÉÍÓÚÀÂÊÔÃÕÇ].*)$/);
    if (subSectionMatch) {
      const subTitle = subSectionMatch[2].trim();
      if (subTitle.length <= 110 && !subTitle.endsWith(";")) {
        blocks.push({ type: "h3", text: clean(line) });
        continue;
      }
    }

    // 8. Top-level numbered sections without markdown marks (e.g. "1. Introdução", "2. Metodologia de Investigação")
    const mainSectionMatch = line.match(/^(\d+)\.\s+([A-ZÁÉÍÓÚÀÂÊÔÃÕÇ].*)$/);
    if (mainSectionMatch) {
      const secTitle = mainSectionMatch[2].trim();
      const isKnownKeyword = KNOWN_SECTION_KEYWORDS.test(secTitle);
      const isShortTitle = secTitle.length <= 75 && !/[.;]$/.test(secTitle);

      if (isKnownKeyword || (isShortTitle && !secTitle.includes(","))) {
        blocks.push({ type: "h2", text: clean(line) });
        continue;
      }
    }

    // 9. Roman Numeral sections (e.g. "I. INTRODUÇÃO", "II. REVISÃO TEÓRICA", "IV. Conclusão")
    const romanMatch = line.match(/^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.\s+([A-ZÁÉÍÓÚÀÂÊÔÃÕÇ].*)$/i);
    if (romanMatch) {
      const romanTitle = romanMatch[2].trim();
      if (romanTitle.length <= 80 && !/[.;]$/.test(romanTitle)) {
        blocks.push({ type: "h2", text: clean(line) });
        continue;
      }
    }

    // 10. Standalone ALL-CAPS section headers (e.g. "INTRODUÇÃO", "METODOLOGIA", "CONSIDERAÇÕES FINAIS")
    if (/^[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ0-9\s\.\-—–:]{3,65}$/.test(line) && !line.endsWith(".")) {
      const lettersCount = (line.match(/[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ]/g) || []).length;
      if (lettersCount >= 4) {
        const isHeadingWord = KNOWN_SECTION_KEYWORDS.test(line);
        const wordCount = line.split(/\s+/).length;
        if (isHeadingWord || (wordCount <= 6 && !line.includes(","))) {
          blocks.push({ type: "h2", text: clean(line) });
          continue;
        }
      }
    }

    // 11. Numbered list items (e.g. "1. Primeiro passo...", "2) Segundo item...")
    const listMatch = line.match(/^(\d+[.)])\s+(.+)$/);
    if (listMatch) {
      blocks.push({
        type: "number",
        prefix: listMatch[1],
        text: clean(listMatch[2]),
      });
      continue;
    }

    // 12. Regular Paragraph
    blocks.push({ type: "p", text: clean(line) });
  }

  return blocks;
}

export function safeFileName(title: string): string {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return base || "documento";
}

function triggerDownload(blob: Blob, filename: string) {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/** Extracts or constructs structured CvData from options, fields, or markdown content. */
function resolveCvData(title: string, content: string, options?: ExportOptions): CvData {
  if (options?.fields && Object.keys(options.fields).length > 0) {
    return extractCvDataFromFields(options.fields, title);
  }

  // Fallback: parse markdown lines into CvData fields if options.fields is empty
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const cv: CvData = {
    fullName: title || "Seu Nome Completo",
    headline: "Profissional",
    experience: [],
    education: [],
    skills: [],
    languages: [],
  };

  let currentSection = "";
  for (const line of lines) {
    if (line.startsWith("# ")) {
      cv.fullName = clean(line.replace("# ", ""));
    } else if (line.startsWith("## ")) {
      const h2 = clean(line.replace("## ", "")).toLowerCase();
      if (h2.includes("perfil") || h2.includes("resumo") || h2.includes("sobre")) currentSection = "profile";
      else if (h2.includes("experi")) currentSection = "experience";
      else if (h2.includes("forma") || h2.includes("educa")) currentSection = "education";
      else if (h2.includes("compet") || h2.includes("skill")) currentSection = "skills";
      else if (h2.includes("idioma") || h2.includes("lingua")) currentSection = "languages";
      else currentSection = "other";
    } else if (line.startsWith("### ")) {
      const h3 = clean(line.replace("### ", ""));
      if (currentSection === "experience") cv.experience?.push(h3);
      else if (currentSection === "education") cv.education?.push(h3);
      else if (currentSection === "skills") cv.skills?.push(h3);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const item = clean(line.substring(2));
      const itemLower = item.toLowerCase();
      if (itemLower.startsWith("email:")) cv.email = item.replace(/^email:\s*/i, "");
      else if (itemLower.startsWith("telefone:")) cv.phone = item.replace(/^telefone:\s*/i, "");
      else if (itemLower.startsWith("endereço:") || itemLower.startsWith("cidade:")) cv.location = item.replace(/^(endereço|cidade):\s*/i, "");
      else if (itemLower.startsWith("linkedin:")) cv.linkedin = item.replace(/^linkedin:\s*/i, "");
      else if (itemLower.startsWith("data de nascimento:")) cv.birthDate = item.replace(/^data de nascimento:\s*/i, "");
      else if (itemLower.startsWith("nacionalidade:")) cv.nationality = item.replace(/^nacionalidade:\s*/i, "");
      else if (itemLower.startsWith("bi:") || itemLower.startsWith("cartão de cidadão:") || itemLower.startsWith("cc:")) {
        cv.biNumber = item.replace(/^(bi|cartão de cidadão|cc):\s*/i, "");
      }
      else if (itemLower.startsWith("nuit:") || itemLower.startsWith("nif:")) {
        cv.nuitNumber = item.replace(/^(nuit|nif):\s*/i, "");
      }
      else if (itemLower.startsWith("carta de condução:") || itemLower.startsWith("carta:")) {
        cv.drivingLicense = item.replace(/^(carta de condução|carta):\s*/i, "");
      }
      else if (currentSection === "experience") cv.experience?.push(item);
      else if (currentSection === "education") cv.education?.push(item);
      else if (currentSection === "skills") cv.skills?.push(item);
      else if (currentSection === "languages") cv.languages?.push(item);
    } else {
      if (currentSection === "profile") {
        cv.profile = cv.profile ? `${cv.profile} ${clean(line)}` : clean(line);
      }
    }
  }

  return cv;
}

/* ========================================================================== */
/* 1. PDF EXPORT IMPLEMENTATION (STANDARD & 4 CV VISUAL TEMPLATES)            */
/* ========================================================================== */

export function exportToPdf(
  title: string,
  content: string,
  options?: ExportOptions | string,
  skipSave = false
) {
  const opts: ExportOptions = typeof options === "string" ? { footer: options } : options || {};
  const isCv = opts.docType === "cv" || opts.docType === "simple_cv" || (opts.templateId && ["modern", "classic", "minimal", "bold"].includes(opts.templateId));

  if (isCv) {
    return exportCvToPdf(title, content, opts, skipSave);
  }

  return exportStandardToPdf(title, content, opts.footer || "Dokvera — Documentação Inteligente", skipSave, opts.country);
}

/** Standard Document PDF (Academic / Administrative / Letters with Country-specific Letterhead) */
function exportStandardToPdf(
  title: string,
  content: string,
  footer: string,
  skipSave = false,
  country?: string | null
) {
  const blocks = parseContent(content);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 56;
  const maxWidth = pageWidth - margin * 2;

  const countryConfig = getCountryConfig(country);
  const republicName =
    countryConfig.code === "AO"
      ? "REPÚBLICA DE ANGOLA"
      : countryConfig.code === "PT"
      ? "REPÚBLICA PORTUGUESA"
      : "REPÚBLICA DE MOÇAMBIQUE";

  const COLOR_PRIMARY: RGB = [27, 54, 93]; // #1B365D - Azul Escuro Executivo
  const COLOR_SECONDARY: RGB = [44, 82, 130]; // #2C5282 - Azul Corporativo Médio
  const COLOR_TEXT: RGB = [45, 55, 72]; // #2D3748 - Cinza Escuro Suave
  const COLOR_GOLD: RGB = [197, 160, 89]; // #C5A059 - Dourado Moçambicano / Nobre
  const COLOR_MUTED: RGB = [113, 128, 150]; // #718096 - Cinza Muted

  const drawLetterhead = () => {
    doc.setDrawColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.setLineWidth(3);
    doc.line(margin, 40, pageWidth - margin, 40);

    doc.setDrawColor(COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2]);
    doc.setLineWidth(1);
    doc.line(margin, 46, pageWidth - margin, 46);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.text(republicName, pageWidth / 2, 64, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
    doc.text("DOKVERA • SERVIÇO DE ELABORAÇÃO DOCUMENTAL INTELIGENTE", pageWidth / 2, 76, { align: "center" });

    doc.setDrawColor(COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2]);
    doc.setLineWidth(1);
    doc.circle(pageWidth / 2, 94, 6);
    doc.line(pageWidth / 2 - 12, 94, pageWidth / 2 + 12, 94);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(margin, 110, pageWidth - margin, 110);
  };

  drawLetterhead();
  let y = 140;

  const ensureSpace = (needed: number) => {
    if (y + needed <= pageHeight - margin - 20) return;
    doc.addPage();
    y = margin + 10;
  };

  const write = (
    text: string,
    { size, style, color, spacingBefore, spacingAfter, indent = 0 }:
      { size: number; style: "normal" | "bold" | "italic"; color: RGB; spacingBefore: number; spacingAfter: number; indent?: number }
  ) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, maxWidth - indent) as string[];
    const lineHeight = size * 1.5;

    ensureSpace(spacingBefore + lines.length * lineHeight);
    y += spacingBefore;

    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, margin + indent, y);
      y += lineHeight;
    }
    y += spacingAfter;
  };

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  const titleLines = doc.splitTextToSize(title.toUpperCase(), maxWidth) as string[];

  for (const line of titleLines) {
    ensureSpace(24);
    doc.text(line, margin, y);
    y += 24;
  }
  y += 12;

  for (const block of blocks) {
    if (block.type === "h1") {
      write(block.text, { size: 14, style: "bold", color: COLOR_PRIMARY, spacingBefore: 18, spacingAfter: 8 });
      ensureSpace(4);
      doc.setDrawColor(COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2]);
      doc.setLineWidth(1.5);
      doc.line(margin, y - 4, margin + 90, y - 4);
      y += 6;
    } else if (block.type === "h2") {
      write(block.text, { size: 12, style: "bold", color: COLOR_SECONDARY, spacingBefore: 16, spacingAfter: 6 });
      ensureSpace(4);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.75);
      doc.line(margin, y - 2, pageWidth - margin, y - 2);
      y += 4;
    } else if (block.type === "h3") {
      write(block.text, { size: 10.5, style: "bold", color: COLOR_TEXT, spacingBefore: 12, spacingAfter: 5 });
    } else if (block.type === "bullet") {
      doc.setFillColor(COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2]);
      doc.circle(margin + 6, y + 5, 2.5, "F");
      write(block.text, { size: 10, style: "normal", color: COLOR_TEXT, spacingBefore: 0, spacingAfter: 4, indent: 18 });
    } else if (block.type === "number") {
      const numPrefix = block.prefix || "•";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
      doc.text(numPrefix, margin + 2, y + 8);
      write(block.text, { size: 10, style: "normal", color: COLOR_TEXT, spacingBefore: 0, spacingAfter: 4, indent: 20 });
    } else if (block.type === "quote") {
      const quoteStartY = y + 2;
      write(block.text, { size: 9.5, style: "italic", color: COLOR_MUTED, spacingBefore: 4, spacingAfter: 8, indent: 20 });
      doc.setDrawColor(COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2]);
      doc.setLineWidth(2);
      doc.line(margin + 6, quoteStartY, margin + 6, y - 4);
    } else {
      write(block.text, { size: 10, style: "normal", color: COLOR_TEXT, spacingBefore: 0, spacingAfter: 8 });
    }
  }

  // Footer & Page numbering
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) {
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1);
      doc.line(margin, 35, pageWidth - margin, 35);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
      doc.text(title.toUpperCase(), margin, 28);
    }
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(margin, pageHeight - 45, pageWidth - margin, pageHeight - 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
    doc.text(footer, margin, pageHeight - 32);

    const pageNumText = `Página ${i} de ${totalPages}`;
    const textWidth = doc.getTextWidth(pageNumText);
    doc.text(pageNumText, pageWidth - margin - textWidth, pageHeight - 32);
  }

  if (!skipSave) {
    try {
      doc.save(`${safeFileName(title)}.pdf`);
    } catch {
      // headless / SSR environment
    }
  }
  return doc;
}

/** Visual CV PDF Engine rendering the 4 visual templates from cv-document-sheet.tsx */
export function exportCvToPdf(title: string, content: string, options: ExportOptions, skipSave = false) {
  const template = options.templateId || "modern";
  const accentKey = (options.accentColor || "indigo") as CvAccentColor;
  const accentConfig = CV_ACCENT_COLORS.find((c) => c.id === accentKey) ?? CV_ACCENT_COLORS[0];
  const accentRgb = hexToRgb(accentConfig.hex);
  const cvData = resolveCvData(title, content, options);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth(); // ~595.28 pt
  const pageHeight = doc.internal.pageSize.getHeight(); // ~841.89 pt

  if (template === "modern") {
    renderModernCvPdf(doc, cvData, accentRgb, accentConfig.hex, pageWidth, pageHeight, options);
  } else if (template === "classic") {
    renderClassicCvPdf(doc, cvData, accentRgb, accentConfig.hex, pageWidth, pageHeight, options);
  } else if (template === "minimal") {
    renderMinimalCvPdf(doc, cvData, accentRgb, accentConfig.hex, pageWidth, pageHeight, options);
  } else if (template === "bold") {
    renderBoldCvPdf(doc, cvData, accentRgb, accentConfig.hex, pageWidth, pageHeight, options);
  } else {
    renderModernCvPdf(doc, cvData, accentRgb, accentConfig.hex, pageWidth, pageHeight, options);
  }

  if (!skipSave) {
    try {
      doc.save(`${safeFileName(cvData.fullName || title)}-cv.pdf`);
    } catch {
      // headless / SSR environment
    }
  }
  return doc;
}

/** Template 1: Modern Executive 2-Column CV PDF */
function renderModernCvPdf(
  doc: jsPDF,
  cv: CvData,
  accent: RGB,
  accentHex: string,
  pageWidth: number,
  pageHeight: number,
  options?: ExportOptions
) {
  const sidebarWidth = 195;
  const mainX = sidebarWidth + 24;
  const mainWidth = pageWidth - mainX - 32;

  // 1. Draw Left Dark Sidebar
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, sidebarWidth, pageHeight, "F");

  let sideY = 36;

  // Avatar / Photo in Sidebar
  if (cv.photoUrl && cv.photoUrl.startsWith("data:image")) {
    try {
      doc.addImage(cv.photoUrl, "JPEG", sidebarWidth / 2 - 28, sideY, 56, 56);
      sideY += 66;
    } catch {
      drawInitialsBox();
    }
  } else {
    drawInitialsBox();
  }

  function drawInitialsBox() {
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.roundedRect(sidebarWidth / 2 - 26, sideY, 52, 52, 6, 6, "F");
    const initials = (cv.fullName || "CV")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(initials, sidebarWidth / 2, sideY + 32, { align: "center" });
    sideY += 62;
  }

  // Name in sidebar
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(241, 245, 249);
  const nameLines = doc.splitTextToSize(cv.fullName || "Nome Completo", sidebarWidth - 32) as string[];
  for (const nLine of nameLines) {
    doc.text(nLine, sidebarWidth / 2, sideY, { align: "center" });
    sideY += 14;
  }
  sideY += 8;

  const writeSidebarHeader = (label: string) => {
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.75);
    doc.line(16, sideY, sidebarWidth - 16, sideY);
    sideY += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(label.toUpperCase(), 16, sideY);
    sideY += 11;
  };

  // Contactos in Sidebar
  writeSidebarHeader("Contactos");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);

  if (cv.email) {
    doc.text(cv.email, 16, sideY);
    sideY += 12;
  }
  if (cv.phone) {
    doc.text(cv.phone, 16, sideY);
    sideY += 12;
  }
  if (cv.location) {
    doc.text(cv.location, 16, sideY);
    sideY += 12;
  }
  if (cv.linkedin) {
    const lk = doc.splitTextToSize(cv.linkedin, sidebarWidth - 32) as string[];
    for (const l of lk) {
      doc.text(l, 16, sideY);
      sideY += 11;
    }
  }
  sideY += 6;

  // Dados Pessoais in Sidebar
  const hasPersonal = cv.birthDate || cv.nationality || cv.biNumber || cv.nuitNumber || cv.drivingLicense;
  if (hasPersonal) {
    writeSidebarHeader("Dados Pessoais");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    if (cv.birthDate) {
      doc.text(`Nasc.: ${cv.birthDate}`, 16, sideY);
      sideY += 11;
    }
    if (cv.nationality) {
      doc.text(`Nac.: ${cv.nationality}`, 16, sideY);
      sideY += 11;
    }
    const countryConfig = getCountryConfig(options.country);
    if (cv.biNumber) {
      doc.text(`${countryConfig.idDocumentShort}: ${cv.biNumber}`, 16, sideY);
      sideY += 11;
    }
    if (cv.nuitNumber) {
      doc.text(`${countryConfig.taxNumberShort}: ${cv.nuitNumber}`, 16, sideY);
      sideY += 11;
    }
    if (cv.drivingLicense) {
      doc.text(`Carta: ${cv.drivingLicense}`, 16, sideY);
      sideY += 11;
    }
    sideY += 6;
  }

  // Competências in Sidebar
  if (cv.skills && cv.skills.length > 0) {
    writeSidebarHeader("Competências");
    for (const skill of cv.skills.slice(0, 8)) {
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(16, sideY - 7, sidebarWidth - 32, 14, 3, 3, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(241, 245, 249);
      doc.text(skill, 20, sideY + 2);
      sideY += 17;
    }
    sideY += 6;
  }

  // Idiomas in Sidebar
  if (cv.languages && cv.languages.length > 0) {
    writeSidebarHeader("Idiomas");
    for (const lang of cv.languages) {
      doc.setFillColor(accent[0], accent[1], accent[2]);
      doc.circle(20, sideY - 2, 2, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(226, 232, 240);
      doc.text(lang, 28, sideY);
      sideY += 12;
    }
  }

  // 2. Draw Right Main Content
  let mainY = 40;

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text(cv.fullName || "Nome Completo", mainX, mainY);
  mainY += 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(accent[0], accent[1], accent[2]);
  doc.text(cv.headline || "Título Profissional", mainX, mainY);
  mainY += 14;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(mainX, mainY, mainX + mainWidth, mainY);
  mainY += 16;

  const writeMainSectionHeader = (titleText: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(titleText.toUpperCase(), mainX, mainY);
    mainY += 4;
    doc.setDrawColor(accent[0], accent[1], accent[2]);
    doc.setLineWidth(1.5);
    doc.line(mainX, mainY, mainX + 45, mainY);
    mainY += 12;
  };

  // Perfil Profissional
  if (cv.profile) {
    writeMainSectionHeader("Perfil Profissional");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const pLines = doc.splitTextToSize(cv.profile, mainWidth) as string[];
    for (const p of pLines) {
      doc.text(p, mainX, mainY);
      mainY += 12.5;
    }
    mainY += 14;
  }

  // Experiência Profissional
  if (cv.experience && cv.experience.length > 0) {
    writeMainSectionHeader("Experiência Profissional");
    for (const exp of cv.experience) {
      const parts = exp.split("\n").filter(Boolean);
      const titleLine = parts[0] || exp;
      const descLines = parts.slice(1).join(" ");

      // Vertical Accent Bar
      doc.setDrawColor(accent[0], accent[1], accent[2]);
      doc.setLineWidth(2);
      doc.line(mainX, mainY - 6, mainX, mainY + (descLines ? 20 : 8));

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(titleLine, mainX + 8, mainY);
      mainY += 12;

      if (descLines) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const dText = doc.splitTextToSize(descLines, mainWidth - 10) as string[];
        for (const dt of dText) {
          doc.text(dt, mainX + 8, mainY);
          mainY += 11.5;
        }
      }
      mainY += 8;
    }
    mainY += 6;
  }

  // Formação Académica
  if (cv.education && cv.education.length > 0) {
    writeMainSectionHeader("Formação Académica");
    for (const edu of cv.education) {
      const parts = edu.split("\n").filter(Boolean);
      const titleLine = parts[0] || edu;
      const descLines = parts.slice(1).join(" ");

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(1.5);
      doc.line(mainX, mainY - 6, mainX, mainY + (descLines ? 16 : 6));

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(titleLine, mainX + 8, mainY);
      mainY += 12;

      if (descLines) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const dText = doc.splitTextToSize(descLines, mainWidth - 10) as string[];
        for (const dt of dText) {
          doc.text(dt, mainX + 8, mainY);
          mainY += 11;
        }
      }
      mainY += 6;
    }
  }
}

/** Template 2: Classic ATS-Friendly 1-Column Executive CV PDF */
function renderClassicCvPdf(
  doc: jsPDF,
  cv: CvData,
  accent: RGB,
  accentHex: string,
  pageWidth: number,
  pageHeight: number,
  options?: ExportOptions
) {
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = 42;

  // Header Center
  if (cv.photoUrl && cv.photoUrl.startsWith("data:image")) {
    try {
      doc.addImage(cv.photoUrl, "JPEG", pageWidth / 2 - 20, y, 40, 40);
      y += 48;
    } catch {
      // ignore
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text((cv.fullName || "Nome Completo").toUpperCase(), pageWidth / 2, y, { align: "center" });
  y += 16;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text((cv.headline || "Título Profissional").toUpperCase(), pageWidth / 2, y, { align: "center" });
  y += 14;

  // Contact line
  const contacts = [cv.email, cv.phone, cv.location, cv.linkedin].filter(Boolean).join("  •  ");
  if (contacts) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(contacts, pageWidth / 2, y, { align: "center" });
    y += 12;
  }

  // Separator Bar in Accent Color
  doc.setDrawColor(accent[0], accent[1], accent[2]);
  doc.setLineWidth(2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;

  const writeClassicHeader = (titleText: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.text(titleText.toUpperCase(), margin, y);
    y += 4;
    doc.setDrawColor(accent[0], accent[1], accent[2]);
    doc.setLineWidth(0.75);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;
  };

  // Perfil Profissional
  if (cv.profile) {
    writeClassicHeader("Perfil Profissional");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const pLines = doc.splitTextToSize(cv.profile, maxWidth) as string[];
    for (const p of pLines) {
      doc.text(p, margin, y);
      y += 12.5;
    }
    y += 14;
  }

  // Experiência Profissional
  if (cv.experience && cv.experience.length > 0) {
    writeClassicHeader("Experiência Profissional");
    for (const exp of cv.experience) {
      const parts = exp.split("\n").filter(Boolean);
      const titleLine = parts[0] || exp;
      const descLines = parts.slice(1).join(" ");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(titleLine, margin, y);
      y += 12;

      if (descLines) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const dText = doc.splitTextToSize(descLines, maxWidth - 10) as string[];
        for (const dt of dText) {
          doc.text(dt, margin + 8, y);
          y += 11.5;
        }
      }
      y += 6;
    }
    y += 8;
  }

  // Formação Académica
  if (cv.education && cv.education.length > 0) {
    writeClassicHeader("Formação Académica");
    for (const edu of cv.education) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`•  ${edu}`, margin, y);
      y += 13;
    }
    y += 12;
  }

  // Competências & Idiomas (2-Column split at bottom)
  const colWidth = (maxWidth - 20) / 2;
  const col1X = margin;
  const col2X = margin + colWidth + 20;
  const savedY = y;

  if (cv.skills && cv.skills.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.text("COMPETÊNCIAS", col1X, y);
    doc.line(col1X, y + 3, col1X + colWidth, y + 3);
    y += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    for (const s of cv.skills) {
      doc.text(`•  ${s}`, col1X, y);
      y += 11.5;
    }
  }

  let y2 = savedY;
  const hasCol2 = (cv.languages && cv.languages.length > 0) || cv.biNumber || cv.nuitNumber;
  if (hasCol2) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.text("IDIOMAS & DETALHES", col2X, y2);
    doc.line(col2X, y2 + 3, col2X + colWidth, y2 + 3);
    y2 += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    if (cv.languages && cv.languages.length > 0) {
      for (const l of cv.languages) {
        doc.text(`•  ${l}`, col2X, y2);
        y2 += 11.5;
      }
    }
    const countryConfig = getCountryConfig(options.country);
    if (cv.biNumber) {
      doc.text(`•  ${countryConfig.idDocumentShort}: ${cv.biNumber}`, col2X, y2);
      y2 += 11.5;
    }
    if (cv.nuitNumber) {
      doc.text(`•  ${countryConfig.taxNumberShort}: ${cv.nuitNumber}`, col2X, y2);
      y2 += 11.5;
    }
  }
}

/** Template 3: Swiss Minimalist Asymmetric CV PDF */
function renderMinimalCvPdf(
  doc: jsPDF,
  cv: CvData,
  accent: RGB,
  accentHex: string,
  pageWidth: number,
  pageHeight: number,
  options?: ExportOptions
) {
  const margin = 50;
  const labelWidth = 100;
  const contentX = margin + labelWidth + 20;
  const contentWidth = pageWidth - contentX - margin;
  let y = 48;

  // Header Left Heavy
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(15, 23, 42);
  doc.text(cv.fullName || "Nome Completo", margin, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(cv.headline || "Título Profissional", margin, y);
  y += 14;

  const countryConfig = getCountryConfig(options?.country);
  const contactParts = [cv.email, cv.phone, cv.location, cv.linkedin].filter(Boolean);
  if (cv.biNumber) contactParts.push(`${countryConfig.idDocumentShort}: ${cv.biNumber}`);
  if (cv.nuitNumber) contactParts.push(`${countryConfig.taxNumberShort}: ${cv.nuitNumber}`);
  const contacts = contactParts.join("   |   ");
  if (contacts) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(contacts, margin, y);
    y += 16;
  }

  const writeMinimalRow = (label: string, renderContent: () => void) => {
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;

    const startY = y;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(label.toUpperCase(), margin, y);

    renderContent();
    y = Math.max(y, startY + 16) + 12;
  };

  // Sobre
  if (cv.profile) {
    writeMinimalRow("Sobre", () => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const pLines = doc.splitTextToSize(cv.profile || "", contentWidth) as string[];
      for (const p of pLines) {
        doc.text(p, contentX, y);
        y += 12;
      }
    });
  }

  // Experiência
  if (cv.experience && cv.experience.length > 0) {
    writeMinimalRow("Experiência", () => {
      for (const exp of cv.experience || []) {
        const parts = exp.split("\n").filter(Boolean);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(parts[0] || exp, contentX, y);
        y += 12;

        if (parts.length > 1) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          const dLines = doc.splitTextToSize(parts.slice(1).join(" "), contentWidth) as string[];
          for (const d of dLines) {
            doc.text(d, contentX, y);
            y += 11;
          }
        }
        y += 6;
      }
    });
  }

  // Educação
  if (cv.education && cv.education.length > 0) {
    writeMinimalRow("Educação", () => {
      for (const edu of cv.education || []) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(edu, contentX, y);
        y += 13;
      }
    });
  }

  // Skills
  if (cv.skills && cv.skills.length > 0) {
    writeMinimalRow("Skills", () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const skillsText = (cv.skills || []).join("  •  ");
      const sLines = doc.splitTextToSize(skillsText, contentWidth) as string[];
      for (const s of sLines) {
        doc.text(s, contentX, y);
        y += 12;
      }
    });
  }
}

/** Template 4: Bold / Creative Top Banner CV PDF */
function renderBoldCvPdf(
  doc: jsPDF,
  cv: CvData,
  accent: RGB,
  accentHex: string,
  pageWidth: number,
  pageHeight: number,
  options?: ExportOptions
) {
  const bannerHeight = 115;
  const margin = 45;
  const maxWidth = pageWidth - margin * 2;

  // 1. Draw Top Colored Banner
  doc.setFillColor(accent[0], accent[1], accent[2]);
  doc.rect(0, 0, pageWidth, bannerHeight, "F");

  // Banner text in white
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(cv.fullName || "Nome Completo", margin, 45);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(cv.headline || "Título Profissional", margin, 62);

  const countryConfig = getCountryConfig(options?.country);
  const contactParts = [cv.email, cv.phone, cv.location].filter(Boolean);
  if (cv.biNumber) contactParts.push(`${countryConfig.idDocumentShort}: ${cv.biNumber}`);
  if (cv.nuitNumber) contactParts.push(`${countryConfig.taxNumberShort}: ${cv.nuitNumber}`);
  const contacts = contactParts.join("   •   ");
  if (contacts) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(240, 240, 240);
    doc.text(contacts, margin, 80);
  }

  if (cv.photoUrl && cv.photoUrl.startsWith("data:image")) {
    try {
      doc.addImage(cv.photoUrl, "JPEG", pageWidth - margin - 55, 25, 55, 55);
    } catch {
      // ignore
    }
  }

  // 2. Main Content
  let y = bannerHeight + 24;

  const writeBoldSectionHeader = (titleText: string) => {
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(margin, y - 8, 3.5, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(titleText.toUpperCase(), margin + 9, y + 2);
    y += 16;
  };

  // Resumo
  if (cv.profile) {
    writeBoldSectionHeader("Resumo");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const pLines = doc.splitTextToSize(cv.profile, maxWidth) as string[];
    for (const p of pLines) {
      doc.text(p, margin, y);
      y += 12;
    }
    y += 12;
  }

  // Percurso Profissional (in cards)
  if (cv.experience && cv.experience.length > 0) {
    writeBoldSectionHeader("Percurso Profissional");
    for (const exp of cv.experience) {
      const parts = exp.split("\n").filter(Boolean);
      const titleLine = parts[0] || exp;
      const descLines = parts.slice(1).join(" ");

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y - 6, maxWidth, descLines ? 38 : 22, 4, 4, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(titleLine, margin + 10, y + 6);

      if (descLines) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(descLines, margin + 10, y + 20);
        y += 44;
      } else {
        y += 28;
      }
    }
    y += 8;
  }

  // Formação & Habilidades (2-Column split)
  const colWidth = (maxWidth - 20) / 2;
  writeBoldSectionHeader("Formação & Habilidades");
  const rowStartY = y;

  if (cv.education && cv.education.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    for (const edu of cv.education) {
      doc.text(`•  ${edu}`, margin, y);
      y += 13;
    }
  }

  let yRight = rowStartY;
  if (cv.skills && cv.skills.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    for (const s of cv.skills) {
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin + colWidth + 20, yRight - 7, colWidth - 10, 13, 3, 3, "F");
      doc.text(s, margin + colWidth + 26, yRight + 2);
      yRight += 16;
    }
  }
}

/* ========================================================================== */
/* 2. DOCX EXPORT IMPLEMENTATION (STANDARD & 4 CV VISUAL TEMPLATES)           */
/* ========================================================================== */

export async function exportToDocx(
  title: string,
  content: string,
  options?: ExportOptions | string
) {
  const opts: ExportOptions = typeof options === "string" ? { footer: options } : options || {};
  const isCv = opts.docType === "cv" || opts.docType === "simple_cv" || (opts.templateId && ["modern", "classic", "minimal", "bold"].includes(opts.templateId));

  if (isCv) {
    return exportCvToDocx(title, content, opts);
  }

  return exportStandardToDocx(title, content, opts.footer || "Dokvera by Ruqzora");
}

/** Standard DOCX export */
async function exportStandardToDocx(title: string, content: string, footer: string) {
  const blocks = parseContent(content);

  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 320 },
      children: [new TextRun({ text: title, bold: true, size: 40, font: "Arial" })],
    }),
  ];

  for (const block of blocks) {
    if (block.type === "h1" || block.type === "h2" || block.type === "h3") {
      children.push(
        new Paragraph({
          heading:
            block.type === "h1"
              ? HeadingLevel.HEADING_1
              : block.type === "h2"
                ? HeadingLevel.HEADING_2
                : HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 140 },
          children: [
            new TextRun({
              text: block.text,
              bold: true,
              font: "Arial",
              size: block.type === "h1" ? 32 : block.type === "h2" ? 28 : 26,
            }),
          ],
        }),
      );
    } else if (block.type === "bullet" || block.type === "number") {
      children.push(
        new Paragraph({
          numbering: { reference: block.type === "bullet" ? "dokvera-bullets" : "dokvera-numbers", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: block.text, font: "Arial", size: 24 })],
        }),
      );
    } else if (block.type === "quote") {
      children.push(
        new Paragraph({
          indent: { left: 720 },
          spacing: { before: 140, after: 180, line: 300 },
          children: [new TextRun({ text: block.text, italics: true, font: "Arial", size: 22, color: "475569" })],
        }),
      );
    } else {
      children.push(
        new Paragraph({
          spacing: { after: 160, line: 320 },
          children: [new TextRun({ text: block.text, font: "Arial", size: 24 })],
        }),
      );
    }
  }

  children.push(
    new Paragraph({
      spacing: { before: 400 },
      children: [new TextRun({ text: footer, font: "Arial", size: 18, color: "8A8A8A" })],
    }),
  );

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 24 } } } },
    numbering: {
      config: [
        {
          reference: "dokvera-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
        {
          reference: "dokvera-numbers",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `${safeFileName(title)}.docx`);
  return blob;
}

/** Visual CV DOCX export reflecting the chosen template layout */
async function exportCvToDocx(title: string, content: string, options: ExportOptions) {
  const template = options.templateId || "modern";
  const accentKey = (options.accentColor || "indigo") as CvAccentColor;
  const accentConfig = CV_ACCENT_COLORS.find((c) => c.id === accentKey) ?? CV_ACCENT_COLORS[0];
  const accentHexClean = accentConfig.hex.replace("#", "");
  const cv = resolveCvData(title, content, options);

  const children: (Paragraph | Table)[] = [];

  if (template === "modern") {
    // 2-Column Table for Modern Executive
    const leftCellParagraphs: Paragraph[] = [
      new Paragraph({
        children: [new TextRun({ text: cv.fullName || "Nome Completo", bold: true, size: 28, color: "FFFFFF" })],
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: cv.headline || "Título Profissional", size: 20, color: "CBD5E1" })],
        spacing: { after: 240 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "CONTACTOS", bold: true, size: 18, color: "94A3B8" })],
        spacing: { after: 80 },
      }),
    ];

    if (cv.email) leftCellParagraphs.push(new Paragraph({ children: [new TextRun({ text: cv.email, size: 18, color: "E2E8F0" })], spacing: { after: 40 } }));
    if (cv.phone) leftCellParagraphs.push(new Paragraph({ children: [new TextRun({ text: cv.phone, size: 18, color: "E2E8F0" })], spacing: { after: 40 } }));
    if (cv.location) leftCellParagraphs.push(new Paragraph({ children: [new TextRun({ text: cv.location, size: 18, color: "E2E8F0" })], spacing: { after: 80 } }));

    const countryConfig = getCountryConfig(options.country);
    const hasPersonal = Boolean(cv.birthDate || cv.nationality || cv.biNumber || cv.nuitNumber || cv.drivingLicense);
    if (hasPersonal) {
      leftCellParagraphs.push(new Paragraph({ children: [new TextRun({ text: "DADOS PESSOAIS", bold: true, size: 18, color: "94A3B8" })], spacing: { after: 80 } }));
      if (cv.birthDate) leftCellParagraphs.push(new Paragraph({ children: [new TextRun({ text: `Nasc.: ${cv.birthDate}`, size: 18, color: "E2E8F0" })], spacing: { after: 40 } }));
      if (cv.nationality) leftCellParagraphs.push(new Paragraph({ children: [new TextRun({ text: `Nac.: ${cv.nationality}`, size: 18, color: "E2E8F0" })], spacing: { after: 40 } }));
      if (cv.biNumber) leftCellParagraphs.push(new Paragraph({ children: [new TextRun({ text: `${countryConfig.idDocumentShort}: ${cv.biNumber}`, size: 18, color: "E2E8F0" })], spacing: { after: 40 } }));
      if (cv.nuitNumber) leftCellParagraphs.push(new Paragraph({ children: [new TextRun({ text: `${countryConfig.taxNumberShort}: ${cv.nuitNumber}`, size: 18, color: "E2E8F0" })], spacing: { after: 40 } }));
      if (cv.drivingLicense) leftCellParagraphs.push(new Paragraph({ children: [new TextRun({ text: `Carta: ${cv.drivingLicense}`, size: 18, color: "E2E8F0" })], spacing: { after: 80 } }));
    }

    if (cv.skills && cv.skills.length > 0) {
      leftCellParagraphs.push(new Paragraph({ children: [new TextRun({ text: "COMPETÊNCIAS", bold: true, size: 18, color: "94A3B8" })], spacing: { after: 80 } }));
      for (const s of cv.skills) {
        leftCellParagraphs.push(new Paragraph({ children: [new TextRun({ text: `• ${s}`, size: 18, color: "E2E8F0" })], spacing: { after: 40 } }));
      }
    }

    const rightCellParagraphs: Paragraph[] = [];
    if (cv.profile) {
      rightCellParagraphs.push(new Paragraph({ children: [new TextRun({ text: "PERFIL PROFISSIONAL", bold: true, size: 22, color: accentHexClean })], spacing: { after: 80 } }));
      rightCellParagraphs.push(new Paragraph({ children: [new TextRun({ text: cv.profile, size: 20, color: "334155" })], spacing: { after: 200 } }));
    }

    if (cv.experience && cv.experience.length > 0) {
      rightCellParagraphs.push(new Paragraph({ children: [new TextRun({ text: "EXPERIÊNCIA PROFISSIONAL", bold: true, size: 22, color: accentHexClean })], spacing: { after: 80 } }));
      for (const exp of cv.experience) {
        rightCellParagraphs.push(new Paragraph({ children: [new TextRun({ text: exp, size: 20, color: "1E293B" })], spacing: { after: 120 } }));
      }
    }

    if (cv.education && cv.education.length > 0) {
      rightCellParagraphs.push(new Paragraph({ children: [new TextRun({ text: "FORMAÇÃO ACADÉMICA", bold: true, size: 22, color: accentHexClean })], spacing: { after: 80 } }));
      for (const edu of cv.education) {
        rightCellParagraphs.push(new Paragraph({ children: [new TextRun({ text: edu, size: 20, color: "1E293B" })], spacing: { after: 100 } }));
      }
    }

    const modernTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: { fill: "0F172A", val: ShadingType.CLEAR },
              margins: { top: 280, bottom: 280, left: 280, right: 280 },
              children: leftCellParagraphs,
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              margins: { top: 280, bottom: 280, left: 340, right: 280 },
              children: rightCellParagraphs,
            }),
          ],
        }),
      ],
    });
    children.push(modernTable);
  } else if (template === "bold") {
    // Top banner shaded in accent color
    const countryConfig = getCountryConfig(options.country);
    const contactParts = [cv.email, cv.phone, cv.location].filter(Boolean);
    if (cv.biNumber) contactParts.push(`${countryConfig.idDocumentShort}: ${cv.biNumber}`);
    if (cv.nuitNumber) contactParts.push(`${countryConfig.taxNumberShort}: ${cv.nuitNumber}`);

    const bannerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: accentHexClean, val: ShadingType.CLEAR },
              margins: { top: 320, bottom: 320, left: 360, right: 360 },
              children: [
                new Paragraph({ children: [new TextRun({ text: cv.fullName || "Nome Completo", bold: true, size: 36, color: "FFFFFF" })] }),
                new Paragraph({ children: [new TextRun({ text: cv.headline || "Título Profissional", size: 24, color: "FFFFFF" })], spacing: { after: 120 } }),
                new Paragraph({ children: [new TextRun({ text: contactParts.join("   •   "), size: 18, color: "F1F5F9" })] }),
              ],
            }),
          ],
        }),
      ],
    });
    children.push(bannerTable);

    if (cv.profile) {
      children.push(new Paragraph({ children: [new TextRun({ text: "RESUMO", bold: true, size: 24, color: accentHexClean })], spacing: { before: 240, after: 80 } }));
      children.push(new Paragraph({ children: [new TextRun({ text: cv.profile, size: 20, color: "334155" })], spacing: { after: 160 } }));
    }

    if (cv.experience && cv.experience.length > 0) {
      children.push(new Paragraph({ children: [new TextRun({ text: "PERCURSO PROFISSIONAL", bold: true, size: 24, color: accentHexClean })], spacing: { before: 160, after: 80 } }));
      for (const exp of cv.experience) {
        children.push(new Paragraph({ children: [new TextRun({ text: exp, size: 20 })], spacing: { after: 120 } }));
      }
    }
  } else {
    // Classic / Minimal
    const countryConfig = getCountryConfig(options.country);
    const contactParts = [cv.email, cv.phone, cv.location, cv.linkedin].filter(Boolean);
    if (cv.biNumber) contactParts.push(`${countryConfig.idDocumentShort}: ${cv.biNumber}`);
    if (cv.nuitNumber) contactParts.push(`${countryConfig.taxNumberShort}: ${cv.nuitNumber}`);

    children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (cv.fullName || "Nome Completo").toUpperCase(), bold: true, size: 36, color: "0F172A" })] }));
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (cv.headline || "Título Profissional").toUpperCase(), bold: true, size: 20, color: accentHexClean })], spacing: { after: 80 } }));
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: contactParts.join("  •  "), size: 18, color: "64748B" })], spacing: { after: 200 } }));

    if (cv.profile) {
      children.push(new Paragraph({ children: [new TextRun({ text: "PERFIL PROFISSIONAL", bold: true, size: 24, color: accentHexClean })], spacing: { before: 200, after: 80 } }));
      children.push(new Paragraph({ children: [new TextRun({ text: cv.profile, size: 20, color: "334155" })], spacing: { after: 160 } }));
    }

    if (cv.experience && cv.experience.length > 0) {
      children.push(new Paragraph({ children: [new TextRun({ text: "EXPERIÊNCIA PROFISSIONAL", bold: true, size: 24, color: accentHexClean })], spacing: { before: 160, after: 80 } }));
      for (const exp of cv.experience) {
        children.push(new Paragraph({ children: [new TextRun({ text: exp, size: 20 })], spacing: { after: 120 } }));
      }
    }

    if (cv.education && cv.education.length > 0) {
      children.push(new Paragraph({ children: [new TextRun({ text: "FORMAÇÃO ACADÉMICA", bold: true, size: 24, color: accentHexClean })], spacing: { before: 160, after: 80 } }));
      for (const edu of cv.education) {
        children.push(new Paragraph({ children: [new TextRun({ text: `• ${edu}`, size: 20 })], spacing: { after: 80 } }));
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `${safeFileName(cv.fullName || title)}-cv.docx`);
  return blob;
}
