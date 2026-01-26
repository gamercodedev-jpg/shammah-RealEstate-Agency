import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Plot, PropertyFilters } from "@/types/database";
import { useEffect } from "react";

export function usePlotsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("plots-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plots" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["plots"], exact: false });
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        // ignore
      }
    };
  }, [queryClient]);
}

export function usePlots(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ["plots", filters],
    queryFn: async () => {
      let query = supabase
        .from("plots")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }
      if (filters?.minPrice !== undefined) {
        query = query.gte("price_usd", filters.minPrice);
      }
      if (filters?.maxPrice !== undefined) {
        query = query.lte("price_usd", filters.maxPrice);
      }
      if (filters?.minSize !== undefined) {
        query = query.gte("size_sqm", filters.minSize);
      }
      if (filters?.maxSize !== undefined) {
        query = query.lte("size_sqm", filters.maxSize);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.isTitled !== undefined) {
        query = query.eq("is_titled", filters.isTitled);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Plot[];
    },
  });
}

export function useFeaturedPlots() {
  return useQuery({
    queryKey: ["plots", "featured"],
    queryFn: async () => {
      // Avoid server-side filters that can 400 when columns don't exist yet.
      // Fetch recent plots, then filter client-side if the fields exist.
      const { data, error } = await supabase
        .from("plots")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;

      const rows = ((data as Plot[]) || []) as Array<any>;
      const hasFeatured = rows.some((r) => r && typeof r === "object" && "is_featured" in r);
      const hasStatus = rows.some((r) => r && typeof r === "object" && "status" in r);

      let filtered = rows;
      if (hasFeatured) filtered = filtered.filter((r) => r?.is_featured === true);
      if (hasStatus) filtered = filtered.filter((r) => r?.status === "available");

      return (filtered.slice(0, 6) as Plot[]) || [];
    },
  });
}

export function usePlot(id: string) {
  return useQuery({
    queryKey: ["plots", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plots")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Plot;
    },
    enabled: !!id,
  });
}

export function useCreatePlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plot: Omit<Plot, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("plots")
        .insert(plot)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plots"] });
    },
  });
}

export function useUpdatePlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Plot> & { id: string }) => {
      const { data, error } = await supabase
        .from("plots")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plots"] });
    },
  });
}

export function useDeletePlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("plots").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plots"] });
    },
  });
}
