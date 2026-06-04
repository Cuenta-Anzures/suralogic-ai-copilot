import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/suralogic/AppShell";
import { Card, SectionHeader } from "@/components/suralogic/primitives";
import { ForecastLine, HourlyBars, Heatmap } from "@/components/suralogic/charts";
import { hourly, heatmap, forecast, inventory } from "@/data/mockData";

export const Route = createFileRoute("/analitica")({
  head: () => ({
    meta: [
      { title: "Analítica · Suralogic Insights" },
      {
        name: "description",
        content: "Gráficas avanzadas: ventas por hora, mapa de calor, forecast y comparativo de sucursales.",
      },
    ],
  }),
  component: Analitica,
});

function Analitica() {
  const peak = hourly.reduce((maxI, h, i, arr) => (h.v > arr[maxI].v ? i : maxI), 0);
  const top = [...inventory]
    .sort((a, b) => b.trend[b.trend.length - 1] - a.trend[a.trend.length - 1])
    .slice(0, 4);
  const maxTrend = Math.max(...top.map((t) => t.trend[t.trend.length - 1]));

  return (
    <AppShell
      greeting="Analítica AGLA"
      subtitle="Ingresos, utilización y forecasting de tu flota de plataformas."
    >
      <Card className="sl-fade-up">
        <SectionHeader title="Forecast de ingresos" hint="Proyección IA · próximos 3 meses" />
        <ForecastLine data={forecast} />
      </Card>

      <Card className="mt-4 sl-fade-up">
        <SectionHeader title="Ingresos mensuales 2024" hint={`Mes pico: ${hourly[peak].hour}`} />
        <HourlyBars data={hourly} peakIndex={peak} />
      </Card>

      <Card className="mt-4 sl-fade-up">
        <SectionHeader title="Utilización de flota" hint="MB001 · MB002 · MB003 · por mes" />
        <Heatmap data={heatmap} />
      </Card>

      <Card className="mt-4 sl-fade-up">
        <SectionHeader title="Top equipos" hint="Por facturado y utilización" />
        <div className="space-y-3">
          {top.map((p) => (
            <div key={p.id}>
              <div className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-2 text-foreground">
                  <span className="text-base">{p.image}</span>
                  <span className="truncate font-medium">{p.name}</span>
                </span>
                <span className="font-mono text-muted-foreground">
                  {p.trend[p.trend.length - 1]}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-accent">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${(p.trend[p.trend.length - 1] / maxTrend) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}