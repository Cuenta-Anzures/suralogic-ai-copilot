import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/suralogic/AppShell";
import { Card } from "@/components/suralogic/primitives";
import { useActiveSnapshot } from "@/components/suralogic/hooks";
import { Sparkles, AlertTriangle, Lightbulb, TrendingUp, Loader2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights · Flux Ops AI Copilot" },
      { name: "description", content: "Recomendaciones y alertas generadas automáticamente." },
    ],
  }),
  component: Insights,
});

const toneIcon = {
  success: TrendingUp,
  danger: AlertTriangle,
  warning: Lightbulb,
  neutral: Sparkles,
} as const;

function Insights() {
  const { data: snap, isLoading } = useActiveSnapshot();

  if (isLoading || !snap) {
    return (
      <AppShell>
        <div className="grid place-items-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="sl-fade-up">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          <span className="sl-pulse size-1.5 rounded-full bg-primary" />
          Flux Ops AI · activo
        </div>
        <h1 className="mt-3 text-[26px] font-semibold tracking-tight text-foreground text-balance">
          Recomendaciones inteligentes
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          Lo importante de tu negocio, priorizado por impacto.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Insights</p>
          <p className="mt-1 text-base font-semibold text-foreground">{snap.insights.length}</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Alertas</p>
          <p className="mt-1 text-base font-semibold text-destructive">{snap.alertasStock.length}</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Health</p>
          <p className="mt-1 text-base font-semibold text-primary">{snap.healthScore}</p>
        </Card>
      </div>

      <div className="mt-6 space-y-3">
        {snap.insights.length === 0 && (
          <Card>
            <p className="text-[12px] text-muted-foreground">
              No hay recomendaciones activas. Tu negocio luce estable.
            </p>
          </Card>
        )}
        {snap.insights.map((ins) => {
          const Icon = toneIcon[ins.tone] ?? Sparkles;
          return (
            <Card key={ins.id} className="sl-fade-up">
              <div className="flex items-start gap-3">
                <div
                  className={
                    "grid size-9 shrink-0 place-items-center rounded-lg " +
                    (ins.tone === "success"
                      ? "bg-primary/15 text-primary"
                      : ins.tone === "danger"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-accent text-muted-foreground")
                  }
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {ins.badge}
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold text-foreground">{ins.title}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground text-pretty">
                    {ins.body}
                  </p>
                  <Link
                    to="/copiloto"
                    className="mt-2 inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground"
                  >
                    Preguntar al Copiloto <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}