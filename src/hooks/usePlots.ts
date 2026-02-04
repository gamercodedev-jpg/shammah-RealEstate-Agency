import { useQuery } from "@tanstack/react-query";
import type { Plot, PropertyFilters } from "@/types/database";

// Base URL for the API (Render in production, env-configurable)
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "https://shammah-realestate-agency.onrender.com";

function mapToPlot(row: any): Plot {
  const images: string[] = Array.isArray(row?.images)
    ? row.images
    : row?.image_url
    ? [row.image_url]
    : [];

  return {
    id: String(row.id ?? ""),
    title: row.title ?? "",
    description: (row.description as string | null) ?? null,
    location: row.location ?? "",
    size_sqm: Number(row.size_sqm ?? 0),
    price_zmw: Number(row.price_zmw ?? 0),
    price_usd: Number(row.price_usd ?? 0),
    status: (row.status as Plot["status"]) || "available",
    is_sold: (row.is_sold as boolean | null | undefined) ?? null,
    is_titled: Boolean(row.is_titled ?? false),
    has_road_access:
      row.has_road_access === undefined ? null : Boolean(row.has_road_access),
    has_water: row.has_water === undefined ? null : Boolean(row.has_water),
    has_electricity:
      row.has_electricity === undefined ? null : Boolean(row.has_electricity),
    soil_type: (row.soil_type as string | null) ?? null,
    distance_from_road: (row.distance_from_road as string | null) ?? null,
    images,
    video_url: (row.video_url as string | null) ?? null,
    audio_url: (row.audio_url as string | null) ?? null,
    is_featured: (row.is_featured as boolean | null | undefined) ?? null,
    created_at: (row.created_at as string) || new Date().toISOString(),
    updated_at:
      (row.updated_at as string) ||
      (row.created_at as string) ||
      new Date().toISOString(),
  };
}

async function fetchAllPlots(): Promise<Plot[]> {
  const res = await fetch(`${API_BASE_URL}/api/plots`);
  if (!res.ok) {
    throw new Error("Failed to load plots from local API");
  }
  const data = await res.json();
  const rows = Array.isArray(data) ? data : [];
  return rows.map(mapToPlot);
}

function applyFilters(plots: Plot[], filters?: PropertyFilters): Plot[] {
  if (!filters) return plots;

  return plots.filter((plot) => {
    if (filters.location) {
      const needle = filters.location.toLowerCase();
      if (!plot.location.toLowerCase().includes(needle)) return false;
    }
    if (filters.minPrice !== undefined) {
      if (plot.price_zmw < filters.minPrice) return false;
    }
    if (filters.maxPrice !== undefined) {
      if (plot.price_zmw > filters.maxPrice) return false;
    }
    if (filters.minSize !== undefined) {
      if (plot.size_sqm < filters.minSize) return false;
    }
    if (filters.maxSize !== undefined) {
      if (plot.size_sqm > filters.maxSize) return false;
    }
    if (filters.status) {
      if (plot.status !== filters.status) return false;
    }
    if (filters.isTitled !== undefined) {
      if (plot.is_titled !== filters.isTitled) return false;
    }
    if (filters.hasRoadAccess !== undefined) {
      if ((plot.has_road_access ?? false) !== filters.hasRoadAccess) return false;
    }
    if (filters.hasWater !== undefined) {
      if ((plot.has_water ?? false) !== filters.hasWater) return false;
    }
    if (filters.hasElectricity !== undefined) {
      if ((plot.has_electricity ?? false) !== filters.hasElectricity) return false;
    }

    return true;
  });
}

// Realtime hook is now a no-op to avoid any Supabase/Firebase dependency.
export function usePlotsRealtime() {
  return;
}

export function usePlots(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ["plots", filters],
    queryFn: async () => {
      const all = await fetchAllPlots();
      return applyFilters(all, filters);
    },
  });
}

export function useFeaturedPlots() {
  return useQuery({
    queryKey: ["plots", "featured"],
    queryFn: async () => {
      const all = await fetchAllPlots();

      let featured = all.filter((p) => p.is_featured === true);
      if (featured.length === 0) {
        featured = all.filter((p) => p.status === "available");
      }
      if (featured.length === 0) {
        featured = all;
      }

      return featured.slice(0, 6);
    },
  });
}

export function usePlot(id: string) {
  return useQuery({
    queryKey: ["plots", id],
    queryFn: async () => {
      const all = await fetchAllPlots();
      const plot = all.find((p) => String(p.id) === String(id));
      if (!plot) {
        throw new Error("Plot not found in local API");
      }
      return plot;
    },
    enabled: !!id,
  });
}

