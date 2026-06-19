import { Link, useLocation } from "@tanstack/react-router";
import { Home, Package, Users, BarChart3, Search, Bell, ChevronDown, MessageSquare, LogOut, Check, Layers } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { useBusinesses } from "@/components/suralogic/hooks";
import { useActiveBusiness, ALL_BUSINESSES_ID } from "@/lib/businessContext";

const navItems = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/inventario", label: "Inventario", icon: Package },
  { to: "/copiloto", label: "Copiloto", icon: MessageSquare, primary: true },
  { to: "/analitica", label: "Análisis", icon: BarChart3 },
  { to: "/equipo", label: "Personal", icon: Users },
];

export function AppShell({
  children,
  greeting,
  subtitle,
}: {
  children: ReactNode;
  greeting?: string;
  subtitle?: string;
}) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { data: businesses } = useBusinesses();
  const { activeId, setActiveId } = useActiveBusiness();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const active =
    businesses?.find((b) => b.id === activeId) ?? businesses?.[0];

  const initials = (user?.nombre ?? "?")
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="relative grid size-8 place-items-center rounded-lg bg-primary shadow-[0_0_24px_-6px_var(--primary)]">
              <div className="size-3 rounded-sm bg-background" />
              <span
                className="absolute -right-0.5 -top-0.5 size-2 rounded-full ring-2 ring-background"
                style={{ background: "var(--owner)" }}
                aria-hidden
              />
            </div>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold tracking-tight text-foreground">Flux Ops</p>
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  AI Copilot
                </p>
                <span
                  className="rounded-sm px-1 py-px text-[8px] font-bold uppercase tracking-wider"
                  style={{
                    color: "var(--owner)",
                    background: "color-mix(in oklab, var(--owner) 14%, transparent)",
                  }}
                >
                  {user?.rol ?? "Owner"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              aria-label="Buscar"
              className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Search className="size-[18px]" />
            </button>
            <button
              aria-label="Notificaciones"
              className="relative grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Bell className="size-[18px]" />
              <span
                className="absolute right-2 top-2 size-1.5 rounded-full ring-2 ring-background sl-pulse"
                style={{ background: "var(--owner)" }}
              />
            </button>
            <button
              onClick={logout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="ml-1 grid size-8 place-items-center rounded-full bg-accent text-[11px] font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {initials || <LogOut className="size-4" />}
            </button>
          </div>
        </div>

        {/* Business selector */}
        <div className="mx-auto max-w-2xl px-4 pb-3">
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl bg-card/70 px-3.5 py-2.5 text-left ring-1 ring-border transition-colors hover:bg-card"
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={
                    "grid size-7 place-items-center rounded-md text-[11px] font-bold " +
                    (active?.isAggregate
                      ? "bg-accent text-foreground"
                      : "bg-primary/15 text-primary")
                  }
                >
                  {active?.isAggregate ? <Layers className="size-3.5" /> : active?.initials ?? "··"}
                </span>
                <div className="leading-tight">
                  <p className="text-[13px] font-medium text-foreground">
                    {active?.name ?? "Selecciona negocio"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {active?.isAggregate
                      ? "Consolidado · todos los negocios"
                      : user
                      ? `Sesión · ${user.nombre}`
                      : active?.meta ?? "Datos en tiempo real"}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={
                  "size-4 text-muted-foreground transition-transform " +
                  (open ? "rotate-180" : "")
                }
              />
            </button>

            {open && businesses && (
              <div
                role="listbox"
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-border bg-popover shadow-lg shadow-black/30"
              >
                {businesses.map((b) => {
                  const sel = b.id === activeId;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        setActiveId(b.id);
                        setOpen(false);
                      }}
                      className={
                        "flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left transition-colors hover:bg-accent " +
                        (sel ? "bg-accent/60" : "")
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={
                            "grid size-7 place-items-center rounded-md text-[11px] font-bold " +
                            (b.isAggregate
                              ? "bg-accent text-foreground ring-1 ring-border"
                              : "bg-primary/15 text-primary")
                          }
                        >
                          {b.isAggregate ? <Layers className="size-3.5" /> : b.initials}
                        </span>
                        <div className="leading-tight">
                          <p className="text-[13px] font-medium text-foreground">{b.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {b.id === ALL_BUSINESSES_ID ? "Vista consolidada" : b.meta}
                          </p>
                        </div>
                      </div>
                      {sel && <Check className="size-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Optional greeting */}
      {(greeting || subtitle) && (
        <section className="mx-auto max-w-2xl px-4 pt-6 sl-fade-up">
          {greeting && (
            <h1 className="text-[26px] font-semibold tracking-tight text-foreground text-balance">
              {greeting}
            </h1>
          )}
          {subtitle && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground text-pretty">
              {subtitle}
            </p>
          )}
        </section>
      )}

      <main className="mx-auto max-w-2xl px-4 pb-32 pt-4">{children}</main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-around px-4 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            if (item.primary) {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="-mt-6 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background transition-transform active:scale-95"
                  aria-label={item.label}
                >
                  <Icon className="size-5" />
                </Link>
              );
            }
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-1 flex-col items-center gap-0.5 py-1.5"
              >
                <Icon
                  className={
                    "size-[20px] transition-colors " +
                    (active ? "text-foreground" : "text-muted-foreground")
                  }
                />
                <span
                  className={
                    "text-[10px] font-medium transition-colors " +
                    (active ? "text-foreground" : "text-muted-foreground")
                  }
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}