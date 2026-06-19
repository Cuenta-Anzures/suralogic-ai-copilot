import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/suralogic/AppShell";
import { Card, SectionHeader, StatusPill } from "@/components/suralogic/primitives";
import { Sparkline } from "@/components/suralogic/charts";
import { useActiveSnapshot, fmtCompact } from "@/components/suralogic/hooks";
import { Loader2, ShieldCheck, User } from "lucide-react";

export const Route = createFileRoute("/equipo")({
  head: () => ({
    meta: [
      { title: "Personal · Flux Ops" },
      { name: "description", content: "Gestión y desempeño del personal del negocio." },
    ],
  }),
  component: Equipo,
});

function Equipo() {
  const { data: snap, isLoading } = useActiveSnapshot();

  if (isLoading || !snap) {
    return (
      <AppShell greeting="Personal">
        <div className="grid place-items-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  const maxTotal = Math.max(1, ...snap.ventasPorStaff.map((s) => s.total));
  const activos = snap.staff.filter((s) => s.activo);

  return (
    <AppShell greeting="Personal" subtitle="Desempeño y gestión del equipo en tiempo real.">
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Activos</p>
          <p className="mt-1 text-base font-semibold text-foreground">{activos.length}</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Vendedores</p>
          <p className="mt-1 text-base font-semibold text-foreground">
            {snap.staff.filter((s) => s.rol === "vendedor").length}
          </p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total operaciones</p>
          <p className="mt-1 text-base font-semibold text-primary">{snap.sales.length}</p>
        </Card>
      </div>

      {/* Ranking por staff */}
      <div className="mt-6">
        <SectionHeader title="Ranking de ventas" hint="Comparativo por miembro del equipo" />
        <div className="space-y-3">
          {snap.ventasPorStaff.map((s, i) => (
            <Card key={s.staff_id || s.staff_nombre} className="sl-fade-up">
              <div className="flex items-center gap-3">
                <div
                  className={
                    "grid size-10 shrink-0 place-items-center rounded-lg text-[12px] font-bold " +
                    (i === 0 ? "bg-primary/20 text-primary" : "bg-accent text-muted-foreground")
                  }
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-foreground">
                    {s.staff_nombre}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {s.operaciones} operaciones · ticket prom. {fmtCompact(s.ticket_promedio)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-semibold tabular-nums text-foreground">
                    {fmtCompact(s.total)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{s.share.toFixed(1)}% del total</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3 border-t border-border/60 pt-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-accent">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(s.total / maxTotal) * 100}%` }}
                  />
                </div>
                <div className="w-16">
                  <Sparkline data={s.trend.length ? s.trend : [0]} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Directorio */}
      <div className="mt-6">
        <SectionHeader title="Directorio" hint={`${snap.staff.length} usuarios registrados`} />
        <div className="space-y-2">
          {snap.staff.map((s) => (
            <Card key={s.id} className="flex items-center gap-3 sl-fade-up">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-muted-foreground">
                {s.rol === "admin" ? <ShieldCheck className="size-4" /> : <User className="size-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{s.nombre}</p>
                <p className="text-[11px] text-muted-foreground">
                  @{s.username} · {s.rol}
                </p>
              </div>
              <StatusPill
                label={s.activo ? "Activo" : "Inactivo"}
                tone={s.activo ? "success" : "neutral"}
              />
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}