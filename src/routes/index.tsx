import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/suralogic/AppShell";
import { Card, SectionHeader, Delta, StatusPill } from "@/components/suralogic/primitives";
import { Sparkline, HealthRing, HourlyBars, Heatmap } from "@/components/suralogic/charts";
import { kpis, insights, hourly, heatmap, inventory, flujoCaja, socios, rentasRecientes } from "@/data/mockData";
import { Sparkles, ChevronRight, TrendingUp, AlertTriangle, Wallet, Users } from "lucide-react";

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
      greeting="Buenos días, Daniel"
      subtitle="Tu negocio generó $1.97M facturados con 92% utilización en tu unidad líder. Hay $234K pendientes de cobro."
    >
      {/* Health + summary */}
      <Card className="flex items-center justify-between sl-fade-up">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Salud financiera
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">78<span className="text-base text-muted-foreground">/100</span></p>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <TrendingUp className="size-3" /> +4.1 vs mes ant.
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">Cobranza pesa el score</p>
        </div>
        <HealthRing value={78} />
      </Card>

      {/* Caja & socios */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Card className="sl-fade-up">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-md bg-primary/15 text-primary">
              <Wallet className="size-3.5" />
            </span>
            <p className="text-[11px] font-medium text-muted-foreground">Caja chica</p>
          </div>
          <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
            ${flujoCaja.cajaActual.toLocaleString("es-MX", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-muted-foreground">Líquido disponible</p>
        </Card>
        <Card className="sl-fade-up" >
          <div className="flex items-center gap-2">
            <span
              className="grid size-7 place-items-center rounded-md"
              style={{
                background: "color-mix(in oklab, var(--owner) 18%, transparent)",
                color: "var(--owner)",
              }}
            >
              <Users className="size-3.5" />
            </span>
            <p className="text-[11px] font-medium text-muted-foreground">Socios 50/50</p>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {socios.map((s) => (
              <div key={s.name} className="flex-1">
                <p className="text-[10px] text-muted-foreground">{s.initials}</p>
                <p className="text-[13px] font-semibold tabular-nums text-foreground">
                  ${(s.pendiente / 1000).toFixed(0)}K
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

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
            title="Ingresos por mes · 2024"
            hint={`Mes pico: ${hourly[peak].hour} · $${hourly[peak].v}K`}
            action={
              <div className="flex gap-1 rounded-lg bg-accent p-0.5 text-[10px] font-medium">
                <button className="rounded-md bg-card px-2 py-1 text-foreground">2024</button>
                <button className="px-2 py-1 text-muted-foreground">2025</button>
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
            title="Utilización"
            hint="Por unidad · meses del año"
          />
          <Heatmap data={heatmap} />
          <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Inactivo</span>
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
            <span>100% rentado</span>
          </div>
        </Card>
      </div>

      {/* Historial */}
      <div className="mt-6">
        <SectionHeader
          title="Historial"
          action={
            <Link to="/inventario" className="text-[12px] font-medium text-primary">
              Ver inventario
            </Link>
          }
        />
        <div className="space-y-2">
          {rentasRecientes.slice(0, 4).map((r) => (
            <Card key={r.folio} className="flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-base">
                🏗️
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">
                  {r.folio} · {r.equipo}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {r.cliente} · {r.dias} días
                </p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-semibold tabular-nums text-foreground">
                  ${r.total.toLocaleString("es-MX")}
                </p>
                <StatusPill
                  label={r.status === "pagado" ? "Pagado" : "Pendiente"}
                  tone={r.status === "pagado" ? "success" : "warning"}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
