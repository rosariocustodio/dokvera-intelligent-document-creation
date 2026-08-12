/**
 * AI provider adapter (server-only).
 *
 * The rest of the app never talks to a model directly — it goes through
 * `generateDocumentContent` in `src/lib/documents.functions.ts`, which uses
 * this adapter. Swapping provider means changing only this file.
 */

export class AiNotConfiguredError extends Error {
  constructor() {
    super("O serviço de geração de documentos não está configurado.");
    this.name = "AiNotConfiguredError";
  }
}

export class AiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiRequestError";
  }
}

const ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.6-flash";

export type CompletionRequest = {
  system: string;
  user: string;
  maxTokens?: number;
};

export async function requestCompletion({
  system,
  user,
  maxTokens = 8000,
}: CompletionRequest): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiNotConfiguredError();

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (response.status === 429) {
    throw new AiRequestError("Limite de pedidos atingido. Tenta novamente dentro de um minuto.");
  }
  if (response.status === 402) {
    throw new AiRequestError("Serviço de geração sem saldo disponível. Contacta o suporte.");
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new AiRequestError(`Falha no serviço de geração (${response.status}). ${detail.slice(0, 200)}`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) throw new AiRequestError("O serviço devolveu uma resposta vazia.");
  return content;
}
