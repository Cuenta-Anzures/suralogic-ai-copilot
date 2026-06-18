import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/suralogic/AppShell";
import { Card } from "@/components/suralogic/primitives";
import { Sparkles, Send, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { buildAiContext } from "@/lib/dataSource";
import { useBusinesses, useSnapshot } from "@/components/suralogic/hooks";
import {
  streamOllamaChat,
  buildSystemPrompt,
  OLLAMA_URL,
  OLLAMA_MODEL,
  type ChatMessage,
} from "@/lib/ollama";

export const Route = createFileRoute("/copiloto")({
  head: () => ({
    meta: [
      { title: "Copiloto IA · Flux Ops" },
      { name: "description", content: "Chat con tu negocio. Conectado a Ollama local." },
    ],
  }),
  component: Copiloto,
});

const STORAGE_KEY = "fluxops.copiloto.messages.v1";

const suggestions = [
  "¿Por qué subieron mis ventas?",
  "¿Qué productos generan más ingresos?",
  "¿Qué debo reabastecer?",
  "¿Quién es mi mejor vendedor?",
];

function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function Copiloto() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadMessages());
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const { data: businesses } = useBusinesses();
  const { data: snapshot } = useSnapshot(businesses?.[0]?.id);

  const systemPrompt = useMemo(() => {
    if (!snapshot) return null;
    return buildSystemPrompt(buildAiContext(snapshot));
  }, [snapshot]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || streaming || !systemPrompt) return;
    setError(null);
    setInput("");
    const next: ChatMessage[] = [
      ...messages,
      { role: "user", content },
      { role: "assistant", content: "" },
    ];
    setMessages(next);
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    const payload: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...next.filter((m) => m.role !== "system").slice(0, -1),
    ];

    try {
      let acc = "";
      for await (const chunk of streamOllamaChat(payload, { signal: controller.signal })) {
        acc += chunk;
        setMessages((curr) => {
          const copy = curr.slice();
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setError(msg);
      setMessages((curr) => {
        const copy = curr.slice();
        if (copy[copy.length - 1]?.role === "assistant" && !copy[copy.length - 1].content) {
          copy.pop();
        }
        return copy;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function clearChat() {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
  }

  return (
    <AppShell
      greeting="Copiloto IA"
      subtitle="Conversación con las métricas agregadas de tu negocio. Potenciado por Ollama local."
    >
      <Card className="mb-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="size-3.5" />
          </span>
          <div className="leading-tight">
            <p className="text-[12px] font-medium text-foreground">Ollama · {OLLAMA_MODEL}</p>
            <p className="truncate text-[10px]">{OLLAMA_URL}</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-[11px] font-medium text-foreground hover:bg-accent/70"
        >
          <Trash2 className="size-3" /> Limpiar
        </button>
      </Card>

      <div
        ref={scrollRef}
        className="mb-3 max-h-[55vh] space-y-3 overflow-y-auto rounded-2xl bg-card/40 p-3 ring-1 ring-border"
      >
        {messages.length === 0 && (
          <div className="py-8 text-center">
            <div className="mx-auto grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
              <Sparkles className="size-5" />
            </div>
            <p className="mt-3 text-[13px] font-medium text-foreground">Pregúntale a tu negocio</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              La IA responde con las métricas agregadas de Flux Ops.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full bg-accent px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-accent/70"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-[13px] text-primary-foreground"
                : "mr-auto max-w-[90%] text-[13px] leading-relaxed text-foreground whitespace-pre-wrap"
            }
          >
            {m.content || (streaming && i === messages.length - 1 ? (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> Pensando…
              </span>
            ) : null)}
          </div>
        ))}

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-2.5 text-[12px] text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">No se pudo contactar a Ollama</p>
              <p className="text-[11px] opacity-80">{error}</p>
              <p className="mt-1 text-[11px] opacity-80">
                Inicia Ollama: <code>ollama serve</code> y descarga el modelo:{" "}
                <code>ollama pull {OLLAMA_MODEL}</code>.
              </p>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2 rounded-2xl bg-card p-2 ring-1 ring-border"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder="Pregúntale a tu negocio…"
          className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          disabled={!systemPrompt}
        />
        <button
          type="submit"
          disabled={!input.trim() || streaming || !systemPrompt}
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          aria-label="Enviar"
        >
          {streaming ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </button>
      </form>
    </AppShell>
  );
}