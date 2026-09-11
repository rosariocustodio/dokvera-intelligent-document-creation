import fs from "node:fs";
import path from "node:path";
import { parseContent, exportToPdf, exportToDocx } from "../services/export.ts";

console.log("=================================================================");
console.log("TESTE DE ROBUSTEZ DO EXPORTADOR DE DOCUMENTOS ACADÉMICOS (PDF/DOCX)");
console.log("=================================================================\n");

// 1. Amostra representativa de um documento académico real gerado por IA
// com vários desvios comuns de formatação (negrito isolado, sem #, listas unicode, citações)
const academicDocumentContent = `
# O IMPACTO DA INTELIGÊNCIA ARTIFICIAL NO ENSINO SUPERIOR EM MOÇAMBIQUE

## 1. Introdução
O advento da inteligência artificial generativa tem provocado transformações profundas nos ecossistemas educacionais contemporâneos, redefinindo as fronteiras da pedagogia tradicional e da produção científica.

**1.1. Contextualização e Problematização**
No contexto das instituições de ensino superior em Moçambique, a adoção destas ferramentas coloca desafios estruturais prementes relativos à equidade de acesso e à integridade académica.

**2. Enquadramento Teórico**
A literatura recente sobre transformação digital aponta que a tecnologia não atua em vácuo, mas como catalisador de mudanças sociotécnicas complexas no ambiente universitário.

**2.1. Conceitos Fundamentais e Dimensões de Análise:**
Para compreender o fenómeno, é mister categorizar os domínios de aplicação pedagógica em três pilares essenciais:
• Mediação algorítmica na tutoria personalizada;
• Automação de processos de revisão bibliográfica;
• Avaliação formativa assistida por modelos generativos de linguagem.

3. Metodologia de Investigação
Esta pesquisa orientou-se por um desenho misto de natureza descritiva e exploratória, combinando levantamento quantitativo e entrevistas semiestruturadas com docentes.

3.1 População e Amostragem
A amostra por conveniência integrou 120 participantes distribuídos pelas faculdades de Ciências e de Letras.

IV. RESULTADOS E DISCUSSÃO
Os dados recolhidos evidenciam que 78% dos estudantes inquiridos já utilizam assistentes de escrita em regime semanal para elaboração de resumos e tarefas de programação.

> "A apropriação crítica das tecnologias digitais pelos estudantes universitários deve ser acompanhada por diretrizes institucionais claras, sob pena de acentuar disparidades formativas existentes." (Matusse & Cossa, 2023, p. 89)

As etapas sequenciais da análise estatística seguiram rigorosamente o seguinte protocolo:
1. Limpeza e normalização da base de dados no SPSS.
2. Análise fatorial confirmatória para validação das escalas.
3. Testes de hipóteses via regressão linear múltipla.

**Nota metodológica:** Todos os coeficientes foram aferidos a um nível de significância estatística de p < 0.05.

CONSIDERAÇÕES FINAIS
Conclui-se que o potencial transformador da inteligência artificial no ensino superior moçambicano é inegável, requerendo contudo políticas públicas ativas de literacia digital e inovação curricular.

## Referências Bibliográficas
- Matusse, E., & Cossa, J. (2023). Tecnologias Emergentes no Ensino Superior Africano. Maputo: Imprensa Universitária.
- Santos, M. (2021). Metodologia da Investigação Científica aplicada às Ciências Sociais. Lisboa: Editora Escolar.
- UNESCO (2022). Artificial Intelligence and Education: Guidance for Policy-makers. Paris: UNESCO Publishing.
`;

console.log("1. Analisando blocos parseados com o novo parser tolerante:");
const blocks = parseContent(academicDocumentContent);

// Testar deteções específicas
const tests: { label: string; condition: boolean; detail?: string }[] = [];

// A. Título principal #
const h1Block = blocks.find((b) => b.type === "h1");
tests.push({
  label: "A. Título principal (#) detectado como H1",
  condition: Boolean(h1Block && h1Block.text.includes("IMPACTO DA INTELIGÊNCIA")),
  detail: h1Block?.text,
});

// B. Secção padrão ## 1. Introdução
const h2Intro = blocks.find((b) => b.type === "h2" && b.text.includes("1. Introdução"));
tests.push({
  label: "B. Secção padrão (## 1. Introdução) detectada como H2",
  condition: Boolean(h2Intro),
  detail: h2Intro?.text,
});

// C. Desvio IA: **1.1. Contextualização...** (Negrito isolado com número)
const h3Sub1 = blocks.find((b) => b.type === "h3" && b.text.includes("1.1. Contextualização"));
tests.push({
  label: "C. Desvio IA: Negrito isolado (**1.1. Contextualização**) detectado como H3",
  condition: Boolean(h3Sub1),
  detail: h3Sub1?.text,
});

// D. Desvio IA: **2. Enquadramento Teórico** (Negrito isolado como H2)
const h2Teor = blocks.find((b) => b.type === "h2" && b.text.includes("2. Enquadramento Teórico"));
tests.push({
  label: "D. Desvio IA: Negrito isolado (**2. Enquadramento Teórico**) detectado como H2",
  condition: Boolean(h2Teor),
  detail: h2Teor?.text,
});

// E. Desvio IA: **2.1. Conceitos...:** (Negrito isolado com dois pontos finais)
const h3Sub2 = blocks.find((b) => b.type === "h3" && b.text.includes("2.1. Conceitos Fundamentais"));
tests.push({
  label: "E. Desvio IA: Negrito com dois pontos (**2.1. Conceitos...:**) detectado como H3",
  condition: Boolean(h3Sub2),
  detail: h3Sub2?.text,
});

// F. Desvio IA: 3. Metodologia de Investigação (Linha numerada sem '#' nem negrito)
const h2Metod = blocks.find((b) => b.type === "h2" && b.text.includes("3. Metodologia de Investigação"));
tests.push({
  label: "F. Desvio IA: Linha numerada pura ('3. Metodologia de Investigação') detectada como H2",
  condition: Boolean(h2Metod),
  detail: h2Metod?.text,
});

// G. Desvio IA: 3.1 População e Amostragem (Subnumeração pura sem '#')
const h3Amostr = blocks.find((b) => b.type === "h3" && b.text.includes("3.1 População e Amostragem"));
tests.push({
  label: "G. Desvio IA: Subnumeração pura ('3.1 População e Amostragem') detectada como H3",
  condition: Boolean(h3Amostr),
  detail: h3Amostr?.text,
});

// H. Desvio IA: Roman Numeral 'IV. RESULTADOS E DISCUSSÃO'
const h2Roman = blocks.find((b) => b.type === "h2" && b.text.includes("IV. RESULTADOS E DISCUSSÃO"));
tests.push({
  label: "H. Desvio IA: Numeração romana ('IV. RESULTADOS E DISCUSSÃO') detectada como H2",
  condition: Boolean(h2Roman),
  detail: h2Roman?.text,
});

// I. Desvio IA: All-Caps 'CONSIDERAÇÕES FINAIS'
const h2AllCaps = blocks.find((b) => b.type === "h2" && b.text.includes("CONSIDERAÇÕES FINAIS"));
tests.push({
  label: "I. Desvio IA: Cabeçalho em maiúsculas ('CONSIDERAÇÕES FINAIS') detectado como H2",
  condition: Boolean(h2AllCaps),
  detail: h2AllCaps?.text,
});

// J. Citação acadêmica de bloco '> "..."'
const quoteBlock = blocks.find((b) => b.type === "quote");
tests.push({
  label: "J. Citação em bloco (> \"...\") detectada como Quote",
  condition: Boolean(quoteBlock && quoteBlock.text.includes("apropriação crítica")),
  detail: quoteBlock?.text?.slice(0, 50) + "...",
});

// K. Marcador unicode '• '
const bulletBlock = blocks.find((b) => b.type === "bullet" && b.text.includes("Mediação algorítmica"));
tests.push({
  label: "K. Marcador Unicode ('• Mediação...') detectado como Bullet",
  condition: Boolean(bulletBlock),
  detail: bulletBlock?.text,
});

// L. Lista sequencial numerada (1. Limpeza..., 2. Análise...)
const numBlock1 = blocks.find((b) => b.type === "number" && b.text.includes("Limpeza e normalização"));
const numBlock2 = blocks.find((b) => b.type === "number" && b.text.includes("Análise fatorial"));
tests.push({
  label: "L. Lista ordenada numerada (1., 2.) mantida como lista 'number' (não título)",
  condition: Boolean(numBlock1 && numBlock2 && numBlock1.type === "number"),
  detail: `Prefixo: "${numBlock1 && "prefix" in numBlock1 ? (numBlock1 as any).prefix : ""}"`,
});

// M. Parágrafo com negrito inline no início ('**Nota metodológica:** Todos os coeficientes...')
const pNota = blocks.find((b) => b.type === "p" && b.text.includes("Nota metodológica: Todos os coeficientes"));
tests.push({
  label: "M. Parágrafo com negrito inline inicial mantido como parágrafo (não título)",
  condition: Boolean(pNota),
  detail: pNota?.text?.slice(0, 60) + "...",
});

for (const t of tests) {
  const status = t.condition ? "PASSOU [✓]" : "FALHOU  [✗]";
  console.log(`  ${status} - ${t.label}`);
  if (t.detail) console.log(`              -> ${t.detail}`);
  if (!t.condition) {
    throw new Error(`Falha no teste: ${t.label}`);
  }
}

// 2. Exportação Real para PDF e salvamento em arquivo de teste
console.log("\n2. Gerando PDF de documento académico completo:");
const testOutputDir = path.resolve("./test_output");
if (!fs.existsSync(testOutputDir)) {
  fs.mkdirSync(testOutputDir, { recursive: true });
}

const pdfDoc = exportToPdf(
  "Trabalho Académico - Inteligência Artificial no Ensino Superior",
  academicDocumentContent,
  {
    country: "MZ",
    docType: "academic_work",
    footer: "Dokvera • Monografia Científica",
  },
  true
);

const pdfBuffer = Buffer.from(pdfDoc.output("arraybuffer"));
const pdfFilePath = path.join(testOutputDir, "academic_test_document.pdf");
fs.writeFileSync(pdfFilePath, pdfBuffer);
console.log(`[✓] PDF Académico gerado com sucesso: ${pdfFilePath} (${pdfBuffer.length} bytes)`);

// 3. Exportação Real para Word DOCX e salvamento
console.log("\n3. Gerando DOCX de documento académico completo:");
const docxBlob = await exportToDocx(
  "Trabalho Académico - Inteligência Artificial no Ensino Superior",
  academicDocumentContent,
  {
    country: "MZ",
    docType: "academic_work",
    footer: "Dokvera • Monografia Científica",
  }
);

const docxBuffer = Buffer.from(await docxBlob.arrayBuffer());
const docxFilePath = path.join(testOutputDir, "academic_test_document.docx");
fs.writeFileSync(docxFilePath, docxBuffer);
console.log(`[✓] DOCX Académico gerado com sucesso: ${docxFilePath} (${docxBuffer.length} bytes)`);

console.log("\n=================================================================");
console.log(">>> TODOS OS 13 TESTES DE ROBUSTEZ ACADÉMICA PASSARAM COM SUCESSO!");
console.log("=================================================================");
