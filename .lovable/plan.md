# Multi-negocio para Flux Ops AI Copilot

Tu propuesta tiene mucho sentido y encaja con la arquitectura actual (la capa `dataSource` ya está pensada para mapearse 1:1 a `/businesses/{id}` de Firestore más adelante). Sólo ajusto un detalle: en `public/` los nombres de carpeta no deben tener espacios ni mayúsculas (el navegador puede romper el `fetch`). Usamos los nombres "bonitos" en la UI y `slugs` en disco.

## 1. Estructura de datos en disco

```
public/data/empresas/
├── gorras-mty/
│   ├── products.csv
│   ├── inventory.csv
│   ├── sales.csv
│   ├── tickets.csv
│   └── staff.csv
└── joyas-mty/
    ├── products.csv
    ├── inventory.csv
    ├── sales.csv
    ├── tickets.csv
    └── staff.csv
```

- **Gorras MTY**: se mueven los CSV actuales de `public/data/` a `public/data/empresas/gorras-mty/` (sin cambios de contenido).
- **Joyas MTY**: se generan CSV nuevos coherentes (anillos, aretes, collares, pulseras, dijes, cadenas, etc.), con su propio staff (ej. Sofía, Andrea, Patricia, Roberto) y tickets con la misma estructura, pero precios y categorías de joyería.
- Se deja un `public/data/empresas/index.json` con la lista de negocios disponibles (id, nombre, slug, color/iniciales) para no hardcodear nombres en el código.

## 2. Selector de negocio en la barra superior

La tarjeta actual "Mi negocio" se convierte en un dropdown real:

- **Todos los negocios** (vista consolidada) — opción por defecto.
- Gorras MTY
- Joyas MTY

El selector queda en el mismo lugar que la captura que mandaste (debajo del header), abre un menú flotante con las opciones y persiste la elección en `localStorage` (`fluxops.activeBusiness`).

## 3. Cambios en la capa de datos (`src/lib/dataSource.ts`)

- `listBusinesses()` lee `public/data/empresas/index.json` en lugar del array hardcodeado.
- `getBusinessSnapshot(businessId)`:
  - Si `businessId === "all"` → carga los CSV de **todos** los negocios, los concatena (agregando un campo `business_id` y prefijando ids para evitar colisiones) y construye un único `BusinessSnapshot` consolidado llamado "Todos los negocios".
  - Si es un negocio específico → carga sólo los CSV de esa carpeta (`/data/empresas/{slug}/*.csv`).
- Se añade contexto de negocio activo (`BusinessContext` ligero o se mete dentro de `useSnapshot`) para que cualquier pantalla (Inicio, Inventario, Análisis, Personal, Copiloto) recargue al cambiar.
- El Copiloto IA: cuando es "Todos" el `buildAiContext` incluye un desglose por negocio (ingresos, top productos, alertas) además del total, para que pueda comparar.

## 4. Login y staff multi-negocio

Hoy `auth.tsx` valida contra un único `staff.csv`. Lo extendemos así:

- `verifyAgainstStaff` recorre los `staff.csv` de **todos los negocios** y devuelve además a qué negocio(s) pertenece el usuario.
- El admin (`Admin/Admin`) se considera global → puede ver "Todos".
- Un vendedor normal sólo ve su negocio (el selector se filtra para ese usuario).

## 5. UI — cambios concretos

- `AppShell.tsx`: el botón "Mi negocio" se vuelve un `<Popover>` (shadcn) con la lista, badge "Activo", e iniciales por negocio. Muestra el negocio activo y, si es "Todos", una etiqueta especial ("Consolidado").
- Pantallas existentes no requieren cambios funcionales: ya consumen `useSnapshot`, sólo cambia el `businessId` que reciben del contexto.
- `Inicio`: cuando es "Todos", añade una mini-tabla "Desempeño por negocio" arriba (ingresos, ticket promedio, alertas) para no perder visibilidad de cada uno.

## Detalles técnicos

- Nuevos archivos: `public/data/empresas/index.json`, `public/data/empresas/gorras-mty/*.csv` (movidos), `public/data/empresas/joyas-mty/*.csv` (nuevos), `src/lib/businessContext.tsx`.
- Modificados: `src/lib/dataSource.ts` (multi-load + consolidación), `src/lib/auth.tsx` (staff multi-negocio), `src/components/suralogic/AppShell.tsx` (selector), `src/components/suralogic/hooks.ts` (hook `useActiveBusiness`), `src/routes/__root.tsx` (provider), `src/routes/index.tsx` (tabla desempeño por negocio sólo en modo "Todos"), `src/lib/ollama.ts` / `buildAiContext` (desglose por negocio).
- Compatible con la futura migración a Firestore: el switch de carpeta = el switch de `businessId` en `/businesses/{id}/...`.

## Lo que NO se toca

- Diseño, colores, tipografías y disposición general.
- Lógica de KPIs, forecast, health score, insights — sólo se alimentan con datos del negocio activo (o el consolidado).
- Rutas, navegación inferior y autenticación base.
