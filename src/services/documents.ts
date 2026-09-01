/**
 * Client-side document actions (edit, duplicate, delete).
 * All writes go through the browser Supabase client, so RLS enforces
 * ownership — there is no privileged path here.
 */

import { supabase } from "@/integrations/supabase/client";
import type { DocumentRow } from "@/lib/queries";

async function logEvent(documentId: string, event: string, detail: Record<string, unknown> = {}) {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) return;
  await supabase.from("document_events").insert({
    document_id: documentId,
    user_id: userId,
    event,
    detail,
  });
}

/** Saves manual edits to the generated content. */
export async function saveDocumentContent(documentId: string, title: string, content: string) {
  const cleanTitle = title.trim();
  if (!cleanTitle) throw new Error("O título não pode ficar vazio.");

  const { error } = await supabase
    .from("documents")
    .update({ title: cleanTitle, content })
    .eq("id", documentId);
  if (error) throw error;

  await logEvent(documentId, "content_edited", { chars: content.length });
}

/** Creates an independent copy of a document. Copies never cost credits. */
export async function duplicateDocument(doc: DocumentRow): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("Sessão expirada. Inicie sessão novamente.");

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      title: `${doc.title} (cópia)`,
      doc_type: doc.doc_type,
      status: doc.content ? "ready" : "draft",
      subject: doc.subject,
      content: doc.content,
      instructions: doc.instructions,
      options: doc.options as never,
      metadata: doc.metadata as never,
      estimated_cost: doc.estimated_cost,
      credits_spent: 0,
    })
    .select("id")
    .single();
  if (error) throw error;

  await logEvent(data.id, "document_duplicated", { source_document_id: doc.id });
  return data.id;
}

/** Permanently removes a document (and its events, via cascade). */
export async function deleteDocument(documentId: string) {
  const { error } = await supabase.from("documents").delete().eq("id", documentId);
  if (error) throw error;
}
