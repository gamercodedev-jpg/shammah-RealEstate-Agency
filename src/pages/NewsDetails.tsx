import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import type { Feed } from "@/types/database";
import { publicStorageUrl } from "@/integrations/supabase/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function NewsDetails() {
  const { id } = useParams<{ id: string }>();

  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioAutoplayBlocked, setAudioAutoplayBlocked] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!id) {
        setError("Missing news id");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error } = await supabase.from("feeds").select("*").eq("id", id).single();

      if (!mounted) return;

      if (error) {
        setError(error.message);
        setFeed(null);
      } else {
        setFeed((data as Feed) || null);
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const title = feed?.title || "News";
  const createdAt = feed?.created_at ? new Date(feed.created_at) : null;
  const imageSrc = publicStorageUrl(feed?.image_url || "") || feed?.image_url || "";
  const videoSrc = publicStorageUrl(feed?.video_url || "") || feed?.video_url || "";
  const audioSrc = publicStorageUrl(feed?.audio_url || "") || feed?.audio_url || "";

  useEffect(() => {
    setAudioAutoplayBlocked(false);

    const el = audioRef.current;
    if (!el || !audioSrc) return;

    const timer = window.setTimeout(() => {
      const tryPlay = async () => {
        try {
          const maybePromise = el.play();
          if (maybePromise && typeof (maybePromise as Promise<void>).then === "function") {
            await maybePromise;
          }
        } catch {
          setAudioAutoplayBlocked(true);
        }
      };

      void tryPlay();
    }, 200);

    return () => {
      window.clearTimeout(timer);
      el.pause();
    };
  }, [audioSrc, id]);

  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container">
          <div className="mb-6">
            <Link to="/news">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to News
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="aspect-[16/9] w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Failed to load news</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : !feed ? (
            <Alert>
              <AlertTitle>Not found</AlertTitle>
              <AlertDescription>This news item does not exist.</AlertDescription>
            </Alert>
          ) : (
            <article className="mx-auto w-full max-w-6xl">
              <header className="mb-6 md:mb-8">
                <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {createdAt ? (
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {createdAt.toLocaleDateString()}
                    </span>
                  ) : null}
                  <Badge variant="outline">{feed.is_published === false ? "Draft" : "Published"}</Badge>
                </div>
              </header>

              {/* Hero media */}
              {imageSrc ? (
                <div className="overflow-hidden rounded-2xl border bg-black">
                  <img
                    src={imageSrc}
                    alt={title}
                    className="w-full max-h-[70vh] object-contain"
                    loading="eager"
                  />
                </div>
              ) : videoSrc ? (
                <div className="overflow-hidden rounded-2xl border bg-black">
                  <video src={videoSrc} controls className="w-full max-h-[70vh] object-contain" />
                </div>
              ) : null}

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main content */}
                <div className="lg:col-span-8">
                  <div className="rounded-2xl border bg-card p-5 md:p-7">
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                        {feed.content || ""}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Side media */}
                <aside className="lg:col-span-4 space-y-4">
                  {videoSrc && imageSrc ? (
                    <div className="overflow-hidden rounded-2xl border bg-black">
                      <video src={videoSrc} controls className="w-full" />
                    </div>
                  ) : null}

                  {audioSrc ? (
                    <div className="rounded-2xl border bg-card p-4">
                      <div className="text-sm font-medium mb-2">Audio</div>
                      {audioAutoplayBlocked ? (
                        <div className="mb-3 text-xs text-muted-foreground">
                          Autoplay was blocked by your browser. Tap Play to start.
                        </div>
                      ) : null}
                      <audio
                        ref={audioRef}
                        src={audioSrc}
                        controls
                        autoPlay
                        playsInline
                        preload="auto"
                        className="w-full"
                      />
                      {audioAutoplayBlocked ? (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            onClick={() => {
                              void audioRef.current?.play();
                            }}
                          >
                            Play
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                    Tip: click the browser’s back button or use “Back to News”.
                  </div>
                </aside>
              </div>
            </article>
          )}
        </div>
      </section>
    </Layout>
  );
}
