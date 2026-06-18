// Cliente para Ollama local.
//
// Configura VITE_OLLAMA_URL (por defecto http://localhost:11434)
// y VITE_OLLAMA_MODEL (por defecto "llama3.1").
//
// El Copiloto envía a Ollama:
//   1. Un system prompt con el rol de gerente analista
//   2. El contexto agregado del negocio (métricas, no registros crudos)
//   3. El historial de la conversación

export const OLLAMA_URL =
  (import.meta.env.VITE_OLLAMA_URL as string | undefined) ?? "http://localhost:11434";
export const OLLAMA_MODEL =
  (import.meta.env.VITE_OLLAMA_MODEL as string | undefined) ?? "llama3.1";

export type ChatRole = "system" | "user" | "assistant";
export type ChatMessage = { role: ChatRole; content: string };

export type OllamaStreamChunk = {
  message?: { role: ChatRole; content: string };
  done?: boolean;
};

export async function* streamOllamaChat(messages: ChatMessage[], opts?: {
  model?: string;
  signal?: AbortSignal;
}): AsyncGenerator<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: opts?.signal,
    body: JSON.stringify({
      model: opts?.model ?? OLLAMA_MODEL,
      messages,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Ollama respondió ${res.status}. ¿Está corriendo en ${OLLAMA_URL}?`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const chunk = JSON.parse(trimmed) as OllamaStreamChunk;
        if (chunk.message?.content) yield chunk.message.content;
      } catch {
        // ignore malformed lines
      }
    }
  }
}

export function buildSystemPrompt(contextJson: unknown) {
  return `Eres Flux Ops AI Copilot, un gerente digital analítico para dueños de negocio.
Respondes en español, claro y conciso, con foco en decisiones accionables.

Reglas:
- Usa SOLO el contexto agregado que se te da; no inventes cifras.
- Si una pregunta no se puede contestar con el contexto, dilo y sugiere qué dato falta.
- Cuando sea posible, responde en este orden: (1) qué está pasando, (2) por qué,
  (3) qué pasará si sigue así, (4) qué recomiendas hacer.
- Usa cifras del contexto, no estimaciones genéricas.

Contexto del negocio (métricas agregadas, no registros crudos):
${JSON.stringify(contextJson, null, 2)}`;
}