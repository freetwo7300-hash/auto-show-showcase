import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type DbCar = Tables<"cars">;

export function useCars() {
  return useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbCar[];
    },
  });
}

export function useCar(id: string | undefined) {
  return useQuery({
    queryKey: ["cars", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as DbCar | null;
    },
    enabled: !!id,
  });
}

export function useAddCar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (car: TablesInsert<"cars">) => {
      const { data, error } = await supabase.from("cars").insert(car).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cars"] }),
  });
}

export function useUpdateCar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & TablesUpdate<"cars">) => {
      const { data, error } = await supabase.from("cars").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
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
      const { error } = await supabase.from("cars").delete().eq("id", id);
      if (error) throw error;
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
      const { data, error } = await supabase
        .from("favorites")
        .select("car_id")
        .eq("user_id", userId);
      if (error) throw error;
      return data.map((r) => r.car_id);
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
        const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("car_id", carId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("favorites").insert({ user_id: userId, car_id: carId });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites", userId] }),
  });
}
