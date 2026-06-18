import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/suralogic/AppShell";
import { Card, StatusPill } from "@/components/suralogic/primitives";
import { useBusinesses, useSnapshot } from "@/components/suralogic/hooks";
import { Search, Loader2, Package } from "lucide-react";

export const Route = createFileRoute("/inventario")({
  head: () => ({
    meta: [
      { title: "Inventario · Flux Ops" },
      { name: "description", content: "Stock actual, alertas de reposición y desempeño por producto." },
    ],
  }),
  component: Inventario,
});

const chips = ["Todos", "Riesgo", "Saludable"] as const;
type Chip = (typeof chips)[number];

function Inventario() {
  const { data: businesses } = useBusinesses();
  const { data: snap, isLoading } = useSnapshot(businesses?.[0]?.id);
  const [chip, setChip] = useState<Chip>("Todos");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    if (!snap) return [];
    return snap.inventory
      .map((i) => {
        const danger = i.stock_actual <= i.stock_minimo;
        return { ...i, danger };
      })
      .filter((i) => {
        if (chip === "Riesgo" && !i.danger) return false;
        if (chip === "Saludable" && i.danger) return false;
        if (query && !i.nombre.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      });
  }, [snap, chip, query]);

  return (
    <AppShell greeting="Inventario" subtitle="Stock actual, mínimos y alertas de reposición.">
      {/* Search */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-card/70 px-3 py-2.5 ring-1 ring-border">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto…"
            className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Chips */}
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => setChip(c)}
            className={
              "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors " +
              (chip === c
                ? "bg-primary text-primary-foreground"
                : "bg-card/70 text-muted-foreground ring-1 ring-border hover:text-foreground")
            }
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading || !snap ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {items.length === 0 && (
            <Card>
              <p className="text-[12px] text-muted-foreground">Sin resultados.</p>
            </Card>
          )}
          {items.map((p) => {
            const pct = p.stock_minimo ? Math.min(100, (p.stock_actual / Math.max(p.stock_minimo, 1)) * 100) : 100;
            const tone = p.danger ? "danger" : pct < 200 ? "warning" : "success";
            return (
              <Link
                key={p.id}
                to="/productos/$productId"
                params={{ productId: p.id }}
                className="block sl-fade-up"
              >
                <Card>
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-muted-foreground">
                      <Package className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-foreground">{p.nombre}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {p.unidad} · talla {p.talla || "Unitalla"}
                      </p>
                    </div>
                    <StatusPill
                      label={p.danger ? "Reponer" : "OK"}
                      tone={tone as "danger" | "warning" | "success"}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border/60 pt-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Stock</p>
                      <p className="text-[13px] font-semibold tabular-nums text-foreground">
                        {p.stock_actual}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Mínimo</p>
                      <p className="text-[13px] font-semibold tabular-nums text-foreground">
                        {p.stock_minimo}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Cobertura</p>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-accent">
                        <div
                          className={
                            "h-full " +
                            (p.danger ? "bg-destructive" : "bg-primary")
                          }
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}