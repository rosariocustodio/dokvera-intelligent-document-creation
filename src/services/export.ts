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

export function exportToPdf(title: string, content: string, footer = "Dokvera — Documentação Inteligente") {
  const blocks = parseContent(content);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 56;
  const maxWidth = pageWidth - margin * 2;
  
  // Cores corporativas elegantes (Executivo/Profissional)
  const COLOR_PRIMARY = [27, 54, 93];    // #1B365D - Azul Escuro Executivo
  const COLOR_SECONDARY = [44, 82, 130];  // #2C5282 - Azul Corporativo Médio
  const COLOR_TEXT = [45, 55, 72];       // #2D3748 - Cinza Escuro Suave (Texto Principal)
  const COLOR_GOLD = [197, 160, 89];     // #C5A059 - Dourado Moçambicano (Timbre/Linhas)
  const COLOR_MUTED = [113, 128, 150];   // #718096 - Cinza Muted

  // Desenhando o papel timbrado profissional (Timbre) na primeira página
  const drawLetterhead = () => {
    // Linhas decorativas elegantes no topo
    doc.setDrawColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.setLineWidth(3);
    doc.line(margin, 40, pageWidth - margin, 40);

    doc.setDrawColor(COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2]);
    doc.setLineWidth(1);
    doc.line(margin, 46, pageWidth - margin, 46);

    // Texto do Timbre Corporativo / Oficial Moçambicano
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.text("REPÚBLICA DE MOÇAMBIQUE", pageWidth / 2, 64, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
    doc.text("DOKVERA • SERVIÇO DE ELABORAÇÃO DOCUMENTAL INTELIGENTE", pageWidth / 2, 76, { align: "center" });
    
    // Pequeno brasão geométrico estilizado no centro superior
    doc.setDrawColor(COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2]);
    doc.setLineWidth(1);
    doc.circle(pageWidth / 2, 94, 6);
    doc.line(pageWidth / 2 - 12, 94, pageWidth / 2 + 12, 94);

    // Linha inferior de separação do cabeçalho
    doc.setDrawColor(226, 232, 240); // Gray 200
    doc.setLineWidth(1);
    doc.line(margin, 110, pageWidth - margin, 110);
  };

  // Primeira página recebe o timbre e começa o conteúdo mais abaixo
  drawLetterhead();
  let y = 140;

  const ensureSpace = (needed: number) => {
    // Se o espaço não for suficiente, quebra de página
    if (y + needed <= pageHeight - margin - 20) return;
    doc.addPage();
    // Nas páginas subsequentes, a margem superior começa normal
    y = margin + 10;
  };

  const write = (
    text: string,
    { size, style, color, spacingBefore, spacingAfter, indent = 0 }:
      { size: number; style: "normal" | "bold" | "italic"; color: number[]; spacingBefore: number; spacingAfter: number; indent?: number },
  ) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    
    const lines = doc.splitTextToSize(text, maxWidth - indent) as string[];
    const lineHeight = size * 1.5; // Espaçamento de linha profissional de 1.5
    
    ensureSpace(spacingBefore + lines.length * lineHeight);
    y += spacingBefore;
    
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, margin + indent, y);
      y += lineHeight;
    }
    y += spacingAfter;
  };

  // Escrever o Título do Documento com destaque executivo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  const titleLines = doc.splitTextToSize(title.toUpperCase(), maxWidth) as string[];
  
  for (const line of titleLines) {
    ensureSpace(28);
    doc.text(line, margin, y);
    y += 28;
  }
  y += 12;

  // Renderizar o conteúdo de forma esteticamente rica
  for (const block of blocks) {
    if (block.type === "h1") {
      // Título principal: azul escuro proeminente com espaço de segurança extra para evitar títulos órfãos
      write(block.text, { size: 15, style: "bold", color: COLOR_PRIMARY, spacingBefore: 18, spacingAfter: 8 });
      // Linha de sublinhado decorativo abaixo do H1
      ensureSpace(4);
      doc.setDrawColor(COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2]);
      doc.setLineWidth(1.5);
      doc.line(margin, y - 4, margin + 80, y - 4);
      y += 6;
    } else if (block.type === "h2") {
      write(block.text, { size: 13, style: "bold", color: COLOR_SECONDARY, spacingBefore: 14, spacingAfter: 6 });
    } else if (block.type === "h3") {
      write(block.text, { size: 11, style: "bold", color: COLOR_TEXT, spacingBefore: 12, spacingAfter: 5 });
    } else if (block.type === "bullet") {
      // Marcador redondo dourado e recuo elegante
      doc.setFillColor(COLOR_GOLD[0], COLOR_GOLD[1], COLOR_GOLD[2]);
      doc.circle(margin + 6, y + 5, 2.5, "F");
      write(block.text, { size: 10.5, style: "normal", color: COLOR_TEXT, spacingBefore: 0, spacingAfter: 4, indent: 18 });
    } else if (block.type === "number") {
      // Marcador de numeração estilizado com cor primária
      write(block.text, { size: 10.5, style: "normal", color: COLOR_TEXT, spacingBefore: 0, spacingAfter: 4, indent: 18 });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
      doc.text("—", margin, y - 4); // Traço elegante à esquerda
    } else {
      // Parágrafo com cor suave e excelente legibilidade
      write(block.text, { size: 10.5, style: "normal", color: COLOR_TEXT, spacingBefore: 0, spacingAfter: 9 });
    }
  }

  // --- PASSAGEM 2: Renderização de Cabeçalhos Simples, Rodapés e Numeração Dinâmica ---
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Nas páginas subsequentes (2, 3...), desenhamos um cabeçalho mais simples para poupar espaço
    if (i > 1) {
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1);
      doc.line(margin, 35, pageWidth - margin, 35);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
      doc.text(title.toUpperCase(), margin, 28);
    }

    // Linha de rodapé decorativa em todas as páginas
    doc.setDrawColor(226, 232, 240); // Gray 200
    doc.setLineWidth(1);
    doc.line(margin, pageHeight - 45, pageWidth - margin, pageHeight - 45);

    // Rodapé de marca à esquerda
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(COLOR_MUTED[0], COLOR_MUTED[1], COLOR_MUTED[2]);
    doc.text(footer, margin, pageHeight - 32);

    // Numeração dinâmica "Página X de Y" à direita
    const pageNumText = `Página ${i} de ${totalPages}`;
    const textWidth = doc.getTextWidth(pageNumText);
    doc.text(pageNumText, pageWidth - margin - textWidth, pageHeight - 32);
  }

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
