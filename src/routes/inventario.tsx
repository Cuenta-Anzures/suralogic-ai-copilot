import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/suralogic/AppShell";
import { Card, StatusPill } from "@/components/suralogic/primitives";
import { Sparkline } from "@/components/suralogic/charts";
import { inventory } from "@/data/mockData";
import { Search, SlidersHorizontal, LayoutGrid, List } from "lucide-react";

export const Route = createFileRoute("/inventario")({
  head: () => ({
    meta: [
      { title: "Inventario inteligente · Suralogic" },
      {
        name: "description",
        content:
          "Stock, rotación, márgenes y alertas de desabasto por producto con indicadores visuales.",
      },
    ],
  }),
  component: Inventario,
});

const chips = ["Todos", "Riesgo", "Lento", "Saludable"];

function Inventario() {
  const [chip, setChip] = useState("Todos");
  const [view, setView] = useState<"cards" | "list">("cards");

  const filtered = inventory.filter((p) => {
    if (chip === "Todos") return true;
    if (chip === "Riesgo") return p.status === "danger";
    if (chip === "Lento") return p.status === "warning";
    if (chip === "Saludable") return p.status === "success";
    return p.category === chip;
  });

  return (
    <AppShell
      greeting="Flota de equipos"
      subtitle="3 plataformas elevadoras · 1,448 días rentados acumulados · 1 equipo subutilizado."
    >
      {/* Search */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-card/70 px-3 py-2.5 ring-1 ring-border">
          <Search className="size-4 text-muted-foreground" />
          <input
            placeholder="Buscar equipo, MB…"
            className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <button
          aria-label="Filtros"
          className="grid size-11 place-items-center rounded-xl bg-card/70 text-muted-foreground ring-1 ring-border"
        >
          <SlidersHorizontal className="size-4" />
        </button>
        <button
          aria-label="Cambiar vista"
          onClick={() => setView((v) => (v === "cards" ? "list" : "cards"))}
          className="grid size-11 place-items-center rounded-xl bg-card/70 text-muted-foreground ring-1 ring-border"
        >
          {view === "cards" ? <List className="size-4" /> : <LayoutGrid className="size-4" />}
        </button>
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

      <div className={view === "cards" ? "mt-4 space-y-3" : "mt-4 space-y-1.5"}>
        {filtered.map((p) =>
          view === "cards" ? (
            <Link
              key={p.id}
              to="/productos/$productId"
              params={{ productId: p.id }}
              className="block sl-fade-up"
            >
              <Card>
                <div className="flex items-center gap-3">
                  <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-accent text-2xl">
                    {p.image}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-foreground">{p.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{p.sku}</p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{p.category}</span>
                      <span>·</span>
                      <span>{p.days}d restantes</span>
                    </div>
                  </div>
                  <StatusPill
                    label={
                      p.status === "danger" ? "Riesgo" : p.status === "warning" ? "Lento" : "OK"
                    }
                    tone={p.status}
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border/60 pt-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Utiliz.</p>
                    <p className="text-[13px] font-semibold tabular-nums text-foreground">
                      {p.stock}%
                      <span className="text-[10px] font-normal text-muted-foreground"> / {p.min}%</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Días</p>
                    <p className="text-[13px] font-semibold tabular-nums text-foreground">
                      {p.days}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tendencia</p>
                    <Sparkline data={p.trend} tone={p.status === "danger" ? "danger" : "primary"} />
                  </div>
                </div>
              </Card>
            </Link>
          ) : (
            <Link
              key={p.id}
              to="/productos/$productId"
              params={{ productId: p.id }}
              className="flex items-center gap-3 rounded-xl bg-card/40 px-3 py-2 ring-1 ring-border sl-fade-up"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-accent text-base">
                {p.image}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{p.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {p.sku} · {p.stock}% utiliz.
                </p>
              </div>
              <StatusPill
                label={p.status === "danger" ? "!" : p.status === "warning" ? "~" : "✓"}
                tone={p.status}
              />
            </Link>
          ),
        )}
      </div>
    </AppShell>
  );
}