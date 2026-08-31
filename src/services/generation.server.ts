``/**
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
  "És um redactor profissional e experiente que escreve documentos de alta qualidade.",
  "Escreves o documento final completo em Markdown, pronto a exportar.",
  "Regras obrigatórias:",
  "- Usa exactamente as secções pedidas, na ordem indicada, cada uma como um cabeçalho '## '.",
  "- Adapta a linguagem e o tom ao contexto fornecido pelo utilizador.",
  "- Não inventes dados pessoais, instituições, nomes ou datas que não foram fornecidos.",
  "- Não escrevas comentários sobre o teu próprio trabalho nem instruções ao utilizador.",
  "- Nunca menciones preços, créditos ou custos.",
  "- Se a informação fornecida for insuficiente numa secção, escreve conteúdo genérico profissional, coerente e de alta relevância para o tema.",
].join("\n");

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

  const spec = getSpec(record.doc_type);
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
      "simple_cv"
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
          t("id_document") ? `**BI / DIRE n.º:** ${t("id_document")}` : "",
          `\nExmo. Senhor,\n`,
          `Vem, por este meio, requerer a V. Excia. se digne autorizar a/o:\n`,
          `${t("purpose") || record.title}\n`,
          t("justification") ? `**Fundamentação:**\n${t("justification")}\n` : "",
          `Nestes termos,`,
          `Pede Deferimento.\n`,
          `${t("city") || "Maputo"}, ${t("letter_date") ? formatDate(t("letter_date")) : formatDate(new Date().toISOString())}\n`,
          `__________________________________________`,
          `(Assinatura do Requerente)\n`,
          t("contact") ? `**Contactos:** ${t("contact")}` : "",
        ].filter(Boolean).join("\n");
      } else if (record.doc_type === "declaration") {
        content = [
          `# DECLARAÇÃO\n`,
          `Eu, **${t("declarant") || record.title}**, ${t("id_document") ? `portador do documento de identificação ${t("id_document")},` : ""} declaro para os devidos efeitos que:\n`,
          `${t("purpose") || "o conteúdo declarado é fidedigno e conforme à verdade."}\n`,
          t("beneficiary") ? `A presente declaração é emitida a favor de **${t("beneficiary")}** por ser a pura verdade.\n` : "",
          `${t("city") || "Maputo"}, ${t("letter_date") ? formatDate(t("letter_date")) : formatDate(new Date().toISOString())}\n`,
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
          `${t("city") || "Maputo"}, ${t("letter_date") ? formatDate(t("letter_date")) : formatDate(new Date().toISOString())}`,
        ].filter(Boolean).join("\n");
      } else if (record.doc_type === "personal_letter") {
        content = [
          `# CARTA PESSOAL\n`,
          `Querido(a) ${t("recipient") || "Amigo"},\n`,
          `Escrevo esta carta para:\n`,
          `${t("purpose") || "partilhar novidades e enviar os meus melhores cumprimentos."}\n`,
          `Com muito carinho e amizade,\n`,
          `${t("sender") || "Atentamente"}\n`,
          `${t("city") || "Maputo"}, ${t("letter_date") ? formatDate(t("letter_date")) : formatDate(new Date().toISOString())}`,
        ].filter(Boolean).join("\n");
      } else if (record.doc_type === "simple_cv") {
        const listText = (key: string) => {
          const val = fields[key];
          if (Array.isArray(val)) return val.map(v => `- ${v}`).join("\n");
          return val ? String(val) : "";
        };
        content = [
          `# ${t("full_name") || record.title}`,
          `## ${t("headline") || "Profissional"}\n`,
          `**Contactos:**`,
          t("email") ? `- Email: ${t("email")}` : "",
          t("phone") ? `- Telefone: ${t("phone")}` : "",
          t("address") ? `- Endereço: ${t("address")}` : "",
          t("linkedin") ? `- LinkedIn: ${t("linkedin")}` : "",
          `\n**Dados Pessoais:**`,
          t("birth_date") ? `- Data de Nascimento: ${formatDate(t("birth_date"))}` : "",
          t("nationality") ? `- Nacionalidade: ${t("nationality")}` : "",
          t("bi_number") ? `- BI: ${t("bi_number")}` : "",
          t("nuit_number") ? `- NUIT: ${t("nuit_number")}` : "",
          t("driving_license") ? `- Carta de Condução: ${t("driving_license")}` : "",
          t("travel_availability") ? `- Disponibilidade: ${t("travel_availability")}` : "",
          t("profile") ? `\n---\n\n### Perfil Profissional\n${t("profile")}` : "",
          t("experience") ? `\n---\n\n### Experiência Profissional\n${listText("experience")}` : "",
          t("education") ? `\n---\n\n### Formação Académica\n${listText("education")}` : "",
          t("skills") ? `\n---\n\n### Competências\n${listText("skills")}` : "",
          t("languages") ? `\n---\n\n### Idiomas\n${listText("languages")}` : "",
        ].filter(Boolean).join("\n");
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
