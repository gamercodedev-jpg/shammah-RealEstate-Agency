import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import type { Plot } from "@/types/database";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function Properties() {
  const [properties, setProperties] = useState<Plot[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchPlots() {
      try {
        setLoading(true);
        // Fetching all plots from the project dashboard
        const { data, error: supabaseError } = await supabase
          .from("plots")
          .select("*")
          .order("created_at", { ascending: false });

        // LOGGING RESULTS FOR SHAMMAH ADMIN
        console.log("--- Shammah Plot Fetch Debug ---");
        console.log("Total plots found:", data?.length || 0);
        console.log("Full data:", data);

        if (!mounted) return;

        if (supabaseError) {
          setError(supabaseError.message);
          setProperties([]);
        } else {
          // This ensures both 'Silverest' and 'Meanwood' entries appear
          setProperties((data as Plot[]) || []);
        }
      } catch (err: any) {
        console.error("Critical Fetch Error:", err);
        setError("Failed to connect to the Shammah database.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchPlots();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Layout>
      <section className="py-16">
        <div className="container">
          <h1 className="font-heading text-3xl font-bold mb-6 text-shammah-green">
            All Listed Properties
          </h1>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Database Connection Issue</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-shammah-orange/30">
              <p className="text-xl font-semibold text-muted-foreground mb-2">No listings visible yet.</p>
              <p className="text-sm text-gray-500">
                Ensure your plots are not hidden by Row Level Security (RLS) in the Supabase Editor.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}