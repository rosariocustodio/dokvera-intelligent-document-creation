/**
 * Server-side document generation orchestration.
 *
 * Credit flow (always code-controlled, never AI):
 *   1. cost is recomputed from the spec + saved options
 *   2. credits are debited atomically (`spend_credits`)
 *   3. content is generated
 *   4. on failure the credits are refunded (`refund_credits`) and the
 *      document is marked as "error"
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { getSpec } from "@/lib/document-specs";
import { computeCost } from "@/lib/pricing";
import { formatDate } from "@/lib/dokvera";
import { getCountryConfig } from "@/lib/countries";
import { buildCvMarkdown } from "@/services/cv-builder";
import { buildOutline, outlineToBrief } from "@/services/document-outline";
import { requestCompletion } from "@/services/ai.server";

type AnyClient = SupabaseClient<any, any, any>;

export type DocumentRecord = {
  id: string;
  title: string;
  doc_type: string;
  status: string;
  options: unknown;
  instructions: string | null;
};

const SYSTEM_PROMPT = [
  "És um redactor profissional de elite especializado na elaboração de documentos finais em língua portuguesa (académicos, relatórios, pareceres, monografias, propostas e ensaios), com elevado rigor conceptual, gramatical e estilístico.",
  "Devolves APENAS o documento final em Markdown puro e limpo, pronto a ser processado e exportado diretamente para PDF e DOCX profissionais de nível executivo.",
  "",
  "REGRAS ESTRITAS DE HIERARQUIA E FORMATAÇÃO MARKDOWN (OBRIGATÓRIO):",
  "- TÍTULO PRINCIPAL: Começa o documento OBRIGATORIAMENTE com '# ' e o título oficial do trabalho na primeira linha (apenas um '# ' no documento inteiro).",
  "- SECÇÕES PRINCIPAIS: Cada secção principal DEVE começar OBRIGATORIAMENTE com '## ' seguido do número e título da secção (ex.: '## 1. Introdução', '## 2. Enquadramento Teórico', '## 3. Metodologia', '## 4. Análise e Discussão dos Resultados', '## 5. Considerações Finais', '## Referências Bibliográficas').",
  "- SUBSECÇÕES: Cada subsecção DEVE começar OBRIGATORIAMENTE com '### ' (ex.: '### 1.1. Contextualização e Problematização', '### 1.2. Objetivos da Investigação', '### 3.1. Desenho Metodológico e Amostragem').",
  "- PROIBIDO PSEUDO-TÍTULOS: NUNCA uses linhas em negrito isolado ('**1. Introdução**' ou '**Metodologia:**') como substitutos de cabeçalhos de secção. Todos os títulos de secção e subsecção têm de usar rigorosamente a sintaxe Markdown '## ' ou '### ' para garantir a hierarquia tipográfica no PDF/DOCX.",
  "- ESPAÇAMENTO: Separa SEMPRE cada título, subtítulo, parágrafo, citação em bloco e lista por uma linha em branco limpa.",
  "- LISTAS DE ITENS: Usa SEMPRE o traço com espaço ('- ') no início de cada linha para listas com marcadores (bullets).",
  "- ENUMERAÇÕES ORDENADAS: Usa '1. ', '2. ', '3. ' com espaço após o ponto para sequências ou passos ordenados.",
  "- CITAÇÕES LONGAS: Citações textuais com mais de 3 linhas devem usar o prefixo de citação de bloco '> ' com recuo, seguindo normas de citação académica (ex.: autor, ano, página).",
  "",
  "REGRAS DE CONTEÚDO E QUALIDADE:",
  "- Desenvolve conteúdo substancial, aprofundado, técnico e analítico em cada secção; nunca deixes secções vazias, superficiais ou com marcadores 'lorem ipsum'.",
  "- Nunca uses marcadores de preenchimento como [Nome], [Data], [Empresa]; integra os dados fornecidos no briefing ou redige frases completas e conclusivas.",
  "- Não inventes dados cadastrais ou estatísticas não fundamentadas.",
  "- Em trabalhos académicos e relatórios, respeita a norma de citação indicada (citações autor-data como Silva, 2021) e mantém tom formal, analítico e coerente.",
  "- Em cartas, requerimentos, ofícios e declarações usa a linguagem administrativa correcta, com destinatário, corpo, fórmula de encerramento, local, data e linha de assinatura.",
  "- Não escrevas saudações ao utilizador, comentários metatextuais nem explicações sobre a resposta (ex.: 'Aqui está o documento solicitado:').",
  "- Nunca menciones preços, créditos, IA ou custos.",
  "- Devolve EXCLUSIVAMENTE o texto final do documento em Markdown.",
].join("\n");

const CV_TYPES = ["cv", "simple_cv"];

/** ~330 palavras por página — usado para dimensionar o texto pedido à IA. */
function lengthBrief(outline: { pages: string | null }): string {
  if (!outline.pages) return "Extensão: texto completo e bem desenvolvido, sem enchimento.";
  const match = outline.pages.match(/(\d+)(?!.*\d)/);
  const maxPages = match ? Number(match[1]) : 5;
  const words = Math.max(300, Math.round(maxPages * 330));
  return `Extensão pretendida: ${outline.pages} (aproximadamente ${words} palavras no total, distribuídas pelas secções).`;
}

export async function generateDocument(supabase: AnyClient, documentId: string) {
  const { data: doc, error } = await supabase
    .from("documents")
    .select("id, title, doc_type, status, options, instructions")
    .eq("id", documentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!doc) throw new Error("Documento não encontrado.");

  const record = doc as DocumentRecord;
  if (record.status === "generating") {
    throw new Error("Este documento já está a ser gerado.");
  }

  const { data: authUser } = await supabase.auth.getUser();
  const userId = authUser.user?.id;
  let country: string | null = null;
  if (userId) {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("country")
      .eq("id", userId)
      .maybeSingle();
    country = (profileRow as { country?: string } | null)?.country ?? null;
  }
  const countryConfig = getCountryConfig(country);
  const defaultCity = countryConfig.defaultCity;

  const spec = getSpec(record.doc_type, country);
  if (!spec) throw new Error("Tipo de documento inválido.");

  const outline = buildOutline(record.doc_type, record.title, record.options, record.instructions);
  if (!outline) throw new Error("Não foi possível preparar o documento.");

  const cost = computeCost(spec, outline.values).totalCredits;

  await supabase.from("documents").update({ status: "generating", error_message: null }).eq("id", record.id);

  const { error: spendError } = await supabase.rpc("spend_credits", {
    _document_id: record.id,
    _credits: cost,
    _description: `Geração: ${record.title}`,
  });

  if (spendError) {
    await supabase
      .from("documents")
      .update({ status: "draft", error_message: null })
      .eq("id", record.id);
    throw new Error(
      spendError.message.includes("insufficient")
        ? "Créditos insuficientes para gerar este documento."
        : spendError.message,
    );
  }

  try {
    let content = "";
    const isLocalDoc = [
      "request",
      "formal_req",
      "formal_letter",
      "official_letter",
      "declaration",
      "personal_letter",
      "simple_cv",
      "cv"
    ].includes(record.doc_type);

    if (isLocalDoc) {
      // Local generation by code (No IA)
      const fields = outline.values.fields || {};
      const t = (key: string) => String(fields[key] || "").trim();

      if (record.doc_type === "request" || record.doc_type === "formal_req") {
        content = [
          `# ${record.doc_type === "request" ? "REQUERIMENTO" : "PEDIDO FORMAL"}\n`,
          `**A:** ${t("recipient") || "Exmo. Senhor"}\n`,
          `**Requerente:** ${t("full_name") || record.title}`,
          t("id_document") ? `**${countryConfig.idDocumentReqPrefix}:** ${t("id_document")}` : "",
          `\nExmo. Senhor,\n`,
          `Vem, por este meio, requerer a V. Excia. se digne autorizar a/o:\n`,
          `${t("purpose") || record.title}\n`,
          t("justification") ? `**Fundamentação:**\n${t("justification")}\n` : "",
          `Nestes termos,`,
          `Pede Deferimento.\n`,
          `${t("city") || defaultCity}, ${t("letter_date") ? formatDate(t("letter_date"), country) : formatDate(new Date().toISOString(), country)}\n`,
          `__________________________________________`,
          `(Assinatura do Requerente)\n`,
          t("contact") ? `**Contactos:** ${t("contact")}` : "",
        ].filter(Boolean).join("\n");
      } else if (record.doc_type === "declaration") {
        content = [
          `# DECLARAÇÃO\n`,
          `Eu, **${t("declarant") || record.title}**, ${t("id_document") ? `portador do ${countryConfig.idDocumentLabel} n.º ${t("id_document")},` : ""} declaro para os devidos efeitos que:\n`,
          `${t("purpose") || "o conteúdo declarado é fidedigno e conforme à verdade."}\n`,
          t("beneficiary") ? `A presente declaração é emitida a favor de **${t("beneficiary")}** por ser a pura verdade.\n` : "",
          `${t("city") || defaultCity}, ${t("letter_date") ? formatDate(t("letter_date"), country) : formatDate(new Date().toISOString(), country)}\n`,
          `__________________________________________`,
          `(Assinatura do Declarante)`,
        ].filter(Boolean).join("\n");
      } else if (record.doc_type === "formal_letter" || record.doc_type === "official_letter") {
        content = [
          `# ${record.doc_type === "formal_letter" ? "CARTA FORMAL" : "OFÍCIO"}\n`,
          `**De:** ${t("sender") || record.title}`,
          `**Para:** ${t("recipient") || "Exmo. Senhor"}`,
          `**Assunto:** ${t("reference") || "Comunicação Oficial"}\n`,
          `Prezado(a) Senhor(a),\n`,
          `${t("purpose") || "Vimos por este meio comunicar que os procedimentos foram concluídos."}\n`,
          `Sem mais de momento, apresentamos os nossos melhores cumprimentos.\n`,
          `Atentamente,\n`,
          `${t("sender") || record.title}\n`,
          `${t("city") || defaultCity}, ${t("letter_date") ? formatDate(t("letter_date"), country) : formatDate(new Date().toISOString(), country)}`,
        ].filter(Boolean).join("\n");
      } else if (record.doc_type === "personal_letter") {
        content = [
          `# CARTA PESSOAL\n`,
          `Querido(a) ${t("recipient") || "Amigo"},\n`,
          `Escrevo esta carta para:\n`,
          `${t("purpose") || "partilhar novidades e enviar os meus melhores cumprimentos."}\n`,
          `Com muito carinho e amizade,\n`,
          `${t("sender") || "Atentamente"}\n`,
          `${t("city") || defaultCity}, ${t("letter_date") ? formatDate(t("letter_date"), country) : formatDate(new Date().toISOString(), country)}`,
        ].filter(Boolean).join("\n");
      } else if (record.doc_type === "simple_cv" || record.doc_type === "cv") {
        content = buildCvMarkdown(outline, country);
      }
    } else {
      // IA generation
      content = await requestCompletion({
        system: SYSTEM_PROMPT,
        user: outlineToBrief(outline),
      });
    }

    await supabase
      .from("documents")
      .update({
        content,
        status: "ready",
        credits_spent: cost,
        estimated_cost: cost,
        error_message: null,
      })
      .eq("id", record.id);

    await supabase.from("document_events").insert({
      document_id: record.id,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      event: "generated",
      detail: { credits: cost, sections: outline.sections.length },
    });

    return { status: "ready" as const, credits: cost };
  } catch (generationError) {
    const message =
      generationError instanceof Error ? generationError.message : "Erro desconhecido na geração.";

    await supabase.rpc("refund_credits", {
      _document_id: record.id,
      _credits: cost,
      _description: `Devolução por falha: ${record.title}`,
    });

    await supabase
      .from("documents")
      .update({ status: "error", error_message: message })
      .eq("id", record.id);

    await supabase.from("document_events").insert({
      document_id: record.id,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      event: "generation_failed",
      detail: { message },
    });

    throw new Error(message);
  }
}