/**
 * AI provider adapter (server-only) with production providers and smart fallback.
 *
 * The rest of the app never talks to a model directly — it goes through
 * `generateDocumentContent` in `src/lib/documents.functions.ts`, which uses
 * this adapter. Swapping or adding providers is managed entirely here.
 */

export class AiNotConfiguredError extends Error {
  constructor() {
    super("Nenhum serviço de geração de documentos (IA) está configurado no ficheiro de ambiente (.env).");
    this.name = "AiNotConfiguredError";
  }
}

export class AiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiRequestError";
  }
}

export type CompletionRequest = {
  system: string;
  user: string;
  maxTokens?: number;
};

interface Provider {
  name: string;
  isEnabled: () => boolean;
  request: (system: string, user: string, maxTokens: number) => Promise<string>;
}

const PROVIDERS: Provider[] = [
  {
    name: "OpenAI (Produção - Principal)",
    isEnabled: () => !!process.env["OPENAI_API_KEY"],
    request: async (system, user, maxTokens) => {
      const apiKey = process.env["OPENAI_API_KEY"];
      const model = process.env["OPENAI_MODEL"] || "gpt-4o";
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature: 0.3,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`OpenAI API erro (${response.status}): ${errorText.slice(0, 150)}`);
      }

      const payload = await response.json() as any;
      const content = payload.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error("OpenAI devolveu uma resposta vazia.");
      return content;
    }
  },
  {
    name: "Anthropic Claude (Produção - Alternativo)",
    isEnabled: () => !!process.env["ANTHROPIC_API_KEY"],
    request: async (system, user, maxTokens) => {
      const apiKey = process.env["ANTHROPIC_API_KEY"];
      const model = process.env["ANTHROPIC_MODEL"] || "claude-3-5-sonnet-20241022";

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey!,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: Math.min(maxTokens, 4000), // Claude max output limit
          system,
          messages: [
            { role: "user", content: user }
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`Anthropic API erro (${response.status}): ${errorText.slice(0, 150)}`);
      }

      const payload = await response.json() as any;
      const content = payload.content?.[0]?.text?.trim();
      if (!content) throw new Error("Anthropic devolveu uma resposta vazia.");
      return content;
    }
  },
  {
    name: "Google Gemini Oficial (Produção - Alternativo)",
    isEnabled: () => !!process.env["GEMINI_API_KEY"],
    request: async (system, user, maxTokens) => {
      const apiKey = process.env["GEMINI_API_KEY"];
      const model = process.env["GEMINI_MODEL"] || "gemini-1.5-pro";

      // Using Google's OpenAI-compatible endpoint
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature: 0.3,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`Gemini API erro (${response.status}): ${errorText.slice(0, 150)}`);
      }

      const payload = await response.json() as any;
      const content = payload.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error("Gemini devolveu uma resposta vazia.");
      return content;
    }
  },
  {
    name: "Lovable Gateway (Desenvolvimento - Fallback)",
    isEnabled: () => !!process.env["LOVABLE_API_KEY"],
    request: async (system, user, maxTokens) => {
      const apiKey = process.env["LOVABLE_API_KEY"];
      const model = "google/gemini-3.6-flash";

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });

      if (response.status === 429) {
        throw new Error("Limite de pedidos atingido no Lovable Gateway.");
      }
      if (response.status === 402) {
        throw new Error("Lovable Gateway sem saldo disponível.");
      }
      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`Lovable Gateway erro (${response.status}): ${errorText.slice(0, 150)}`);
      }

      const payload = await response.json() as any;
      const content = payload.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error("Lovable Gateway devolveu uma resposta vazia.");
      return content;
    }
  }
];

export async function requestCompletion({
  system,
  user,
  maxTokens = 8000,
}: CompletionRequest): Promise<string> {
  // Filter active/configured providers
  const activeProviders = PROVIDERS.filter(p => p.isEnabled());

  if (activeProviders.length === 0) {
    throw new AiNotConfiguredError();
  }

  const errors: string[] = [];

  // Try each provider in order (Smart Fallback)
  for (const provider of activeProviders) {
    try {
      console.log(`[AI Geração] A tentar gerar documento usando o provedor: ${provider.name}...`);
      const result = await provider.request(system, user, maxTokens);
      console.log(`[AI Geração] Sucesso na geração de conteúdo com: ${provider.name}`);
      return result;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[AI Geração] Erro ao usar o provedor ${provider.name}: ${errorMessage}`);
      errors.push(`${provider.name}: ${errorMessage}`);
      // Continue to next provider...
    }
  }

  // If we reach here, all attempted providers failed
  throw new AiRequestError(
    `Todos os provedores de IA falharam na geração do documento. Detalhes:\n- ${errors.join("\n- ")}`
  );
}
