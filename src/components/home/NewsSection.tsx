import { useEffect, useState } from "react";
import type { Feed } from "@/types/database";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export function NewsSection() {
  const [feeds, setFeeds] = useState<Feed[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:4000";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/news`);
        if (!res.ok) throw new Error("Failed to load news");
        const raw = await res.json();
        let rows = (Array.isArray(raw) ? raw : []).map((row: any) => ({
          id: String(row.id),
          title: row.headline ?? "",
          content: row.content ?? "",
          image_url: row.image_url ?? "",
          video_url: null,
          audio_url: null,
          is_published: true,
          created_at: row.published_at ?? null,
          updated_at: row.published_at ?? null,
        })) as Feed[];

        rows = rows.slice(0, 3);

        if (!mounted) return;
        setError(null);
        setFeeds(rows);
      } catch (err: any) {
        if (!mounted) return;
        // eslint-disable-next-line no-console
        console.error("Failed to load feeds", err);
        setError(err?.message || "Unable to load news.");
        setFeeds([]);
      }
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
                      src={f.image_url || ""}
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
