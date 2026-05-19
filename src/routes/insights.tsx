import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/suralogic/AppShell";
import { Card } from "@/components/suralogic/primitives";
import { aiFeed } from "@/data/mockData";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Send } from "lucide-react";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "AI Insights · Suralogic" },
      {
        name: "description",
        content: "Feed inteligente de predicciones, anomalías y recomendaciones automáticas para tu negocio.",
      },
    ],
  }),
  component: Insights,
});

const tagIcon = {
  Predicción: TrendingUp,
  Anomalía: AlertTriangle,
  Recomendación: Lightbulb,
  Tendencia: Sparkles,
} as const;

function Insights() {
  return (
    <AppShell>
      <div className="sl-fade-up">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          <span className="sl-pulse size-1.5 rounded-full bg-primary" />
          Suralogic AI · activo
        </div>
        <h1 className="mt-3 text-[26px] font-semibold tracking-tight text-foreground text-balance">
          El copiloto de tu negocio
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground text-pretty">
          12 patrones detectados hoy · 3 acciones recomendadas con alto impacto.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Precisión</p>
          <p className="mt-1 text-base font-semibold text-foreground">94.2%</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Anomalías</p>
          <p className="mt-1 text-base font-semibold text-destructive">2</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ahorro est.</p>
          <p className="mt-1 text-base font-semibold text-primary">$18.4K</p>
        </Card>
      </div>

      {/* Feed timeline */}
      <div className="relative mt-6 pl-5">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
        <div className="space-y-4">
          {aiFeed.map((item) => {
            const Icon = tagIcon[item.tag as keyof typeof tagIcon] ?? Sparkles;
            const dot =
              item.tone === "success"
                ? "bg-primary"
                : item.tone === "danger"
                ? "bg-destructive"
                : "bg-yellow-500";
            return (
              <div key={item.id} className="relative sl-fade-up">
                <span
                  className={
                    "absolute -left-5 top-3 size-3 rounded-full ring-4 ring-background " + dot
                  }
                />
                <Card>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Icon className="size-3" />
                      {item.tag}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{item.time}</span>
                  </div>
                  <p className="mt-2 text-[13px] font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground text-pretty">
                    {item.body}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
                      Aplicar
                    </button>
                    <button className="rounded-md bg-accent px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
                      Descartar
                    </button>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ask AI */}
      <Card className="mt-6 sl-fade-up">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          Pregunta a Suralogic AI
        </p>
        <p className="mt-1 text-[13px] text-foreground">
          “¿Qué producto debería liquidar este mes?”
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-accent/60 px-3 py-2 ring-1 ring-border">
          <Sparkles className="size-4 text-primary" />
          <input
            placeholder="Pregunta algo sobre tu negocio…"
            className="w-full bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            aria-label="Enviar"
            className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </Card>
    </AppShell>
  );
}