import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "fluxops.activeBusiness.v1";
export const ALL_BUSINESSES_ID = "all";

type Ctx = {
  activeId: string;
  setActiveId: (id: string) => void;
};

const BusinessContext = createContext<Ctx | null>(null);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveIdState] = useState<string>(ALL_BUSINESSES_ID);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setActiveIdState(raw);
    } catch {
      /* ignore */
    }
  }, []);

  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ activeId, setActiveId }), [activeId, setActiveId]);
  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useActiveBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error("useActiveBusiness debe usarse dentro de <BusinessProvider>");
  return ctx;
}