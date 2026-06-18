import { useState } from "react";
import { Loader2, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await login(username, password);
    setSubmitting(false);
    if (!result.ok) setError(result.error);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 15% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%), radial-gradient(50% 50% at 100% 100%, color-mix(in oklab, var(--owner) 12%, transparent), transparent 70%)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-between px-6 py-10">
        {/* Header brand */}
        <header className="flex items-center gap-2.5">
          <div className="relative grid size-9 place-items-center rounded-xl bg-primary shadow-[0_0_28px_-6px_var(--primary)]">
            <div className="size-3.5 rounded-sm bg-background" />
            <span
              className="absolute -right-0.5 -top-0.5 size-2 rounded-full ring-2 ring-background"
              style={{ background: "var(--owner)" }}
              aria-hidden
            />
          </div>
          <div className="leading-tight">
            <p className="text-[14px] font-semibold tracking-tight">Flux Ops</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              AI Copilot
            </p>
          </div>
        </header>

        <main className="sl-fade-up">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="size-3" />
            Acceso seguro
          </div>
          <h1 className="mt-4 text-[28px] font-semibold leading-tight tracking-tight text-balance">
            Bienvenido a tu gerente digital
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            Inicia sesión para acceder a tus métricas, insights y al Copiloto IA de tu negocio.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Usuario
              </span>
              <input
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin"
                className="w-full rounded-xl bg-card/70 px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 ring-1 ring-border outline-none focus:ring-2 focus:ring-primary/60"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Contraseña
              </span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-card/70 px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 ring-1 ring-border outline-none focus:ring-2 focus:ring-primary/60"
              />
            </label>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-2.5 text-[12px] text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !username || !password}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[14px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-opacity disabled:opacity-50"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
              Iniciar sesión
            </button>
          </form>
        </main>

        <footer className="text-center text-[11px] text-muted-foreground">
          <p>
            Acceso únicamente para usuarios autorizados.
            <br />
            Preparado para Firebase Authentication.
          </p>
        </footer>
      </div>
    </div>
  );
}