import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/suralogic/AppShell";
import { Card, StatusPill, SectionHeader } from "@/components/suralogic/primitives";
import { useActiveSnapshot, fmtCompact } from "@/components/suralogic/hooks";
import { ChevronLeft, Loader2, Package, Sparkles } from "lucide-react";

export const Route = createFileRoute("/productos/$productId")({
  head: ({ params }) => ({
    meta: [
      { title: `Producto ${params.productId} · Flux Ops` },
      { name: "description", content: "Detalle del producto, ventas y stock." },
    ],
  }),
  component: ProductoDetalle,
});

function ProductoDetalle() {
  const { productId } = Route.useParams();
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

  const invItems = snap.inventory.filter((i) => i.id === productId);
  const stockItem = invItems[0];
  const product = snap.products.find((p) => p.id === productId);
  const sales = snap.sales.filter((s) => s.product_id === productId);
  const metric = snap.topProductos.find((p) => p.id === productId);

  if (!stockItem && !product) {
    return (
      <AppShell greeting="Producto no encontrado">
        <Card>
          <p className="text-sm text-muted-foreground">No existe en el catálogo.</p>
          <Link to="/inventario" className="mt-3 inline-block text-[12px] font-medium text-primary">
            ← Volver al inventario
          </Link>
        </Card>
      </AppShell>
    );
  }

  const name = product?.nombre ?? stockItem?.nombre ?? "Producto";
  const danger = stockItem ? stockItem.stock_actual <= stockItem.stock_minimo : false;

  return (
    <AppShell>
      <Link
        to="/inventario"
        className="mb-3 inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Inventario
      </Link>

      <Card className="sl-fade-up">
        <div className="grid aspect-[5/3] w-full place-items-center rounded-xl bg-gradient-to-br from-accent to-card">
          <Package className="size-12 text-muted-foreground" />
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-mono text-muted-foreground">SKU {productId}</p>
            <h2 className="mt-0.5 text-[18px] font-semibold tracking-tight text-foreground">{name}</h2>
            {product && (
              <p className="text-[12px] text-muted-foreground">${product.precio.toLocaleString("es-MX")}</p>
            )}
          </div>
          {stockItem && (
            <StatusPill label={danger ? "Reponer" : "OK"} tone={danger ? "danger" : "success"} />
          )}
        </div>
      </Card>

      {metric && (
        <Card className="mt-4 border-l-2 border-l-primary bg-primary/[0.04] sl-fade-up">
          <div className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                Insight IA
              </p>
              <p className="mt-0.5 text-[13px] font-semibold text-foreground">
                {metric.share.toFixed(1)}% de los ingresos provienen de este producto.
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                {metric.unidades} unidades vendidas en {metric.operaciones} operaciones. Total: {fmtCompact(metric.total)}.
              </p>
            </div>
          </div>
        </Card>
      )}

      {invItems.length > 0 && (
        <Card className="mt-4 sl-fade-up">
          <SectionHeader title="Stock" hint={`${invItems.length} variante(s)`} />
          <div className="space-y-2">
            {invItems.map((i) => (
              <div key={`${i.id}-${i.talla}`} className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">Talla {i.talla || "Unitalla"}</span>
                <span className="font-mono tabular-nums text-foreground">
                  {i.stock_actual} / mín {i.stock_minimo}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-4 sl-fade-up">
        <SectionHeader title="Últimas ventas" hint={`${sales.length} en total`} />
        <ul className="space-y-2">
          {sales
            .slice()
            .sort((a, b) => (b.created_at?.getTime() ?? 0) - (a.created_at?.getTime() ?? 0))
            .slice(0, 8)
            .map((s) => (
              <li key={s.id} className="flex items-center justify-between text-[12px]">
                <div>
                  <p className="text-foreground">{s.staff_nombre}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {s.created_at?.toLocaleDateString("es-MX")} · {s.payment_method}
                  </p>
                </div>
                <span className="font-mono tabular-nums text-foreground">
                  ${s.total.toLocaleString("es-MX")}
                </span>
              </li>
            ))}
        </ul>
      </Card>
    </AppShell>
  );
}