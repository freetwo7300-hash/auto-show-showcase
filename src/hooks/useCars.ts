import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

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
        .single();
      if (error) throw error;
      return data as DbCar;
    },
    enabled: !!id,
  });
}

export function useAddCar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (car: TablesInsert<"cars">) => {
      const { data, error } = await supabase.from("cars").insert(car).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
  });
}
