import { useQuery } from "@tanstack/react-query";
import { getBusinessSnapshot, listBusinesses } from "@/lib/dataSource";

export function useBusinesses() {
  return useQuery({
    queryKey: ["fluxops", "businesses"],
    queryFn: listBusinesses,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSnapshot(businessId: string | undefined) {
  return useQuery({
    queryKey: ["fluxops", "snapshot", businessId],
    queryFn: () => getBusinessSnapshot(businessId!),
    enabled: !!businessId,
    staleTime: 60 * 1000,
  });
}

export function fmtCurrency(n: number): string {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

export function fmtCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n)}`;
}