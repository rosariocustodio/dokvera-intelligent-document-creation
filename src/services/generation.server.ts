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
  "És um redactor profissional moçambicano que escreve documentos em português de Moçambique (pt-MZ).",
  "Escreves o documento final completo em Markdown, pronto a exportar.",
  "Regras obrigatórias:",
  "- Usa exactamente as secções pedidas, na ordem indicada, cada uma como um cabeçalho '## '.",
  "- Não inventes dados pessoais, instituições, notas ou datas que não foram fornecidos.",
  "- Não escrevas comentários sobre o teu próprio trabalho nem instruções ao utilizador.",
  "- Nunca menciones preços, créditos ou custos.",
  "- Se a informação fornecida for insuficiente numa secção, escreve conteúdo genérico correcto e coerente com o tema.",
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
    const content = await requestCompletion({
      system: SYSTEM_PROMPT,
      user: outlineToBrief(outline),
    });

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
