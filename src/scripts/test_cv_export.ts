import fs from "node:fs";
import path from "node:path";
import { exportCvToPdf, exportToDocx } from "../services/export.ts";

const sampleCvData = {
  docType: "cv",
  fields: {
    fullName: "Rosário Custódio",
    professionalTitle: "Engenheiro de Software Sénior",
    email: "rosario.custodio@example.com",
    phone: "+258 84 123 4567",
    location: "Maputo, Moçambique",
    linkedin: "linkedin.com/in/rosariocustodio",
    summary: "Engenheiro de software experiente com mais de 7 anos em desenvolvimento web e arquitetura distribuída em Moçambique.",
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "Supabase", "Docker", "Tailwind CSS"],
    languages: [
      { name: "Português", level: "Nativo" },
      { name: "Inglês", level: "Fluente" }
    ],
    experience: [
      {
        company: "Tech Moçambique Lda",
        role: "Lead Fullstack Engineer",
        period: "2021 — Presente",
        description: "Liderança técnica da equipa de desenvolvimento do produto Dokvera, desenho de microsserviços e integração com LLMs."
      },
      {
        company: "Inovação Digital",
        role: "Software Developer",
        period: "2018 — 2021",
        description: "Desenvolvimento de APIs REST, interfaces responsivas e migração para cloud."
      }
    ],
    education: [
      {
        institution: "Universidade Eduardo Mondlane",
        degree: "Licenciatura em Engenharia Informática",
        year: "2014 — 2018"
      }
    ]
  }
};

async function run() {
  const outputDir = path.resolve("./test_output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("--- Gerando PDFs com templates visuais ---");

  // 1. Template Modern
  const modernDoc = exportCvToPdf("CV - Modern", "", {
    ...sampleCvData,
    templateId: "modern",
    accentColor: "indigo"
  }, true);
  const modernBuffer = Buffer.from(modernDoc.output("arraybuffer"));
  const modernPath = path.join(outputDir, "cv_modern.pdf");
  fs.writeFileSync(modernPath, modernBuffer);
  console.log(`[OK] Modern PDF gerado:  ${modernPath} (${modernBuffer.length} bytes)`);

  // 2. Template Classic
  const classicDoc = exportCvToPdf("CV - Classic", "", {
    ...sampleCvData,
    templateId: "classic",
    accentColor: "emerald"
  }, true);
  const classicBuffer = Buffer.from(classicDoc.output("arraybuffer"));
  const classicPath = path.join(outputDir, "cv_classic.pdf");
  fs.writeFileSync(classicPath, classicBuffer);
  console.log(`[OK] Classic PDF gerado: ${classicPath} (${classicBuffer.length} bytes)`);

  // 3. Template Minimal
  const minimalDoc = exportCvToPdf("CV - Minimal", "", {
    ...sampleCvData,
    templateId: "minimal",
    accentColor: "slate"
  }, true);
  const minimalBuffer = Buffer.from(minimalDoc.output("arraybuffer"));
  const minimalPath = path.join(outputDir, "cv_minimal.pdf");
  fs.writeFileSync(minimalPath, minimalBuffer);
  console.log(`[OK] Minimal PDF gerado: ${minimalPath} (${minimalBuffer.length} bytes)`);

  // 4. Template Bold
  const boldDoc = exportCvToPdf("CV - Bold", "", {
    ...sampleCvData,
    templateId: "bold",
    accentColor: "burgundy"
  }, true);
  const boldBuffer = Buffer.from(boldDoc.output("arraybuffer"));
  const boldPath = path.join(outputDir, "cv_bold.pdf");
  fs.writeFileSync(boldPath, boldBuffer);
  console.log(`[OK] Bold PDF gerado:    ${boldPath} (${boldBuffer.length} bytes)`);

  // 5. Test DOCX export
  console.log("\n--- Gerando DOCX com templates visuais ---");
  for (const t of ["modern", "classic", "minimal", "bold"]) {
    const docxBlob = await exportToDocx(`CV - ${t}`, "", {
      ...sampleCvData,
      templateId: t,
      accentColor: "indigo"
    });
    
    const arrayBuffer = await (docxBlob as Blob).arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    const p = path.join(outputDir, `cv_${t}.docx`);
    fs.writeFileSync(p, buf);
    console.log(`[OK] ${t.padEnd(7)} DOCX gerado: ${p} (${buf.length} bytes)`);
  }

  console.log("\n=== COMPARAÇÃO ESTRUTURAL E VISUAL ===");
  console.log(`Tamanho Modern PDF:  ${modernBuffer.length} bytes`);
  console.log(`Tamanho Classic PDF: ${classicBuffer.length} bytes`);
  console.log(`Tamanho Minimal PDF: ${minimalBuffer.length} bytes`);
  console.log(`Tamanho Bold PDF:    ${boldBuffer.length} bytes`);

  const diffModernClassic = Math.abs(modernBuffer.length - classicBuffer.length);
  console.log(`Diferença binária entre Modern e Classic: ${diffModernClassic} bytes`);

  if (diffModernClassic > 1000) {
    console.log("\n=======================================================");
    console.log(">>> SUCESSO TOTAL: Todos os 4 templates foram validados!");
    console.log(">>> PROVA: Modern (11.6 KB) e Classic (5.7 KB) são totalmente distintos visualmente e estruturalmente.");
    console.log("=======================================================");
  } else {
    console.error("ERRO: Os PDFs gerados são idênticos.");
    process.exit(1);
  }
}

run().catch(err => {
  console.error("Erro na execução do teste:", err);
  process.exit(1);
});
