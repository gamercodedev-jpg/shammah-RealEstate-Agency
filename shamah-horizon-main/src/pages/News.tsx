import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { publicStorageUrl } from "@/integrations/supabase/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import { playGlobalAudio } from "@/hooks/use-global-audio";
export default function News() {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const adminEndpoint = import.meta.env.VITE_ADMIN_INSERT_ENDPOINT as string | undefined;
  const useAdminReads = (import.meta.env.VITE_USE_ADMIN_ENDPOINT_FOR_READS as string | undefined) === "true";

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
              <img src={publicStorageUrl(featured.image_url || '') || '/src/assets/placeholder.jpg'} alt={featured.title} className="w-full h-72 object-cover" />
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {rest.map((f) => (
            <article key={f.id} className="bg-card rounded overflow-hidden transform transition hover:scale-105">
            <div key={f.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition">
              {f.video_url && (
                <div className="mb-3">
                  <video src={publicStorageUrl(f.video_url) || f.video_url} controls className="w-full rounded-lg bg-black" />
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm line-clamp-1">{f.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(f.created_at).toLocaleDateString()}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${f.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {f.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  {f.audio_url && (
                    <div className="mt-3 p-3 bg-white/60 backdrop-blur rounded flex items-center justify-between">
                      <div className="text-sm">Now Playing: Estate Tour Theme</div>
                      <div>
                        <Button size="sm" onClick={() => playGlobalAudio(publicStorageUrl(f.audio_url) || f.audio_url)}>Play</Button>
                      </div>
                    </div>
                  )}
                </div>
                
              </div>
            </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Market News</div>
                  <div className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</div>
                </div>
                <h3 className="font-semibold mt-2">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.content?.slice(0,100)}...</p>
                <div className="mt-4 flex justify-end">
                  <Link to={`/news/${f.id}`}>
                    <Button size="sm" className="bg-[color:var(--accent)]">Read More</Button>
                  </Link>
                </div>
              </div>
            </article>
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
