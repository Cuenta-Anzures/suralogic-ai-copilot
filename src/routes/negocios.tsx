import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/suralogic/AppShell";
import { Card, Delta, SectionHeader } from "@/components/suralogic/primitives";
import { Sparkline } from "@/components/suralogic/charts";
import { businesses } from "@/data/mockData";
import { MapPin, Trophy } from "lucide-react";

export const Route = createFileRoute("/negocios")({
  head: () => ({
    meta: [
      { title: "Multi-negocio · Suralogic Insights" },
      {
        name: "description",
        content: "Command center para administrar varios negocios, sucursales y marcas con ranking y comparativos.",
      },
    ],
  }),
  component: Negocios,
});

function Negocios() {
  const ranked = [...businesses].sort((a, b) => b.health - a.health);

  return (
    <AppShell
      greeting="Tu negocio"
      subtitle="Unidades activas y desempeño en tiempo real."
    >
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Facturado</p>
          <p className="mt-1 text-base font-semibold text-foreground">$1.97M</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Operaciones</p>
          <p className="mt-1 text-base font-semibold text-foreground">55</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Días activos</p>
          <p className="mt-1 text-base font-semibold text-primary">1,448</p>
        </Card>
      </div>

      {/* Map-ish visual */}
      <Card className="mt-4 overflow-hidden sl-fade-up">
        <div className="relative h-40 w-full overflow-hidden rounded-xl bg-[radial-gradient(circle_at_20%_30%,oklch(0.28_0.04_152)_0%,oklch(0.18_0.005_270)_60%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.3_0.006_270/0.25)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.3_0.006_270/0.25)_1px,transparent_1px)] bg-[size:24px_24px]" />
          {[
            { x: "20%", y: "55%", s: 18 },
            { x: "65%", y: "30%", s: 14 },
            { x: "40%", y: "70%", s: 10 },
            { x: "80%", y: "65%", s: 16 },
          ].map((p, i) => (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: p.x, top: p.y }}
            >
              <span
                className="block rounded-full bg-primary/30 ring-2 ring-primary/60 sl-pulse"
                style={{ width: p.s, height: p.s }}
              />
            </div>
          ))}
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-card/70 px-2 py-0.5 text-[10px] text-muted-foreground ring-1 ring-border backdrop-blur">
            <MapPin className="size-3" /> Unidades en operación
          </div>
        </div>
      </Card>

      {/* Ranking */}
      <div className="mt-6">
        <SectionHeader title="Ranking" hint="Por desempeño y facturado YTD" />
        <div className="space-y-3">
          {ranked.map((b, i) => (
            <Card key={b.id} className="sl-fade-up">
              <div className="flex items-center gap-3">
                <div
                  className={
                    "grid size-9 shrink-0 place-items-center rounded-lg text-[12px] font-bold tabular-nums " +
                    (i === 0
                      ? "bg-primary/20 text-primary"
                      : "bg-accent text-muted-foreground")
                  }
                >
                  {i === 0 ? <Trophy className="size-4" /> : `0${i + 1}`}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-foreground">{b.name}</p>
                  <p className="text-[11px] text-muted-foreground">{b.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold tabular-nums text-foreground">{b.sales}</p>
                  <Delta value={b.growth} />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3 border-t border-border/60 pt-3">
                <div>
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span>Health</span>
                    <span className="text-foreground">{b.health}/100</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-accent">
                    <div
                      className={
                        "h-full " + (b.health >= 80 ? "bg-primary" : b.health >= 60 ? "bg-yellow-500" : "bg-destructive")
                      }
                      style={{ width: `${b.health}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    {b.tickets} operaciones · días activos
                  </p>
                </div>
                <div className="w-16">
                  <Sparkline
                    data={[40, 55, 50, 65, 70, 80, b.health]}
                    tone={b.growth < 0 ? "danger" : "primary"}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}