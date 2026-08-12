/**
 * Real client-side export of a finished document to PDF and DOCX.
 * No server round-trip and no external API — the content stored in the
 * database is converted directly in the browser.
 */

import { jsPDF } from "jspdf";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

export type Block =
  | { type: "h1" | "h2" | "h3" | "p"; text: string }
  | { type: "bullet" | "number"; text: string };

const BOLD = /\*\*(.+?)\*\*/g;
const ITALIC = /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g;

function clean(line: string): string {
  return line.replace(BOLD, "$1").replace(ITALIC, "$1").replace(/`/g, "").trim();
}

/** Parses the stored Markdown into a flat list of typed blocks. */
export function parseContent(content: string): Block[] {
  const blocks: Block[] = [];
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^###\s+/.test(line)) blocks.push({ type: "h3", text: clean(line.replace(/^###\s+/, "")) });
    else if (/^##\s+/.test(line)) blocks.push({ type: "h2", text: clean(line.replace(/^##\s+/, "")) });
    else if (/^#\s+/.test(line)) blocks.push({ type: "h1", text: clean(line.replace(/^#\s+/, "")) });
    else if (/^[-*]\s+/.test(line)) blocks.push({ type: "bullet", text: clean(line.replace(/^[-*]\s+/, "")) });
    else if (/^\d+[.)]\s+/.test(line)) blocks.push({ type: "number", text: clean(line.replace(/^\d+[.)]\s+/, "")) });
    else if (/^(\*\*\*|---|___)$/.test(line)) continue;
    else blocks.push({ type: "p", text: clean(line) });
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
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportToPdf(title: string, content: string, footer = "Dokvera by Ruqzora") {
  const blocks = parseContent(content);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 56;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const addFooter = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text(footer, margin, pageHeight - 28);
    doc.setTextColor(20);
  };

  const ensureSpace = (needed: number) => {
    if (y + needed <= pageHeight - margin) return;
    addFooter();
    doc.addPage();
    y = margin;
  };

  const write = (
    text: string,
    { size, style, spacingBefore, spacingAfter, indent = 0 }:
      { size: number; style: "normal" | "bold"; spacingBefore: number; spacingAfter: number; indent?: number },
  ) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, maxWidth - indent) as string[];
    const lineHeight = size * 1.45;
    ensureSpace(spacingBefore + lines.length * lineHeight);
    y += spacingBefore;
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, margin + indent, y);
      y += lineHeight;
    }
    y += spacingAfter;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  const titleLines = doc.splitTextToSize(title, maxWidth) as string[];
  for (const line of titleLines) {
    doc.text(line, margin, y);
    y += 26;
  }
  y += 10;

  for (const block of blocks) {
    if (block.type === "h1") write(block.text, { size: 16, style: "bold", spacingBefore: 14, spacingAfter: 6 });
    else if (block.type === "h2") write(block.text, { size: 14, style: "bold", spacingBefore: 12, spacingAfter: 5 });
    else if (block.type === "h3") write(block.text, { size: 12, style: "bold", spacingBefore: 10, spacingAfter: 4 });
    else if (block.type === "bullet")
      write(`•  ${block.text}`, { size: 11, style: "normal", spacingBefore: 0, spacingAfter: 3, indent: 14 });
    else if (block.type === "number")
      write(`—  ${block.text}`, { size: 11, style: "normal", spacingBefore: 0, spacingAfter: 3, indent: 14 });
    else write(block.text, { size: 11, style: "normal", spacingBefore: 0, spacingAfter: 8 });
  }

  addFooter();
  doc.save(`${safeFileName(title)}.pdf`);
}

export async function exportToDocx(title: string, content: string, footer = "Dokvera by Ruqzora") {
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
}
