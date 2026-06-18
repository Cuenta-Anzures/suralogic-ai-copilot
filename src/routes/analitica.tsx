import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/suralogic/AppShell";
import { Card, SectionHeader } from "@/components/suralogic/primitives";
import { ForecastLine, HourlyBars } from "@/components/suralogic/charts";
import { useBusinesses, useSnapshot, fmtCompact } from "@/components/suralogic/hooks";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/analitica")({
  head: () => ({
    meta: [
      { title: "Análisis · Flux Ops" },
      { name: "description", content: "Predicciones, ingresos por mes, top productos y métodos de pago." },
    ],
  }),
  component: Analitica,
});

function Analitica() {
  const { data: businesses } = useBusinesses();
  const { data: snap, isLoading } = useSnapshot(businesses?.[0]?.id);

  if (isLoading || !snap) {
    return (
      <AppShell greeting="Análisis">
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

  const maxTop = Math.max(1, ...snap.topProductos.map((t) => t.total));

  return (
    <AppShell greeting="Análisis" subtitle="Predicciones y desempeño consolidado.">
      {/* Forecast */}
      {snap.forecast.length > 0 && (
        <Card className="sl-fade-up">
          <SectionHeader title="Predicción de ingresos" hint="Línea sólida: histórico · punteada: predicción IA" />
          <ForecastLine data={snap.forecast} />
        </Card>
      )}

      {/* Ingresos por mes */}
      {monthBars.length > 0 && (
        <Card className="mt-4 sl-fade-up">
          <SectionHeader title="Ingresos por mes" hint={`Pico: ${monthBars[peak].hour}`} />
          <HourlyBars data={monthBars} peakIndex={peak} />
        </Card>
      )}

      {/* Top productos */}
      <Card className="mt-4 sl-fade-up">
        <SectionHeader title="Top productos" hint="Por ingresos generados" />
        <div className="space-y-3">
          {snap.topProductos.slice(0, 6).map((p) => (
            <div key={p.id}>
              <div className="flex items-center justify-between text-[12px]">
                <span className="truncate font-medium text-foreground">{p.nombre}</span>
                <span className="font-mono text-muted-foreground">{fmtCompact(p.total)}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-accent">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${(p.total / maxTop) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {p.unidades} unidades · {p.operaciones} operaciones · {p.share.toFixed(1)}% del ingreso
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Métodos de pago */}
      <Card className="mt-4 sl-fade-up">
        <SectionHeader title="Métodos de pago" hint="Distribución de ingresos" />
        <div className="space-y-3">
          {snap.ventasPorMetodoPago.map((m) => (
            <div key={m.metodo}>
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium capitalize text-foreground">{m.metodo}</span>
                <span className="font-mono text-muted-foreground">
                  {fmtCompact(m.total)} · {m.share.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-accent">
                <div className="h-full bg-primary" style={{ width: `${m.share}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}