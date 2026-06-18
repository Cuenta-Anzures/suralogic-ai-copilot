// Parser CSV minimal con soporte para campos entre comillas.
// Suficiente para los exports que produce Flux Ops.

export function parseCSV(text: string): Record<string, string>[] {
  // Eliminar BOM
  const clean = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let i = 0;
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  while (i < clean.length) {
    const c = clean[i];
    if (inQuotes) {
      if (c === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
    } else {
      if (c === '"') {
        inQuotes = true;
        i++;
      } else if (c === ",") {
        row.push(field);
        field = "";
        i++;
      } else if (c === "\n" || c === "\r") {
        row.push(field);
        field = "";
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = [];
        i++;
        if (c === "\r" && clean[i] === "\n") i++;
      } else {
        field += c;
        i++;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? "").trim();
    });
    return obj;
  });
}

// Acepta "DD/MM/YYYY" o ISO; devuelve Date o null.
export function parseFlexDate(s: string): Date | null {
  if (!s) return null;
  const iso = new Date(s);
  if (!isNaN(iso.getTime()) && s.includes("T")) return iso;
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    const [, d, mo, y] = m;
    const year = y.length === 2 ? 2000 + parseInt(y, 10) : parseInt(y, 10);
    const dt = new Date(year, parseInt(mo, 10) - 1, parseInt(d, 10));
    return isNaN(dt.getTime()) ? null : dt;
  }
  return isNaN(iso.getTime()) ? null : iso;
}

export function num(s: string | undefined, fallback = 0): number {
  if (s == null || s === "") return fallback;
  const n = Number(s);
  return isNaN(n) ? fallback : n;
}