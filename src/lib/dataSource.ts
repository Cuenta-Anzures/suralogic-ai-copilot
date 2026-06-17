// Capa de abstracción de datos.
//
// Suralogic Copilot NO captura datos. Los lee desde Flux Ops (Firebase).
// Estructura origen esperada:
//   /businesses/{businessId}/inventory
//   /businesses/{businessId}/products
//   /businesses/{businessId}/sales
//   /businesses/{businessId}/tickets
//
// Mientras Firebase no está configurado, devolvemos el mock local
// para que la UI funcione en desarrollo.

import {
  kpis,
  insights,
  hourly,
  heatmap,
  forecast,
  inventory,
  businesses,
  aiFeed,
  flujoCaja,
  socios,
  rentasRecientes,
  gastosCategoria,
} from "@/data/mockData";
import { isFirebaseConfigured } from "@/lib/firebase";

export type BusinessSummary = {
  id: string;
  name: string;
  initials: string;
  meta: string;
};

const mockBusinesses: BusinessSummary[] = [
  { id: "agla", name: "AGLA Plataformas", initials: "AG", meta: "3 equipos · 2 socios · 23–25" },
];

export type BusinessSnapshot = {
  kpis: typeof kpis;
  insights: typeof insights;
  hourly: typeof hourly;
  heatmap: typeof heatmap;
  forecast: typeof forecast;
  inventory: typeof inventory;
  businesses: typeof businesses;
  aiFeed: typeof aiFeed;
  flujoCaja: typeof flujoCaja;
  socios: typeof socios;
  rentasRecientes: typeof rentasRecientes;
  gastosCategoria: typeof gastosCategoria;
};

const mockSnapshot: BusinessSnapshot = {
  kpis,
  insights,
  hourly,
  heatmap,
  forecast,
  inventory,
  businesses,
  aiFeed,
  flujoCaja,
  socios,
  rentasRecientes,
  gastosCategoria,
};

export async function listBusinesses(): Promise<BusinessSummary[]> {
  if (isFirebaseConfigured) {
    // TODO: leer /businesses desde Firestore
    // const docs = await fetchCollection<BusinessSummary>("businesses");
    // return docs;
  }
  return mockBusinesses;
}

export async function getBusinessSnapshot(
  _businessId: string,
): Promise<BusinessSnapshot> {
  if (isFirebaseConfigured) {
    // TODO: leer sales, inventory, products, tickets desde Firestore
    // y construir el snapshot con métricas agregadas.
  }
  return mockSnapshot;
}

// Métricas agregadas que se envían como contexto al Copiloto IA.
// La IA NO ve registros crudos, solo este resumen.
export function buildAiContext(snapshot: BusinessSnapshot, businessName: string) {
  return {
    negocio: businessName,
    kpis: snapshot.kpis.map((k) => ({
      label: k.label,
      value: k.value,
      delta: k.delta,
      detalle: k.suffix,
    })),
    top_insights: snapshot.insights.map((i) => ({
      tema: i.badge,
      hallazgo: i.title,
      detalle: i.body,
    })),
    flujo_caja: snapshot.flujoCaja,
    inventario: snapshot.inventory.map((p) => ({
      sku: p.sku,
      nombre: p.name,
      utilizacion_pct: p.stock,
      rotacion: p.rotation,
      margen_pct: p.margin,
      estado: p.status,
    })),
    forecast: snapshot.forecast,
    gastos_por_categoria: snapshot.gastosCategoria,
  };
}