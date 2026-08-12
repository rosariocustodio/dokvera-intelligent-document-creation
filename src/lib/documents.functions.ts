import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Generates the document content. Credits are debited server-side. */
export const generateDocumentContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { documentId: string }) => {
    if (!input?.documentId || typeof input.documentId !== "string") {
      throw new Error("documentId inválido");
    }
    return { documentId: input.documentId };
  })
  .handler(async ({ data, context }) => {
    const { generateDocument } = await import("@/services/generation.server");
    return generateDocument(context.supabase, data.documentId);
  });
