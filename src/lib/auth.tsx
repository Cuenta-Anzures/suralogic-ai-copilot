// Sistema de autenticación profesional (sin OAuth ni proveedores externos).
// Verifica credenciales contra public/data/staff.csv.
// Preparado para migrar a Firebase Auth en el futuro.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { parseCSV } from "@/lib/csv";

export type AuthUser = {
  id: string;
  username: string;
  nombre: string;
  rol: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
};

const STORAGE_KEY = "fluxops.session.v1";

const AuthContext = createContext<AuthContextValue | null>(null);

async function verifyAgainstStaff(username: string, password: string): Promise<AuthUser | null> {
  try {
    const res = await fetch("/data/staff.csv", { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar el directorio de usuarios.");
    const rows = parseCSV(await res.text());
    const match = rows.find(
      (r) =>
        (r.activo ?? "").toLowerCase() === "true" &&
        r.username?.toLowerCase() === username.toLowerCase() &&
        r.password === password,
    );
    if (!match) return null;
    return {
      id: match.id,
      username: match.username,
      nombre: match.nombre,
      rol: match.rol,
    };
  } catch {
    // Fallback hardcoded para que la app sea utilizable aún si el CSV no carga.
    if (username === "Admin" && password === "Admin") {
      return { id: "1", username: "Admin", nombre: "Administrador", rol: "admin" };
    }
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const u = await verifyAgainstStaff(username.trim(), password);
    if (!u) return { ok: false as const, error: "Usuario o contraseña incorrectos." };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}