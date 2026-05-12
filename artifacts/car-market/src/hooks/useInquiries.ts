import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Inquiry {
  id: string;
  car_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "responded" | "closed";
  admin_notes: string | null;
  created_at: string;
}

export interface InquiryStats {
  total: number;
  new: number;
  responded: number;
  closed: number;
}

export function useInquiries(params?: { car_id?: string; status?: string }, enabled = true) {
  return useQuery({
    queryKey: ["inquiries", params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params?.car_id) qs.set("car_id", params.car_id);
      if (params?.status) qs.set("status", params.status);
      const res = await fetch(`/api/inquiries?${qs}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch inquiries");
      return res.json() as Promise<Inquiry[]>;
    },
    enabled,
    retry: false,
    staleTime: 30_000,
  });
}

export function useInquiryStats(enabled = true) {
  return useQuery({
    queryKey: ["inquiry-stats"],
    queryFn: async () => {
      const res = await fetch("/api/inquiries/stats", { credentials: "include" });
      if (!res.ok) return { total: 0, new: 0, responded: 0, closed: 0 } as InquiryStats;
      return res.json() as Promise<InquiryStats>;
    },
    enabled,
    retry: false,
    staleTime: 30_000,
  });
}

export function useUpdateInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...patch
    }: {
      id: string;
      status?: string;
      admin_notes?: string;
    }) => {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update inquiry");
      return res.json() as Promise<Inquiry>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inquiries"] });
      qc.invalidateQueries({ queryKey: ["inquiry-stats"] });
    },
  });
}
