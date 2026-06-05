# Migración: TanStack Start (SSR) → Vite SPA + Capacitor

Este documento describe los pasos exactos para convertir esta app en una **SPA estática** empaquetable como app móvil **Android/iOS con Capacitor**, manteniendo el diseño, rutas y funcionalidades actuales.

> ⚠️ **Importante**: Estos cambios **rompen el preview de Lovable** (que depende de SSR + Cloudflare Workers). Ejecútalos en un **clon local del repo**, no aquí. Mantén el proyecto Lovable como "fuente de diseño" y haz la migración en una rama separada de tu repo Git.

---

## 0. Prerrequisitos

- Node.js 20+, npm o bun
- Android Studio (para Android) y/o Xcode (para iOS)
- JDK 17
- Clonar el repo del proyecto Lovable localmente

---

## 1. Resumen de qué cambia

| Capa | Antes (Lovable) | Después (Capacitor) |
|---|---|---|
| Framework | TanStack **Start** (SSR) | TanStack **Router** (SPA) |
| Bundler | Vite + plugin Lovable + Cloudflare | Vite + `@vitejs/plugin-react` |
| Entry | `src/server.ts` (Worker fetch) | `index.html` + `src/main.tsx` |
| Routing | File-based con `shellComponent` | File-based con `<RouterProvider>` |
| Output | Cloudflare Worker bundle | `dist/` estático |
| Runtime | Workers (edge) | WebView nativa (Capacitor) |

**Qué se conserva sin cambios:**
- `src/components/**` (toda la UI shadcn + Suralogic)
- `src/data/mockData.ts`
- `src/styles.css` (Tailwind v4)
- `src/routes/index.tsx`, `analitica.tsx`, `insights.tsx`, `inventario.tsx`, `negocios.tsx`, `productos.$productId.tsx`
- `src/lib/utils.ts`
- `src/hooks/**`
- `tsconfig.json`, `components.json`

---

## 2. Archivos a BORRAR

```bash
rm src/server.ts
rm src/start.ts
rm src/lib/error-capture.ts
rm src/lib/error-page.ts
rm wrangler.jsonc
rm bunfig.toml          # opcional, específico de Lovable
rm -rf .lovable          # opcional
```

---

## 3. `package.json` — diff de dependencias

### Quitar
```bash
npm rm \
  @tanstack/react-start \
  @lovable.dev/vite-tanstack-config \
  @cloudflare/vite-plugin \
  wrangler \
  nitro
```

### Añadir
```bash
npm i -D @vitejs/plugin-react vite-tsconfig-paths
npm i @capacitor/core @capacitor/app @capacitor/haptics @capacitor/status-bar
npm i -D @capacitor/cli @capacitor/android @capacitor/ios
```

**Mantener** (ya están): `@tanstack/react-router`, `@tanstack/router-plugin`, `@tanstack/react-query`, `react`, `react-dom`, `tailwindcss`, `@tailwindcss/vite`, todo `@radix-ui/*`, `lucide-react`, etc.

### Scripts nuevos
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "cap:sync": "npm run build && npx cap sync",
    "cap:android": "npm run cap:sync && npx cap open android",
    "cap:ios": "npm run cap:sync && npx cap open ios"
  }
}
```

---

## 4. `vite.config.ts` — reemplazar TODO el archivo

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2020",
  },
  server: { port: 5173 },
});
```

---

## 5. `index.html` — crear en la raíz

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#0f0f12" />
    <title>Suralogic Insights</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 6. `src/main.tsx` — crear

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  // Capacitor sirve desde file:// — usar memory history evita problemas con hash routes
  // (TanStack Router por defecto usa browser history, lo cual funciona en WebView moderna).
});

declare module "@tanstack/react-router" {
  interface Register { router: typeof router; }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
```

Borra el viejo `src/router.tsx` (la lógica vive ahora en `main.tsx`).

---

## 7. `src/routes/__root.tsx` — simplificar (sin HTML shell)

Reemplaza TODO el archivo por:

```tsx
import { Outlet, Link, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Página no encontrada</p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Algo salió mal</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => <Outlet />,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
```

**Quitamos**: `HeadContent`, `Scripts`, `shellComponent`, `head()`, `<html>/<body>`. En SPA, el shell vive en `index.html`.

---

## 8. `tsconfig.json` — verificar

Debe tener:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src", "vite.config.ts"]
}
```

---

## 9. Capacitor — inicialización

```bash
npm run build                       # genera dist/
npx cap init "Suralogic Insights" "com.suralogic.insights" --web-dir=dist
npx cap add android
npx cap add ios                     # solo en macOS
npx cap sync
npx cap open android
```

### `capacitor.config.ts` (se crea automáticamente, ajusta):

```ts
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.suralogic.insights",
  appName: "Suralogic Insights",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  android: { backgroundColor: "#0f0f12" },
  ios: { backgroundColor: "#0f0f12" },
};

export default config;
```

---

## 10. Ajustes específicos para WebView móvil

### 10.1 Safe areas (notch, barra de estado)

En `src/styles.css` añade:
```css
@supports (padding: env(safe-area-inset-top)) {
  body {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

### 10.2 Status bar nativa

En `src/main.tsx`, después del `createRoot(...)`:
```ts
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  StatusBar.setBackgroundColor({ color: "#0f0f12" }).catch(() => {});
}
```

### 10.3 Botón "atrás" de Android

```ts
import { App as CapApp } from "@capacitor/app";

if (Capacitor.isNativePlatform()) {
  CapApp.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) window.history.back();
    else CapApp.exitApp();
  });
}
```

---

## 11. Verificar el build

```bash
npm run build
ls dist/
# debe mostrar: index.html  assets/
```

Sirve localmente:
```bash
npm run preview      # http://localhost:4173
```

---

## 12. Datos dinámicos (opcional pero recomendado)

Para que la app pueda **actualizar datos sin recompilar**:

1. Mueve `src/data/mockData.ts` a `public/data.json`.
2. Reemplaza imports estáticos por:
   ```ts
   const REMOTE = "https://tu-api.com/data.json"; // o JSONBin, GitHub raw, Supabase, etc.
   export function useBusinessData() {
     return useQuery({
       queryKey: ["data"],
       queryFn: async () => {
         try {
           const r = await fetch(REMOTE, { cache: "no-store" });
           if (r.ok) return r.json();
         } catch {}
         // fallback al bundle local
         return fetch("/data.json").then(r => r.json());
       },
       staleTime: 5 * 60_000,
     });
   }
   ```

Así actualizas el JSON remoto y la app refresca sin pasar por Play Store.

---

## 13. Excel → JSON (script auxiliar)

Crea `scripts/xlsx-to-json.mjs`:
```js
import * as XLSX from "xlsx";
import fs from "node:fs";

const wb = XLSX.readFile(process.argv[2]);
const out = {};
for (const name of wb.SheetNames) {
  out[name] = XLSX.utils.sheet_to_json(wb.Sheets[name]);
}
fs.writeFileSync("public/data.json", JSON.stringify(out, null, 2));
console.log("✅ public/data.json generado");
```

Uso:
```bash
npm i -D xlsx
node scripts/xlsx-to-json.mjs ruta/al/archivo.xlsx
```

---

## 14. Checklist final

- [ ] Build local genera `dist/index.html` + `dist/assets/`
- [ ] `npm run preview` abre la app y navega entre rutas sin error
- [ ] `npx cap sync` no muestra errores
- [ ] App abre en emulador Android con `npx cap open android` → Run
- [ ] Bottom-nav funciona (Inicio / Equipos / IA / Flota / Análisis)
- [ ] Detalle `/productos/mb003` carga datos
- [ ] Safe-area visible en dispositivo con notch
- [ ] Botón atrás de Android funciona correctamente

---

## 15. Qué se migra automáticamente vs manual

| Parte | Migración |
|---|---|
| Componentes UI (shadcn, Suralogic) | ✅ Automática (copy-paste) |
| Rutas `src/routes/*` | ✅ Automática (funcionan igual en TanStack Router puro) |
| Estilos Tailwind + tokens oklch | ✅ Automática |
| Mock data | ✅ Automática (o migrar a `/data.json`) |
| `__root.tsx` | ⚠️ Manual (quitar shell SSR — ver §7) |
| Router bootstrap | ⚠️ Manual (`main.tsx` nuevo — ver §6) |
| `vite.config.ts` | ⚠️ Manual (reemplazo completo — ver §4) |
| Server functions / loaders con secrets | ❌ No aplica (la app no tiene) |
| SSR meta tags (`head()`) | ❌ Eliminar — usar `<title>` en `index.html` o `react-helmet-async` si se necesita dinámico |
| `process.env.*` server-side | ❌ No aplica (la app no tiene) |

---

## 16. Troubleshooting

**"Failed to fetch dynamically imported module" en Android**
→ Asegúrate de que `vite.config.ts` tenga `build.target: "es2020"` y que `capacitor.config.ts` use `webDir: "dist"`.

**Pantalla blanca al abrir en el emulador**
→ Revisa `chrome://inspect` en Chrome desktop con el emulador conectado. Casi siempre es una ruta absoluta `/something` que no resuelve en `file://`. Solución: en `vite.config.ts` añade `base: "./"`.

**Las rutas no funcionan al recargar**
→ Normal en SPA. Capacitor sirve `index.html` siempre, así que no debería pasar. Si pasa, fuerza memory history:
```ts
import { createMemoryHistory } from "@tanstack/react-router";
const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: ["/"] }) });
```

---

## 17. Siguiente paso recomendado

1. Clona el repo localmente.
2. Crea una rama `capacitor-migration`.
3. Aplica este documento paso a paso.
4. Mantén el proyecto Lovable como **mockup vivo** para iterar diseño rápido; cuando un cambio te gusta, lo portas a la rama Capacitor.

Listo. Con esto tienes app Android/iOS nativa con el mismo diseño que ves en Lovable hoy.