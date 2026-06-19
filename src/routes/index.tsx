import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/suralogic/AppShell";
import { Card, SectionHeader, Delta, StatusPill } from "@/components/suralogic/primitives";
import { Sparkline, HealthRing, HourlyBars } from "@/components/suralogic/charts";
import { useActiveSnapshot, fmtCompact } from "@/components/suralogic/hooks";
import { useAuth } from "@/lib/auth";
import {
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Package,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inicio · Flux Ops AI Copilot" },
      {
        name: "description",
        content: "Resumen ejecutivo del negocio con insights y predicciones generadas por IA.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { data: snap, isLoading } = useActiveSnapshot();

  if (isLoading || !snap) {
    return (
      <AppShell greeting={`Hola, ${user?.nombre ?? ""}`}>
        <div className="grid place-items-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  const monthBars = snap.ingresosPorMes.map((m) => ({ hour: m.mes, v: Math.round(m.total / 1000) }));
  const peak = monthBars.length
    ? monthBars.reduce((maxI, h, i) => (h.v > monthBars[maxI].v ? i : maxI), 0)
    : 0;

  const totalIngresos = snap.ingresosPorMes.reduce((a, b) => a + b.total, 0);

  return (
    <AppShell
      greeting={`Hola, ${user?.nombre?.split(" ")[0] ?? "Owner"}`}
      subtitle={`Tu negocio generó ${fmtCompact(totalIngresos)} en ${snap.sales.length} operaciones. ${snap.alertasStock.length ? `${snap.alertasStock.length} alertas de inventario pendientes.` : "Inventario sin alertas."}`}
    >
      {/* Health card */}
      <Card className="flex items-center justify-between sl-fade-up">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Salud del negocio
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            {snap.healthScore}
            <span className="text-base text-muted-foreground">/100</span>
          </p>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Considera tendencia, inventario y diversificación
          </p>
        </div>
        <HealthRing value={snap.healthScore} />
      </Card>

      {/* KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {snap.kpis.map((k) => (
          <Card key={k.key} className="sl-fade-up">
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-medium text-muted-foreground">{k.label}</p>
              {k.delta !== 0 && <Delta value={k.delta} />}
            </div>
            <p className="mt-1.5 text-lg font-semibold tracking-tight text-foreground tabular-nums">
              {k.value}
            </p>
            <p className="text-[10px] text-muted-foreground">{k.suffix}</p>
            <div className="mt-2">
              <Sparkline data={k.spark} tone={k.tone} />
            </div>
          </Card>
        ))}
      </div>

      {/* Insights */}
      <div className="mt-6">
        <SectionHeader
          title="Insights inteligentes"
          hint="Flux Ops AI · datos en tiempo real"
          action={
            <Link to="/insights" className="text-[12px] font-medium text-primary">
              Ver todos
            </Link>
          }
        />
        <div className="space-y-3">
          {snap.insights.length === 0 && (
            <Card>
              <p className="text-[12px] text-muted-foreground">
                Sin alertas relevantes en este momento. Sigue así.
              </p>
            </Card>
          )}
          {snap.insights.slice(0, 3).map((ins) => (
            <Card
              key={ins.id}
              className={
                "sl-fade-up border-l-2 " +
                (ins.tone === "success"
                  ? "border-l-primary"
                  : ins.tone === "danger"
                  ? "border-l-destructive"
                  : "border-l-border")
              }
            >
              <div className="flex items-start gap-3">
                <div
                  className={
                    "grid size-8 shrink-0 place-items-center rounded-lg " +
                    (ins.tone === "success"
                      ? "bg-primary/15 text-primary"
                      : ins.tone === "danger"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-accent text-muted-foreground")
                  }
                >
                  {ins.tone === "danger" ? (
                    <AlertTriangle className="size-4" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={
                      "text-[10px] font-semibold uppercase tracking-wider " +
                      (ins.tone === "success"
                        ? "text-primary"
                        : ins.tone === "danger"
                        ? "text-destructive"
                        : "text-muted-foreground")
                    }
                  >
                    {ins.badge}
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold text-foreground leading-snug">
                    {ins.title}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground text-pretty">
                    {ins.body}
                  </p>
                  <Link
                    to="/copiloto"
                    className="mt-2 inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-accent/70"
                  >
                    Preguntar al Copiloto <ChevronRight className="size-3" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Ingresos por mes */}
      {monthBars.length > 0 && (
        <div className="mt-6">
          <Card className="sl-fade-up">
            <SectionHeader
              title="Ingresos por mes"
              hint={`Mes pico: ${monthBars[peak].hour} · $${monthBars[peak].v}K`}
              action={
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  <TrendingUp className="size-3" />
                  {monthBars.length} meses
                </span>
              }
            />
            <HourlyBars data={monthBars} peakIndex={peak} />
          </Card>
        </div>
      )}

      {/* Historial reciente */}
      <div className="mt-6">
        <SectionHeader
          title="Operaciones recientes"
          action={
            <Link to="/inventario" className="text-[12px] font-medium text-primary">
              Ver inventario
            </Link>
          }
        />
        <div className="space-y-2">
          {snap.sales
            .slice()
            .sort((a, b) => (b.created_at?.getTime() ?? 0) - (a.created_at?.getTime() ?? 0))
            .slice(0, 5)
            .map((s) => (
              <Card key={s.id} className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-base">
                  <Package className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground">
                    {s.product_nombre}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {s.staff_nombre} · {s.cantidad} pza · {s.payment_method}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold tabular-nums text-foreground">
                    ${s.total.toLocaleString("es-MX")}
                  </p>
                  <StatusPill label={s.created_at?.toLocaleDateString("es-MX") ?? "—"} tone="neutral" />
                </div>
              </Card>
            ))}
        </div>
      </div>
    </AppShell>
  );
}