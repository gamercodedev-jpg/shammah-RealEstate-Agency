import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, PlayCircle } from "lucide-react";
import { playGlobalAudio } from "@/hooks/use-global-audio";
export default function News() {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    "https://shammah-realestate-agency.onrender.com";

  useEffect(() => {
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
        }));

        setError(null);
        setFeeds(rows);
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error("Failed to load feeds", err);
        setError(err?.message || "Failed to load news");
        setFeeds([]);
      }
    })();
  }, []);

  const featured = feeds[0];
  const rest = feeds.slice(1);

  return (
    <Layout>
      <section className="container py-12">
        {error && (
          <div className="mb-6 text-sm text-destructive">Unable to load news: {error}</div>
        )}
        {featured && (
          <article className="mb-8 rounded overflow-hidden relative">
            <Link to={`/news/${featured.id}`} className="block">
              <img
                src={featured.image_url || "/placeholder.svg"}
                alt={featured.title}
                className="w-full h-72 object-cover"
              />
            </Link>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <div>
                <span className="bg-accent text-accent-foreground px-3 py-1 rounded">Featured</span>
                <Link to={`/news/${featured.id}`} className="hover:underline">
                  <h2 className="text-2xl font-heading font-bold mt-2 text-white">{featured.title}</h2>
                </Link>
                <p className="text-white/90 mt-2">{featured.content?.slice(0,200)}...</p>
              </div>
            </div>
          </article>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {rest.map((f) => (
            (() => {
              const coverSrc = f.image_url || "/placeholder.svg";
              const isPublished = f.is_published === true || f.is_published === null;
              const createdAt = f.created_at ? new Date(f.created_at).toLocaleDateString() : "";
              return (
            <article
              key={f.id}
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/news/${f.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate(`/news/${f.id}`);
              }}
              aria-label={`Open news: ${f.title ?? ""}`}
              className="group relative overflow-hidden rounded-xl bg-card border border-border shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <div className="relative">
                <img src={coverSrc} alt={f.title || "News"} className="h-40 w-full object-cover" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full backdrop-blur border ${
                      isPublished
                        ? "bg-green-500/10 text-green-200 border-green-500/30"
                        : "bg-yellow-500/10 text-yellow-200 border-yellow-500/30"
                    }`}
                  >
                    {isPublished ? "Published" : "Draft"}
                  </span>
                  {f.video_url ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-black/40 text-white border border-white/20">
                      <span className="inline-flex items-center gap-1">
                        <PlayCircle className="h-3.5 w-3.5" /> Video
                      </span>
                    </span>
                  ) : null}
                </div>

                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-black/40 text-white border border-white/20">
                    Open <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-semibold leading-snug line-clamp-1">{f.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{createdAt}</p>

                {f.content ? (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{String(f.content)}</p>
                ) : null}

                {f.audio_url && (
                  <div
                    className="mt-4 p-3 rounded-lg bg-muted/40 flex items-center justify-between gap-3"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <div className="text-sm">Now Playing: Estate Tour Theme</div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        playGlobalAudio(f.audio_url);
                      }}
                    >
                      Play
                    </Button>
                  </div>
                )}
              </div>
            </article>
              );
            })()
          ))}
        </div>

        <div className="mt-12 p-6 rounded bg-gradient-to-r from-primary to-accent text-white">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-heading text-2xl">Stay Updated</h3>
              <p className="text-sm opacity-90">Subscribe for market updates and new releases.</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto">
              <input type="email" placeholder="Your email" className="px-4 py-3 rounded text-black" />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}
