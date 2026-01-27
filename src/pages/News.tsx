import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { publicStorageUrl } from "@/integrations/supabase/utils";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, PlayCircle } from "lucide-react";

import { playGlobalAudio } from "@/hooks/use-global-audio";
export default function News() {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const adminEndpoint = import.meta.env.VITE_ADMIN_INSERT_ENDPOINT as string | undefined;
  const useAdminReads = (import.meta.env.VITE_USE_ADMIN_ENDPOINT_FOR_READS as string | undefined) === "true";
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("feeds")
        .select("*")
        // Treat null as published for legacy rows
        .or("is_published.is.true,is_published.is.null")
        .order("created_at", { ascending: false });
      if (error) {
        // Fallback: try service-role proxy if configured
        if (useAdminReads && adminEndpoint) {
          try {
            const res = await fetch(adminEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "select", table: "feeds", publishedOnly: true, limit: 50 }),
            });
            const json = await res.json();
            if (res.ok && json?.data) {
              setError(null);
              setFeeds((json.data as any[]) || []);
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
      const rows = (data as any[]) || [];
      if (rows.length === 0) {
        const res2 = await supabase.from("feeds").select("*").order("created_at", { ascending: false });
        if (res2.error) {
          setError(res2.error.message);
          setFeeds([]);
          return;
        }
        setError(null);
        setFeeds((res2.data as any[]) || []);
        return;
      }
      setError(null);
      setFeeds(rows);
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
                src={publicStorageUrl(featured.image_url || "") || featured.image_url || "/placeholder.svg"}
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
              const coverSrc = publicStorageUrl(f.image_url || "") || f.image_url || "/placeholder.svg";
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
                        playGlobalAudio(publicStorageUrl(f.audio_url) || f.audio_url);
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
