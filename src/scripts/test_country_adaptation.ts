import { getCountryConfig, listCountries, type CountryCode } from "../lib/countries.ts";
import { getSpec } from "../lib/document-specs.ts";
import { buildCvMarkdown } from "../services/cv-builder.ts";
import { exportCvToPdf, exportToPdf, exportToDocx } from "../services/export.ts";

console.log("=================================================================");
console.log("TESTE DE ADAPTAÇÃO DE PAÍSES (MZ, AO, PT) - DOKVERA");
console.log("=================================================================\n");

const countries: CountryCode[] = ["MZ", "AO", "PT"];

// 1. Validar COUNTRY_CONFIG
console.log("1. Verificando COUNTRY_CONFIG para cada país:");
for (const code of countries) {
  const cfg = getCountryConfig(code);
  console.log(`[${code}] ${cfg.name}:`);
  console.log(`     Doc Identificação: "${cfg.idDocumentLabel}" (Curto: "${cfg.idDocumentShort}", Placeholder: "${cfg.idDocumentPlaceholder}", Requerimento: "${cfg.idDocumentReqPrefix}")`);
  console.log(`     Número Fiscal:     "${cfg.taxNumberLabel}" (Curto: "${cfg.taxNumberShort}", Placeholder: "${cfg.taxNumberPlaceholder}")`);
}

// 2. Validar Formulário (document-specs) para CV e Requerimento
console.log("\n2. Verificando getSpec() localizado dinamicamente:");
for (const code of countries) {
  const cvSpec = getSpec("cv", code)!;
  const reqSpec = getSpec("request", code)!;

  const biField = cvSpec.groups[0].fields.find((f) => f.id === "bi_number")!;
  const nuitField = cvSpec.groups[0].fields.find((f) => f.id === "nuit_number")!;
  const reqIdField = reqSpec.groups[0].fields.find((f) => f.id === "id_document")!;

  console.log(`[${code}] Formulário CV:`);
  console.log(`     Campo bi_number   => label: "${biField.label}", placeholder: "${biField.placeholder}"`);
  console.log(`     Campo nuit_number => label: "${nuitField.label}", placeholder: "${nuitField.placeholder}"`);
  console.log(`[${code}] Formulário Requerimento:`);
  console.log(`     Campo id_document => placeholder: "${reqIdField.placeholder}"`);

  if (code === "PT") {
    if (biField.label !== "Cartão de Cidadão" || nuitField.label !== "Número de Identificação Fiscal (NIF)") {
      throw new Error(`Falha de validação para PT em document-specs`);
    }
  } else if (code === "AO") {
    if (biField.label !== "Bilhete de Identidade (BI)" || nuitField.label !== "Número de Identificação Fiscal (NIF)") {
      throw new Error(`Falha de validação para AO em document-specs`);
    }
  } else if (code === "MZ") {
    if (biField.label !== "Bilhete de Identidade (BI)" || nuitField.label !== "Número de NUIT") {
      throw new Error(`Falha de validação para MZ em document-specs`);
    }
  }
}

// 3. Validar cv-builder (buildCvMarkdown)
console.log("\n3. Verificando buildCvMarkdown() para cada país:");
const sampleOutline: any = {
  title: "João Silva",
  values: {
    structure: ["profile", "experience"],
    fields: {
      full_name: "João Silva",
      headline: "Arquiteto de Soluções",
      email: "joao.silva@example.com",
      phone: "+351 912 345 678",
      bi_number: "12345678-9",
      nuit_number: "987654321",
      profile: "Profissional dedicado com foco em engenharia de sistemas.",
      experience: ["Tech Corp — Lead Engineer — 2020-2024"],
    },
  },
};

for (const code of countries) {
  const md = buildCvMarkdown(sampleOutline, code);
  const cfg = getCountryConfig(code);
  const hasId = md.includes(`- ${cfg.idDocumentShort}: 12345678-9`);
  const hasTax = md.includes(`- ${cfg.taxNumberShort}: 987654321`);

  console.log(`[${code}] CV Markdown:`);
  console.log(`     Contém "${cfg.idDocumentShort}: 12345678-9": ${hasId ? "SIM" : "NÃO"}`);
  console.log(`     Contém "${cfg.taxNumberShort}: 987654321": ${hasTax ? "SIM" : "NÃO"}`);

  if (!hasId || !hasTax) {
    throw new Error(`Falha no cv-builder para país ${code}`);
  }
}

// 4. Validar geração de documentos por código (Requerimento, Declaração, Simple CV)
console.log("\n4. Verificando textos gerados por código (Requerimento, Declaração, Simple CV):");
for (const code of countries) {
  const cfg = getCountryConfig(code);

  // Simular Requerimento
  const reqIdText = `**${cfg.idDocumentReqPrefix}:** 123456789`;
  // Simular Declaração
  const declText = `portador do ${cfg.idDocumentLabel} n.º 123456789`;
  // Simular Simple CV
  const simpleCvId = `- ${cfg.idDocumentShort}: 123456789`;
  const simpleCvTax = `- ${cfg.taxNumberShort}: 987654321`;

  console.log(`[${code}] Requerimento: "${reqIdText}"`);
  console.log(`[${code}] Declaração:   "${declText}"`);
  console.log(`[${code}] Simple CV:     "${simpleCvId}", "${simpleCvTax}"`);
}

// 5. Validar Exportação PDF (exportCvToPdf e exportToPdf) com rótulos corretos
console.log("\n5. Verificando exportação de PDF (todos os templates) com opções de país:");
for (const code of countries) {
  const cfg = getCountryConfig(code);

  for (const template of ["modern", "classic", "minimal", "bold"] as const) {
    const pdfDoc = exportCvToPdf("CV Teste", "", {
      docType: "cv",
      templateId: template,
      country: code,
      fields: {
        fullName: "Candidato Teste",
        bi_number: "ID-12345",
        nuit_number: "TAX-67890",
      },
    }, true);

    const internalPagesStr = JSON.stringify((pdfDoc as any).internal.pages);
    const hasIdInPdf = internalPagesStr.includes(cfg.idDocumentShort);
    const hasTaxInPdf = internalPagesStr.includes(cfg.taxNumberShort);

    console.log(`[${code}] PDF ${template.toUpperCase()}:`);
    console.log(`     Contém "${cfg.idDocumentShort}": ${hasIdInPdf ? "SIM" : "NÃO"}`);
    console.log(`     Contém "${cfg.taxNumberShort}": ${hasTaxInPdf ? "SIM" : "NÃO"}`);

    if (!hasIdInPdf || !hasTaxInPdf) {
      throw new Error(`Falha no exportador PDF (${template}) para país ${code}`);
    }
  }
}

// 6. Validar Cabeçalho Oficial nos Documentos Padrão (exportToPdf)
console.log("\n6. Verificando cabeçalho oficial nos Documentos Padrão (exportToPdf):");
const expectedHeaders: Record<CountryCode, string> = {
  MZ: "REPÚBLICA DE MOÇAMBIQUE",
  AO: "REPÚBLICA DE ANGOLA",
  PT: "REPÚBLICA PORTUGUESA",
};

for (const code of countries) {
  const expectedHeader = expectedHeaders[code];
  const stdPdf = exportToPdf(
    "Requerimento Oficial",
    "Exmo. Senhor Diretor,\n\nVenho por este meio requerer...",
    { country: code, docType: "request" },
    true
  );

  const internalPagesStr = JSON.stringify((stdPdf as any).internal.pages);
  const hasRepublic = internalPagesStr.includes(expectedHeader);

  console.log(`[${code}] Documento Padrão:`);
  console.log(`     Contém "${expectedHeader}": ${hasRepublic ? "SIM" : "NÃO"}`);

  if (!hasRepublic) {
    throw new Error(`Cabeçalho oficial "${expectedHeader}" não encontrado para ${code}`);
  }
}

// 7. Validar Exportação DOCX (exportToDocx) para cada país e template
console.log("\n7. Verificando exportação DOCX para todos os países e templates:");
for (const code of countries) {
  for (const template of ["modern", "classic", "minimal", "bold"] as const) {
    const docxBlob = await exportToDocx(
      "CV Teste",
      "",
      {
        docType: "cv",
        templateId: template,
        country: code,
        fields: {
          fullName: "Candidato Teste",
          bi_number: "ID-12345",
          nuit_number: "TAX-67890",
        },
      }
    );

    const size = docxBlob.size;
    console.log(`[${code}] DOCX ${template.toUpperCase()} gerado com sucesso (${size} bytes)`);

    if (size < 1000) {
      throw new Error(`DOCX gerado está vazio ou anormalmente pequeno para ${code}/${template}`);
    }
  }
}

console.log("\n=================================================================");
console.log(">>> TODOS OS TESTES DE ADAPTAÇÃO POR PAÍS PASSARAM COM SUCESSO!");
console.log("=================================================================");
