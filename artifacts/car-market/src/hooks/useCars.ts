import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface DbCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  body_type: string;
  condition: string;
  status: string;
  description: string | null;
  features: string[] | null;
  images: string[] | null;
  added_by: string | null;
  created_at: string;
  updated_at: string;
}

export type CarInput = Omit<DbCar, "id" | "created_at" | "updated_at">;
export type CarUpdate = Partial<CarInput>;

async function authHeaders(): Promise<Record<string, string>> {
  return { "Content-Type": "application/json" };
}

export function useCars(filters?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["cars", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        for (const [k, v] of Object.entries(filters)) {
          if (v !== undefined && v !== "") params.set(k, String(v));
        }
      }
      const res = await fetch(`/api/cars?${params}`);
      if (!res.ok) throw new Error("Failed to fetch cars");
      return res.json() as Promise<DbCar[]>;
    },
  });
}

export function useCar(id: string | undefined) {
  return useQuery({
    queryKey: ["cars", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/cars/${id}`);
      if (!res.ok) return null;
      return res.json() as Promise<DbCar>;
    },
    enabled: !!id,
  });
}

export function useCarStats() {
  return useQuery({
    queryKey: ["car-stats"],
    queryFn: async () => {
      const res = await fetch("/api/cars/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json() as Promise<{ total: number; for_sale: number; sold: number; brands_count: number; avg_price: number }>;
    },
  });
}

export function useAddCar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (car: CarInput) => {
      const headers = await authHeaders();
      const res = await fetch("/api/cars", {
        method: "POST",
        headers,
        body: JSON.stringify(car),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to create car" }));
        throw new Error((err as { error?: string }).error ?? "Failed to create car");
      }
      return res.json() as Promise<DbCar>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cars"] }),
  });
}

export function useUpdateCar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & CarUpdate) => {
      const headers = await authHeaders();
      const res = await fetch(`/api/cars/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(patch),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to update car" }));
        throw new Error((err as { error?: string }).error ?? "Failed to update car");
      }
      return res.json() as Promise<DbCar>;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["cars"] });
      qc.invalidateQueries({ queryKey: ["cars", vars.id] });
    },
  });
}

export function useDeleteCar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const headers = await authHeaders();
      const res = await fetch(`/api/cars/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete car");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cars"] }),
  });
}

// ---------- Favorites ----------
export function useFavorites(userId: string | undefined) {
  return useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch("/api/favorites", { credentials: "include" });
      if (!res.ok) return [];
      return res.json() as Promise<string[]>;
    },
    enabled: !!userId,
  });
}

export function useToggleFavorite(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ carId, isFav }: { carId: string; isFav: boolean }) => {
      if (!userId) throw new Error("not signed in");
      if (isFav) {
        await fetch(`/api/favorites/${carId}`, { method: "DELETE", credentials: "include" });
      } else {
        await fetch(`/api/favorites/${carId}`, { method: "POST", credentials: "include" });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites", userId] }),
  });
}
