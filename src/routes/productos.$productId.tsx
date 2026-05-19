import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/suralogic/AppShell";
import { Card, StatusPill, Delta } from "@/components/suralogic/primitives";
import { Sparkline, ForecastLine } from "@/components/suralogic/charts";
import { inventory } from "@/data/mockData";
import { ChevronLeft, Sparkles, Package, TrendingUp, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/productos/$productId")({
  head: ({ params }) => ({
    meta: [
      { title: `Producto ${params.productId} · Suralogic` },
      {
        name: "description",
        content: "Detalle de producto: historial de ventas, predicción de demanda y recomendaciones de IA.",
      },
    ],
  }),
  loader: ({ params }) => {
    const product = inventory.find((p) => p.id === params.productId);
    if (!product) throw notFound();
    return { product };
  },
  component: ProductoDetalle,
  notFoundComponent: () => (
    <AppShell greeting="Producto no encontrado">
      <Card>
        <p className="text-sm text-muted-foreground">
          Este SKU ya no está disponible o fue eliminado.
        </p>
        <Link to="/inventario" className="mt-3 inline-block text-[12px] font-medium text-primary">
          ← Volver al inventario
        </Link>
      </Card>
    </AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell greeting="Algo salió mal">
      <Card>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </Card>
    </AppShell>
  ),
});

const forecastData = [
  { d: "Lun", real: 22 },
  { d: "Mar", real: 28 },
  { d: "Mié", real: 34 },
  { d: "Jue", real: 30, forecast: 30 },
  { d: "Vie", forecast: 42 },
  { d: "Sáb", forecast: 55 },
  { d: "Dom", forecast: 48 },
];

function ProductoDetalle() {
  const { product: p } = Route.useLoaderData();

  return (
    <AppShell>
      <Link
        to="/inventario"
        className="mb-3 inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Inventario
      </Link>

      {/* Hero */}
      <Card className="sl-fade-up">
        <div className="grid aspect-[5/3] w-full place-items-center rounded-xl bg-gradient-to-br from-accent to-card text-6xl">
          {p.image}
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-mono text-muted-foreground">{p.sku}</p>
            <h2 className="mt-0.5 text-[18px] font-semibold tracking-tight text-foreground">
              {p.name}
            </h2>
            <p className="text-[12px] text-muted-foreground">{p.category}</p>
          </div>
          <StatusPill
            label={p.status === "danger" ? "Riesgo" : p.status === "warning" ? "Lento" : "Saludable"}
            tone={p.status}
          />
        </div>
      </Card>

      {/* AI recommendation */}
      <Card className="mt-4 border-l-2 border-l-primary bg-primary/[0.04] sl-fade-up">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              Recomendación IA
            </p>
            <p className="mt-0.5 text-[13px] font-semibold text-foreground">
              Recomendamos reabastecer este producto en {p.days} días.
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              Con la tasa de venta actual, el stock llegará a cero antes del próximo ciclo. Pide{" "}
              <span className="text-foreground">60 unidades</span> para mantener cobertura de 30 días.
            </p>
            <button className="mt-2 inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
              Generar orden de compra
            </button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Stock</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{p.stock}</p>
          <p className="text-[10px] text-muted-foreground">min {p.min}</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Margen</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{p.margin}%</p>
          <Delta value={2.1} />
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Rotación</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{p.rotation}</p>
          <p className="text-[10px] text-muted-foreground">{p.days}d</p>
        </Card>
      </div>

      {/* Sales history */}
      <Card className="mt-4 sl-fade-up">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">Historial de ventas</h3>
            <p className="text-[11px] text-muted-foreground">Últimos 7 días</p>
          </div>
          <Delta value={p.status === "danger" ? -18 : 12} />
        </div>
        <div className="h-16">
          <Sparkline data={p.trend} tone={p.status === "danger" ? "danger" : "primary"} />
        </div>
      </Card>

      {/* Forecast */}
      <Card className="mt-4 sl-fade-up">
        <h3 className="text-[14px] font-semibold text-foreground">Predicción de demanda</h3>
        <p className="text-[11px] text-muted-foreground">Línea sólida: real · punteada: forecast IA</p>
        <div className="mt-3">
          <ForecastLine data={forecastData} />
        </div>
      </Card>

      {/* Movements */}
      <Card className="mt-4 sl-fade-up">
        <h3 className="mb-3 text-[14px] font-semibold text-foreground">Movimientos recientes</h3>
        <ul className="space-y-3">
          {[
            { icon: Package, label: "Entrada · proveedor A", qty: "+40", time: "Ayer 14:20" },
            { icon: TrendingUp, label: "Venta · Sucursal Centro", qty: "-12", time: "Hoy 11:05" },
            { icon: AlertTriangle, label: "Ajuste · merma reportada", qty: "-2", time: "Hoy 09:48" },
          ].map((m, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="grid size-8 place-items-center rounded-lg bg-accent text-muted-foreground">
                <m.icon className="size-4" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] text-foreground">{m.label}</p>
                <p className="text-[10px] text-muted-foreground">{m.time}</p>
              </div>
              <span className="font-mono text-[12px] text-foreground">{m.qty}</span>
            </li>
          ))}
        </ul>
      </Card>
    </AppShell>
  );
}