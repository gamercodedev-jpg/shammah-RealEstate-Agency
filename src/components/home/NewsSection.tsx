import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Feed } from "@/types/database";
import { Skeleton } from "@/components/ui/skeleton";
import { publicStorageUrl } from "@/integrations/supabase/utils";
import { Link } from "react-router-dom";

export function NewsSection() {
  const [feeds, setFeeds] = useState<Feed[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const adminEndpoint = import.meta.env.VITE_ADMIN_INSERT_ENDPOINT as string | undefined;
  const useAdminReads = (import.meta.env.VITE_USE_ADMIN_ENDPOINT_FOR_READS as string | undefined) === "true";

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("feeds")
        .select("*")
        // Treat null as published for legacy rows
        .or("is_published.is.true,is_published.is.null")
        .order("created_at", { ascending: false })
        .limit(3);
      if (!mounted) return;
      if (error) {
        // Fallback: try service-role proxy if configured (for cases where RLS blocks anon read)
        if (useAdminReads && adminEndpoint) {
          try {
            const res = await fetch(adminEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "select", table: "feeds", publishedOnly: true, limit: 3 }),
            });
            const json = await res.json();
            if (res.ok && json?.data) {
              setError(null);
              setFeeds((json.data as Feed[]) || []);
              return;
            }
          } catch {
            // ignore and fall through
          }
        }

        console.error("Failed to load feeds", error);
        setError(error.message);
        setFeeds([]);
        return;
      }
      const rows = ((data as Feed[]) || []) as Feed[];
      if (rows.length === 0) {
        // Fallback: show latest feeds even if not marked published yet
        const res2 = await supabase.from("feeds").select("*").order("created_at", { ascending: false }).limit(3);
        if (res2.error) {
          setError(res2.error.message);
          setFeeds([]);
          return;
        }
        setError(null);
        setFeeds(((res2.data as Feed[]) || []) as Feed[]);
        return;
      }
      setError(null);
      setFeeds(rows);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="py-12 bg-background">
      <div className="container">
        <h2 className="font-heading text-2xl font-bold mb-6">News & Updates</h2>
        {feeds === null ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">Unable to load news: {error}</p>
        ) : feeds.length === 0 ? (
          <p>No news yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {feeds.map((f) => (
              <article key={f.id} className="bg-card rounded-lg overflow-hidden shadow">
                <Link to={`/news/${f.id}`} className="block">
                  {f.image_url && (
                    <img
                      src={publicStorageUrl(f.image_url) || f.image_url || ""}
                      alt={f.title}
                      className="h-40 w-full object-cover"
                    />
                  )}
                </Link>
                <div className="p-4">
                  <Link to={`/news/${f.id}`} className="hover:underline">
                    <h3 className="font-semibold mb-2">{f.title}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-3">{f.content}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default NewsSection;
