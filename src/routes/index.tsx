import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/suralogic/AppShell";
import { Card, SectionHeader, Delta, StatusPill } from "@/components/suralogic/primitives";
import { Sparkline, HealthRing, HourlyBars, Heatmap } from "@/components/suralogic/charts";
import { kpis, insights, hourly, heatmap, inventory } from "@/data/mockData";
import { Sparkles, ChevronRight, TrendingUp, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Suralogic Insights" },
      {
        name: "description",
        content:
          "Resumen inteligente del negocio: ventas, margen, insights de IA y forecasting en tiempo real.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const peak = hourly.reduce((maxI, h, i, arr) => (h.v > arr[maxI].v ? i : maxI), 0);

  return (
    <AppShell
      greeting="Buenos días, Javier"
      subtitle="Tu negocio creció 12.4% vs la semana pasada. Stock saludable en 4 de 5 categorías."
    >
      {/* Health + summary */}
      <Card className="flex items-center justify-between sl-fade-up">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Salud del negocio
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">82<span className="text-base text-muted-foreground">/100</span></p>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <TrendingUp className="size-3" /> +2.4 vs mes ant.
          </div>
        </div>
        <HealthRing value={82} />
      </Card>

      {/* KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {kpis.map((k, i) => (
          <Card key={k.key} className="sl-fade-up" >
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-medium text-muted-foreground">{k.label}</p>
              <Delta value={k.delta} />
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
          hint="Suralogic AI · actualizado hace 2 min"
          action={
            <Link to="/insights" className="text-[12px] font-medium text-primary">
              Ver todos
            </Link>
          }
        />
        <div className="space-y-3">
          {insights.map((ins) => (
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
                  <button className="mt-2 inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-accent/70">
                    {ins.action} <ChevronRight className="size-3" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Hourly chart */}
      <div className="mt-6">
        <Card className="sl-fade-up">
          <SectionHeader
            title="Ventas por hora"
            hint={`Pico a las ${hourly[peak].hour}:00 hrs`}
            action={
              <div className="flex gap-1 rounded-lg bg-accent p-0.5 text-[10px] font-medium">
                <button className="rounded-md bg-card px-2 py-1 text-foreground">Hoy</button>
                <button className="px-2 py-1 text-muted-foreground">Sem</button>
              </div>
            }
          />
          <HourlyBars data={hourly} peakIndex={peak} />
        </Card>
      </div>

      {/* Heatmap */}
      <div className="mt-4">
        <Card className="sl-fade-up">
          <SectionHeader
            title="Mapa de calor semanal"
            hint="Intensidad de tráfico · L–D · 08:00–20:00"
          />
          <Heatmap data={heatmap} />
          <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Bajo</span>
            <div className="flex gap-1">
              {[0.15, 0.35, 0.6, 0.85, 1].map((v, i) => (
                <div
                  key={i}
                  className="size-3 rounded-sm"
                  style={{
                    background: `color-mix(in oklab, var(--primary) ${v * 90}%, oklch(0.22 0.006 270))`,
                  }}
                />
              ))}
            </div>
            <span>Alto</span>
          </div>
        </Card>
      </div>

      {/* Quick inventory */}
      <div className="mt-6">
        <SectionHeader
          title="Inventario crítico"
          action={
            <Link to="/inventario" className="text-[12px] font-medium text-primary">
              Gestionar
            </Link>
          }
        />
        <div className="space-y-2">
          {inventory.slice(0, 3).map((p) => (
            <Link
              to="/productos/$productId"
              params={{ productId: p.id }}
              key={p.id}
              className="block"
            >
              <Card className="flex items-center gap-3 hover:bg-card">
                <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent text-xl">
                  {p.image}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {p.stock} uds · min {p.min}
                  </p>
                </div>
                <StatusPill
                  label={
                    p.status === "danger" ? "Riesgo" : p.status === "warning" ? "Lento" : "OK"
                  }
                  tone={p.status}
                />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
