// AGLA · Renta de plataformas elevadoras · datos derivados de Plataformas--_AGLA_23-25
export const kpis = [
  {
    key: "facturado",
    label: "Facturado YTD",
    value: "$1.97M",
    suffix: "MXN · 55 rentas",
    delta: 18.4,
    spark: [40, 48, 52, 60, 68, 75, 88],
    tone: "primary" as const,
  },
  {
    key: "cobranza",
    label: "Cobrado",
    value: "$1.73M",
    suffix: "88% del facturado",
    delta: 6.2,
    spark: [50, 55, 60, 62, 68, 72, 80],
    tone: "primary" as const,
  },
  {
    key: "pendiente",
    label: "Por cobrar",
    value: "$234,784",
    suffix: "5 facturas abiertas",
    delta: -8.5,
    spark: [80, 70, 65, 58, 52, 45, 40],
    tone: "primary" as const,
  },
  {
    key: "utilidad",
    label: "Utilidad neta",
    value: "$1.45M",
    suffix: "margen 73.6%",
    delta: 12,
    spark: [30, 38, 48, 56, 64, 72, 80],
    tone: "primary" as const,
  },
];

export const insights = [
  {
    id: "i1",
    tone: "danger" as const,
    badge: "Cobranza",
    title: "SMTELCOM tiene $234,784 pendientes",
    body: "5 facturas (PLAT-28 a PLAT-32) sin pago. Promedio de cobro 38 días — sube tu DSO. Envía recordatorio.",
    action: "Generar recordatorio",
  },
  {
    id: "i2",
    tone: "success" as const,
    badge: "Utilización",
    title: "MB 001 con 92% de ocupación",
    body: "Plataforma más rentada del año. Recuperaste su inversión en 11 meses. Considera adquirir una MB 004 similar.",
    action: "Ver proyección",
  },
  {
    id: "i3",
    tone: "neutral" as const,
    badge: "Concentración",
    title: "100% de ingresos en 1 cliente",
    body: "SMTELCOM concentra todo tu facturado. Riesgo alto si reduce contratación. Sugerimos prospectar 2 clientes nuevos.",
    action: "Plan comercial",
  },
];

// Ingresos mensuales reales (MXN, miles) — 2024 completo
export const hourly = [
  { hour: "Ene", v: 0 },
  { hour: "Feb", v: 48 },
  { hour: "Mar", v: 40 },
  { hour: "Abr", v: 40 },
  { hour: "May", v: 88 },
  { hour: "Jun", v: 80 },
  { hour: "Jul", v: 80 },
  { hour: "Ago", v: 80 },
  { hour: "Sep", v: 48 },
  { hour: "Oct", v: 48 },
  { hour: "Nov", v: 98 },
  { hour: "Dic", v: 102 },
];

// Forecast de ingresos próximos meses (miles MXN)
export const forecast = [
  { d: "Jul", real: 70 },
  { d: "Ago", real: 70 },
  { d: "Sep", real: 109 },
  { d: "Oct", real: 70, forecast: 70 },
  { d: "Nov", forecast: 80 },
  { d: "Dic", forecast: 95 },
  { d: "Ene", forecast: 88 },
];

// Mapa de calor: utilización por equipo (filas: MB001, MB002, MB003) x meses
export const heatmap = [
  [0.0, 0.8, 0.7, 0.7, 1.0, 1.0, 1.0, 0.9, 0.5, 0.5, 1.0, 1.0],
  [0.0, 0.0, 0.0, 0.0, 0.4, 0.4, 0.4, 0.7, 0.4, 0.4, 0.7, 0.7],
  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.3, 0.3, 0.5, 0.5],
  [0.5, 0.4, 0.6, 0.3, 0.7, 0.7, 0.7, 0.6, 0.4, 0.4, 0.8, 0.8],
  [0.3, 0.5, 0.6, 0.3, 0.8, 0.7, 0.7, 0.6, 0.4, 0.4, 0.7, 0.8],
  [0.4, 0.5, 0.6, 0.3, 0.8, 0.7, 0.7, 0.7, 0.5, 0.4, 0.8, 0.9],
  [0.4, 0.5, 0.6, 0.4, 0.8, 0.7, 0.7, 0.7, 0.5, 0.5, 0.8, 0.9],
];

// Equipos: plataformas elevadoras (antes "inventory" = ahora flota)
export const inventory = [
  {
    id: "mb001",
    name: "Brazo Articulado Eléctrico 45'",
    sku: "MB 001",
    category: "Plataformas",
    stock: 92, // % utilización YTD
    min: 70,
    rotation: "Muy alta",
    days: 812, // días rentados acumulado
    margin: 92.0,
    trend: [40, 55, 60, 72, 80, 88, 92],
    status: "success" as const,
    image: "🏗️",
  },
  {
    id: "mb002",
    name: "Brazo Articulado Eléctrico 45'",
    sku: "MB 002",
    category: "Plataformas",
    stock: 64,
    min: 70,
    rotation: "Media",
    days: 504,
    margin: 64.0,
    trend: [10, 20, 30, 42, 55, 60, 64],
    status: "warning" as const,
    image: "🏗️",
  },
  {
    id: "mb003",
    name: "Plataforma Tipo Tijera",
    sku: "MB 003",
    category: "Plataformas",
    stock: 28,
    min: 60,
    rotation: "Baja",
    days: 132,
    margin: 28.0,
    trend: [0, 0, 5, 10, 15, 22, 28],
    status: "danger" as const,
    image: "🪜",
  },
];

// Equipos como "unidades de negocio"
export const businesses = [
  {
    id: "b1",
    name: "MB 001 · Brazo Eléctrico 45'",
    city: "Parque Ind. Nexxus · Escobedo NL",
    sales: "$1.11M",
    growth: 18.4,
    health: 92,
    tickets: 28,
  },
  {
    id: "b2",
    name: "MB 002 · Brazo Eléctrico 45'",
    city: "Parque Ind. Kalos · NL",
    sales: "$761K",
    growth: 12.1,
    health: 78,
    tickets: 19,
  },
  {
    id: "b3",
    name: "MB 003 · Plataforma Tijera",
    city: "Cliente · zona Escobedo",
    sales: "$94K",
    growth: 24.0,
    health: 64,
    tickets: 8,
  },
];

export const aiFeed = [
  {
    id: "a1",
    time: "Hace 5 min",
    tone: "danger" as const,
    title: "Factura PLAT-30 vencida hace 12 días",
    body: "SMTELCOM acumula $234,784 en CxC. DSO subió a 38 días vs 22 hace un trimestre.",
    tag: "Anomalía",
  },
  {
    id: "a2",
    time: "Hace 22 min",
    tone: "success" as const,
    title: "MB 003 rentable por primera vez",
    body: "La tijera comenzó a generar ingresos en septiembre. ROI proyectado a 14 meses.",
    tag: "Tendencia",
  },
  {
    id: "a3",
    time: "Hace 1 h",
    tone: "warning" as const,
    title: "Mantenimientos arriba del presupuesto",
    body: "Gastos en mantenimiento y reparación: $234,747 (12% del facturado). Históricamente <8%.",
    tag: "Recomendación",
  },
  {
    id: "a4",
    time: "Hoy, 09:12",
    tone: "success" as const,
    title: "Próxima utilidad a repartir",
    body: "Caja disponible $58,282. Pendiente cobranza $234,784. Distribución estimada $146K por socio.",
    tag: "Predicción",
  },
];

// Datos extra del Excel
export const flujoCaja = {
  cajaActual: 58282.96,
  porCobrar: 234784,
  porPagar: 0,
  totalActivos: 1575510,
  inversionEquipos: 1370579,
  gastosOperativos: 356110.68,
};

export const socios = [
  {
    name: "Daniel Aguilar",
    initials: "DA",
    aporte: 712871,
    caja: 29141,
    pendiente: 117392,
    balance: -291966,
  },
  {
    name: "Luis",
    initials: "L",
    aporte: 657708,
    caja: 29141,
    pendiente: 117392,
    balance: -288666,
  },
];

export const rentasRecientes = [
  { folio: "PLAT-32", equipo: "MB 001", cliente: "SMTELCOM", dias: 28, total: 40020, status: "pagado" as const },
  { folio: "PLAT-31", equipo: "MB 002", cliente: "SMTELCOM", dias: 28, total: 40020, status: "pendiente" as const },
  { folio: "PLAT-30", equipo: "MB 001", cliente: "SMTELCOM", dias: 28, total: 47676, status: "pendiente" as const },
  { folio: "PLAT-29", equipo: "MB 003", cliente: "SMTELCOM", dias: 14, total: 23800, status: "pendiente" as const },
  { folio: "PLAT-28", equipo: "MB 001", cliente: "SMTELCOM", dias: 28, total: 40020, status: "pagado" as const },
];

export const gastosCategoria = [
  { cat: "Mantenimientos y reparaciones", monto: 234747.72, pct: 65.9 },
  { cat: "Gastos varios", monto: 96170.76, pct: 27.0 },
  { cat: "Seguros", monto: 21942.20, pct: 6.2 },
  { cat: "Contabilidad", monto: 3250, pct: 0.9 },
];