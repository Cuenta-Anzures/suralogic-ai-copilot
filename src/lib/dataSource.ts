// Capa de datos de Flux Ops AI Copilot.
//
// Hoy: carga CSVs en /public/data/ y deriva todas las métricas en memoria.
// Mañana: el mismo BusinessSnapshot puede provenir de Firestore.
//   /businesses/{businessId}/{products|inventory|sales|tickets|staff}

import { parseCSV, parseFlexDate, num } from "@/lib/csv";
import { isFirebaseConfigured } from "@/lib/firebase";

// ============================================================
// Tipos crudos (espejan los CSV)
// ============================================================

export type Product = {
  id: string;
  nombre: string;
  precio: number;
  image_url: string;
};

export type InventoryItem = {
  id: string;
  nombre: string;
  unidad: string;
  talla: string;
  stock_actual: number;
  stock_minimo: number;
};

export type Sale = {
  id: string;
  ticket_id: string;
  product_id: string;
  product_nombre: string;
  staff_id: string;
  staff_nombre: string;
  cantidad: number;
  total: number;
  payment_method: string;
  created_at: Date | null;
};

export type Ticket = {
  id: string;
  total: number;
  items_count: number;
  payment_method: string;
  staff_id: string;
  staff_name: string;
  customer_name: string;
  is_delivery: boolean;
  created_at: Date | null;
};

export type StaffMember = {
  id: string;
  username: string;
  nombre: string;
  rol: string;
  activo: boolean;
};

// ============================================================
// Métricas derivadas
// ============================================================

export type KpiCard = {
  key: string;
  label: string;
  value: string;
  suffix: string;
  delta: number;
  spark: number[];
  tone: "primary" | "danger" | "muted";
};

export type MonthBucket = { mes: string; total: number };
export type StaffMetric = {
  staff_id: string;
  staff_nombre: string;
  total: number;
  operaciones: number;
  ticket_promedio: number;
  share: number;
  trend: number[];
};
export type ProductMetric = {
  id: string;
  nombre: string;
  unidades: number;
  total: number;
  operaciones: number;
  share: number;
};
export type InventoryAlert = {
  id: string;
  nombre: string;
  talla: string;
  stock_actual: number;
  stock_minimo: number;
  faltante: number;
};
export type Insight = {
  id: string;
  tone: "success" | "danger" | "warning" | "neutral";
  badge: string;
  title: string;
  body: string;
  action: string;
};

export type BusinessSnapshot = {
  businessId: string;
  businessName: string;
  // raw
  products: Product[];
  inventory: InventoryItem[];
  sales: Sale[];
  tickets: Ticket[];
  staff: StaffMember[];
  // derived
  kpis: KpiCard[];
  ingresosPorMes: MonthBucket[];
  forecast: { d: string; real?: number; forecast?: number }[];
  ventasPorStaff: StaffMetric[];
  topProductos: ProductMetric[];
  ventasPorMetodoPago: { metodo: string; total: number; share: number }[];
  alertasStock: InventoryAlert[];
  insights: Insight[];
  healthScore: number;
};

export type BusinessSummary = {
  id: string;
  name: string;
  initials: string;
  meta: string;
  slug?: string;
  isAggregate?: boolean;
};

// ============================================================
// Carga de CSVs
// ============================================================

async function fetchCSV(path: string): Promise<Record<string, string>[]> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo cargar ${path}`);
  return parseCSV(await res.text());
}

async function loadFromCsv(slug: string): Promise<{
  products: Product[];
  inventory: InventoryItem[];
  sales: Sale[];
  tickets: Ticket[];
  staff: StaffMember[];
}> {
  const base = `/data/empresas/${slug}`;
  const [products, inventory, sales, tickets, staff] = await Promise.all([
    fetchCSV(`${base}/products.csv`),
    fetchCSV(`${base}/inventory.csv`),
    fetchCSV(`${base}/sales.csv`),
    fetchCSV(`${base}/tickets.csv`),
    fetchCSV(`${base}/staff.csv`),
  ]);

  return {
    products: products.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      precio: num(r.precio),
      image_url: r.image_url ?? "",
    })),
    inventory: inventory.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      unidad: r.unidad,
      talla: r.talla,
      stock_actual: num(r.stock_actual),
      stock_minimo: num(r.stock_minimo),
    })),
    sales: sales.map((r) => ({
      id: r.id,
      ticket_id: r.ticket_id,
      product_id: r.product_id,
      product_nombre: r.product_nombre,
      staff_id: r.staff_id,
      staff_nombre: r.staff_nombre,
      cantidad: num(r.cantidad),
      total: num(r.total),
      payment_method: r.payment_method,
      created_at: parseFlexDate(r.created_at),
    })),
    tickets: tickets.map((r) => ({
      id: r.id,
      total: num(r.total),
      items_count: num(r.items_count),
      payment_method: r.payment_method,
      staff_id: r.staff_id,
      staff_name: r.staff_name,
      customer_name: r.customer_name,
      is_delivery: r.is_delivery === "1" || r.is_delivery?.toLowerCase() === "true",
      created_at: parseFlexDate(r.created_at),
    })),
    staff: staff.map((r) => ({
      id: r.id,
      username: r.username,
      nombre: r.nombre,
      rol: r.rol,
      activo: (r.activo ?? "").toLowerCase() === "true",
    })),
  };
}

// ============================================================
// Métricas derivadas
// ============================================================

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function fmtMoney(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key: string): string {
  const [, m] = key.split("-");
  return MONTHS[parseInt(m, 10) - 1] ?? key;
}

function buildSnapshot(raw: Awaited<ReturnType<typeof loadFromCsv>>, businessName: string): BusinessSnapshot {
  const { products, inventory, sales, tickets, staff } = raw;

  const validSales = sales.filter((s) => s.created_at);
  // --- Ingresos por mes ---
  const monthMap = new Map<string, number>();
  for (const s of validSales) {
    const k = monthKey(s.created_at!);
    monthMap.set(k, (monthMap.get(k) ?? 0) + s.total);
  }
  const monthKeys = [...monthMap.keys()].sort();
  const ingresosPorMes: MonthBucket[] = monthKeys.map((k) => ({
    mes: monthLabel(k),
    total: monthMap.get(k) ?? 0,
  }));

  const facturadoTotal = validSales.reduce((a, s) => a + s.total, 0);
  const ticketsValid = tickets.filter((t) => t.created_at);
  const ticketsTotal = ticketsValid.reduce((a, t) => a + t.total, 0);
  const operaciones = validSales.length;
  const ticketPromedio = ticketsValid.length ? ticketsTotal / ticketsValid.length : 0;

  // delta mes a mes
  const last = ingresosPorMes.at(-1)?.total ?? 0;
  const prev = ingresosPorMes.at(-2)?.total ?? 0;
  const monthlyDelta = prev ? ((last - prev) / prev) * 100 : 0;

  // --- Ventas por staff ---
  const staffMap = new Map<string, { id: string; nombre: string; total: number; count: number; perMonth: Map<string, number> }>();
  for (const s of validSales) {
    const key = s.staff_id || s.staff_nombre;
    if (!staffMap.has(key)) {
      staffMap.set(key, { id: s.staff_id, nombre: s.staff_nombre, total: 0, count: 0, perMonth: new Map() });
    }
    const item = staffMap.get(key)!;
    item.total += s.total;
    item.count += 1;
    const mk = monthKey(s.created_at!);
    item.perMonth.set(mk, (item.perMonth.get(mk) ?? 0) + s.total);
  }
  const ventasPorStaff: StaffMetric[] = [...staffMap.values()]
    .map((m) => ({
      staff_id: m.id,
      staff_nombre: m.nombre,
      total: m.total,
      operaciones: m.count,
      ticket_promedio: m.count ? m.total / m.count : 0,
      share: facturadoTotal ? (m.total / facturadoTotal) * 100 : 0,
      trend: monthKeys.map((k) => m.perMonth.get(k) ?? 0),
    }))
    .sort((a, b) => b.total - a.total);

  // --- Top productos ---
  const prodMap = new Map<string, { nombre: string; total: number; cantidad: number; count: number }>();
  for (const s of validSales) {
    const key = s.product_id || s.product_nombre;
    if (!prodMap.has(key)) prodMap.set(key, { nombre: s.product_nombre, total: 0, cantidad: 0, count: 0 });
    const it = prodMap.get(key)!;
    it.total += s.total;
    it.cantidad += s.cantidad;
    it.count += 1;
  }
  const topProductos: ProductMetric[] = [...prodMap.entries()]
    .map(([id, v]) => ({
      id,
      nombre: v.nombre,
      unidades: v.cantidad,
      total: v.total,
      operaciones: v.count,
      share: facturadoTotal ? (v.total / facturadoTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // --- Métodos de pago ---
  const payMap = new Map<string, number>();
  for (const s of validSales) {
    const m = (s.payment_method || "otro").toLowerCase();
    // normalizar errores comunes (ej. "tareta")
    const norm = m.startsWith("tarj") || m === "tareta" ? "tarjeta" : m;
    payMap.set(norm, (payMap.get(norm) ?? 0) + s.total);
  }
  const ventasPorMetodoPago = [...payMap.entries()]
    .map(([metodo, total]) => ({
      metodo,
      total,
      share: facturadoTotal ? (total / facturadoTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // --- Alertas de stock ---
  const alertasStock: InventoryAlert[] = inventory
    .filter((i) => i.stock_actual <= i.stock_minimo)
    .map((i) => ({
      id: i.id,
      nombre: i.nombre,
      talla: i.talla,
      stock_actual: i.stock_actual,
      stock_minimo: i.stock_minimo,
      faltante: Math.max(0, i.stock_minimo - i.stock_actual),
    }))
    .sort((a, b) => b.faltante - a.faltante);

  // --- Forecast lineal simple sobre últimos 3 meses ---
  const forecast: { d: string; real?: number; forecast?: number }[] = [];
  const tail = ingresosPorMes.slice(-6);
  for (const m of tail) forecast.push({ d: m.mes, real: Math.round(m.total / 1000) });
  if (tail.length >= 2) {
    const xs = tail.map((_, i) => i);
    const ys = tail.map((m) => m.total);
    const n = xs.length;
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;
    const num1 = xs.reduce((a, x, i) => a + (x - meanX) * (ys[i] - meanY), 0);
    const den = xs.reduce((a, x) => a + (x - meanX) ** 2, 0) || 1;
    const slope = num1 / den;
    const intercept = meanY - slope * meanX;
    const lastKey = monthKeys.at(-1);
    let lastMonthIdx = lastKey ? parseInt(lastKey.split("-")[1], 10) - 1 : new Date().getMonth();
    for (let step = 1; step <= 3; step++) {
      lastMonthIdx = (lastMonthIdx + 1) % 12;
      const proj = Math.max(0, intercept + slope * (xs.length - 1 + step));
      forecast.push({ d: MONTHS[lastMonthIdx], forecast: Math.round(proj / 1000) });
    }
    // Conectar línea real → forecast
    if (forecast.length > tail.length) {
      forecast[tail.length - 1].forecast = forecast[tail.length - 1].real;
    }
  }

  // --- KPIs ---
  const sparkMonths = ingresosPorMes.slice(-7).map((m) => Math.round(m.total / 1000));
  const sparkOps = (() => {
    const opMap = new Map<string, number>();
    for (const s of validSales) opMap.set(monthKey(s.created_at!), (opMap.get(monthKey(s.created_at!)) ?? 0) + 1);
    return monthKeys.slice(-7).map((k) => opMap.get(k) ?? 0);
  })();

  const kpis: KpiCard[] = [
    {
      key: "ingresos",
      label: "Ingresos",
      value: fmtMoney(facturadoTotal),
      suffix: `${operaciones} operaciones`,
      delta: Number(monthlyDelta.toFixed(1)),
      spark: sparkMonths.length ? sparkMonths : [0],
      tone: "primary",
    },
    {
      key: "ticket_promedio",
      label: "Ticket promedio",
      value: fmtMoney(ticketPromedio),
      suffix: `${ticketsValid.length} tickets`,
      delta: 0,
      spark: sparkMonths,
      tone: "primary",
    },
    {
      key: "productos_activos",
      label: "Productos vendidos",
      value: String(topProductos.length),
      suffix: `de ${products.length} en catálogo`,
      delta: 0,
      spark: sparkOps,
      tone: "primary",
    },
    {
      key: "alertas",
      label: "Alertas de stock",
      value: String(alertasStock.length),
      suffix: alertasStock.length ? "requieren reposición" : "todo en orden",
      delta: alertasStock.length ? -alertasStock.length : 0,
      spark: sparkMonths.map((v) => Math.max(0, 100 - v)),
      tone: alertasStock.length ? "danger" : "primary",
    },
  ];

  // --- Health score ---
  const stockHealth = inventory.length
    ? 100 - (alertasStock.length / inventory.length) * 100
    : 100;
  const trendHealth = monthlyDelta >= 0 ? 100 : Math.max(0, 100 + monthlyDelta);
  const diversificacion = topProductos.length >= 5 ? 100 : (topProductos.length / 5) * 100;
  const healthScore = Math.round((stockHealth * 0.4 + trendHealth * 0.4 + diversificacion * 0.2));

  // --- Insights automáticos ---
  const insights: Insight[] = [];
  if (alertasStock.length) {
    const top = alertasStock[0];
    insights.push({
      id: "ins-stock",
      tone: "danger",
      badge: "Stock",
      title: `${alertasStock.length} ${alertasStock.length === 1 ? "producto" : "productos"} bajo el mínimo`,
      body: `${top.nombre}${top.talla && top.talla !== "Unitalla" ? ` · talla ${top.talla}` : ""} tiene ${top.stock_actual} unidades (mínimo ${top.stock_minimo}). Programa reposición.`,
      action: "Ver inventario",
    });
  }
  if (topProductos.length) {
    const top = topProductos[0];
    insights.push({
      id: "ins-top",
      tone: "success",
      badge: "Top venta",
      title: `${top.nombre} lidera con ${top.share.toFixed(0)}% del ingreso`,
      body: `Generó ${fmtMoney(top.total)} en ${top.operaciones} operaciones. Considera asegurar su disponibilidad.`,
      action: "Ver detalle",
    });
  }
  if (ventasPorStaff.length >= 2) {
    const best = ventasPorStaff[0];
    const worst = ventasPorStaff[ventasPorStaff.length - 1];
    if (best.total > worst.total * 1.3) {
      insights.push({
        id: "ins-staff",
        tone: "warning",
        badge: "Personal",
        title: `${best.staff_nombre} vende ${(best.total / Math.max(worst.total, 1)).toFixed(1)}× más que ${worst.staff_nombre}`,
        body: `Diferencia de ${fmtMoney(best.total - worst.total)} entre el mejor y el más bajo. Refuerza capacitación o redistribuye horarios.`,
        action: "Ver personal",
      });
    }
  }
  if (monthlyDelta < -5) {
    insights.push({
      id: "ins-trend",
      tone: "danger",
      badge: "Tendencia",
      title: `Ingresos cayeron ${Math.abs(monthlyDelta).toFixed(1)}% vs mes previo`,
      body: `Revisa promociones activas, métodos de pago y disponibilidad de productos top.`,
      action: "Analizar",
    });
  } else if (monthlyDelta > 10) {
    insights.push({
      id: "ins-trend",
      tone: "success",
      badge: "Tendencia",
      title: `Crecimiento de ${monthlyDelta.toFixed(1)}% mes a mes`,
      body: `Asegura inventario suficiente del producto top y mantén el momentum operativo.`,
      action: "Proyectar",
    });
  }

  return {
    businessId: "default",
    businessName,
    products,
    inventory,
    sales,
    tickets,
    staff,
    kpis,
    ingresosPorMes,
    forecast,
    ventasPorStaff,
    topProductos,
    ventasPorMetodoPago,
    alertasStock,
    insights,
    healthScore,
  };
}

// ============================================================
// API pública
// ============================================================

export const ALL_BUSINESSES_ID = "all";

let businessIndexCache: BusinessSummary[] | null = null;

async function loadBusinessIndex(): Promise<BusinessSummary[]> {
  if (businessIndexCache) return businessIndexCache;
  const res = await fetch("/data/empresas/index.json", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar /data/empresas/index.json");
  const json = (await res.json()) as { businesses: BusinessSummary[] };
  businessIndexCache = json.businesses;
  return businessIndexCache;
}

export async function listBusinesses(): Promise<BusinessSummary[]> {
  if (isFirebaseConfigured) {
    // TODO: leer /businesses
  }
  const list = await loadBusinessIndex();
  return [
    { id: ALL_BUSINESSES_ID, slug: ALL_BUSINESSES_ID, name: "Todos los negocios", initials: "··", meta: "Vista consolidada", isAggregate: true },
    ...list,
  ];
}

export async function getBusinessSnapshot(businessId: string): Promise<BusinessSnapshot> {
  if (isFirebaseConfigured) {
    // TODO: leer colecciones Firestore y construir snapshot
  }
  const list = await loadBusinessIndex();

  if (businessId === ALL_BUSINESSES_ID) {
    const all = await Promise.all(list.map((b) => loadFromCsv(b.slug ?? b.id)));
    const merged = {
      products: [] as Product[],
      inventory: [] as InventoryItem[],
      sales: [] as Sale[],
      tickets: [] as Ticket[],
      staff: [] as StaffMember[],
    };
    list.forEach((b, idx) => {
      const raw = all[idx];
      const prefix = (b.slug ?? b.id) + ":";
      merged.products.push(...raw.products.map((p) => ({ ...p, id: prefix + p.id })));
      merged.inventory.push(...raw.inventory.map((i) => ({ ...i, id: prefix + i.id })));
      merged.sales.push(
        ...raw.sales.map((s) => ({
          ...s,
          id: prefix + s.id,
          ticket_id: prefix + s.ticket_id,
          product_id: prefix + s.product_id,
          staff_id: prefix + s.staff_id,
        })),
      );
      merged.tickets.push(...raw.tickets.map((t) => ({ ...t, id: prefix + t.id })));
      merged.staff.push(...raw.staff.map((m) => ({ ...m, id: prefix + m.id })));
    });
    const snap = buildSnapshot(merged, "Todos los negocios");
    snap.businessId = ALL_BUSINESSES_ID;
    return snap;
  }

  const meta = list.find((b) => b.id === businessId);
  if (!meta) throw new Error(`Negocio no encontrado: ${businessId}`);
  const raw = await loadFromCsv(meta.slug ?? meta.id);
  const snap = buildSnapshot(raw, meta.name);
  snap.businessId = meta.id;
  return snap;
}

// Contexto enviado al Copiloto IA — métricas agregadas, sin registros crudos.
export function buildAiContext(snapshot: BusinessSnapshot) {
  return {
    negocio: snapshot.businessName,
    health_score: snapshot.healthScore,
    kpis: snapshot.kpis.map((k) => ({ label: k.label, value: k.value, delta: k.delta, detalle: k.suffix })),
    ingresos_por_mes: snapshot.ingresosPorMes,
    forecast_proximos_meses: snapshot.forecast.filter((f) => f.forecast != null),
    top_productos: snapshot.topProductos.slice(0, 5),
    ventas_por_staff: snapshot.ventasPorStaff.map((s) => ({
      nombre: s.staff_nombre,
      total: s.total,
      operaciones: s.operaciones,
      ticket_promedio: Math.round(s.ticket_promedio),
      share_pct: Number(s.share.toFixed(1)),
    })),
    metodos_pago: snapshot.ventasPorMetodoPago,
    alertas_stock: snapshot.alertasStock,
    insights_actuales: snapshot.insights.map((i) => ({ tema: i.badge, hallazgo: i.title, detalle: i.body })),
  };
}