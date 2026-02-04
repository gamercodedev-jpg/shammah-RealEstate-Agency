import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, MessageCircle, CalendarDays, CreditCard, Video } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import type { Plot } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePlot } from "@/hooks/usePlots";

function formatPriceZmw(price: unknown) {
  const n = Number(price);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: "ZMW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function whatsappUrl(phone: string, text: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const {
    data: plot,
    isLoading: loading,
    error,
  } = usePlot(id || "");

  const images = useMemo(() => {
    const arr = Array.isArray(plot?.images) ? plot!.images : [];
    return arr.filter((src) => typeof src === "string" && src.trim().length > 0) as string[];
  }, [plot]);

  const heroImage = images[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600";

  const title = plot?.title || "Property";
  const location = plot?.location || "";
  const description = plot?.description || "";
  const priceZmw = formatPriceZmw((plot as any)?.price_zmw);

  return (
    <Layout>
      <section className="py-10">
        <div className="container">
          <div className="mb-6">
            <Link to="/properties">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Listings
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-4">
                <Skeleton className="aspect-[16/9] w-full" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[4/3] w-full" />
                  ))}
                </div>
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-28 w-full" />
              </div>
              <div className="lg:col-span-4">
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Failed to load property</AlertTitle>
              <AlertDescription>{String(error)}</AlertDescription>
            </Alert>
          ) : !plot ? (
            <Alert>
              <AlertTitle>Not found</AlertTitle>
              <AlertDescription>That property does not exist.</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main */}
              <div className="lg:col-span-8">
                {/* Hero image / video */}
                <div className="relative overflow-hidden rounded-2xl border bg-card">
                  {plot.video_url ? (
                    <video
                      src={plot.video_url}
                      controls
                      className="w-full aspect-[16/9] object-cover bg-black"
                    />
                  ) : (
                    <img src={heroImage} alt={title} className="w-full aspect-[16/9] object-cover" />
                  )}

                  {plot.is_sold ? (
                    <div className="absolute inset-0 flex items-start justify-end p-4 pointer-events-none">
                      <Badge className="bg-red-600 text-white text-sm px-3 py-1 shadow-lg">
                        SOLD
                      </Badge>
                    </div>
                  ) : null}
                </div>

                {/* Gallery */}
                {images.length > 1 ? (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.slice(1).map((src, idx) => (
                      <div key={`${src}-${idx}`} className="overflow-hidden rounded-lg border bg-card">
                        <img src={src} alt={`${title} photo ${idx + 2}`} className="w-full aspect-[4/3] object-cover" />
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* Title + meta */}
                <div className="mt-8">
                  <h1 className="font-heading text-3xl font-bold">{title}</h1>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {location ? (
                      <Badge variant="secondary" className="gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {location}
                      </Badge>
                    ) : null}
                    {plot.is_sold ? (
                      <Badge className="bg-red-600 text-white">Sold</Badge>
                    ) : null}
                    {plot.is_titled ? <Badge className="bg-primary text-primary-foreground">Titled</Badge> : null}
                    {plot.status ? <Badge variant="outline">{String(plot.status)}</Badge> : null}
                  </div>

                  <div className="mt-6 text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {description || "No description provided."}
                  </div>

                  {plot.audio_url ? (
                    <div className="mt-6">
                      <div className="text-sm font-medium mb-2">Voice note from shamah</div>
                      <audio controls src={plot.audio_url} className="w-full" />
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">{priceZmw}</CardTitle>
                      <div className="text-sm text-muted-foreground">Price (ZMW)</div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <a
                        href={whatsappUrl(
                          "260975705555",
                          `Hi, I'm interested in ${title}. Can you share more details?`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button size="lg" className="w-full gap-2 bg-accent hover:bg-accent/90">
                          <MessageCircle className="h-5 w-5" />
                          Contact Agent
                        </Button>
                      </a>

                      <a
                        href={whatsappUrl(
                          "260975705555",
                          `Hi shamah, I am interested in a Virtual Tour for the property: ${title} in ${location || "Unknown location"}. Can you send me the video or more details?`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button size="lg" variant="outline" className="w-full gap-2">
                          <Video className="h-5 w-5" />
                          Request Virtual Tour
                        </Button>
                      </a>

                      <a
                        href={whatsappUrl(
                          "260975705555",
                          `Hi, I'd like to request a site visit for ${title}. When can we schedule?`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button size="lg" variant="outline" className="w-full gap-2">
                          <CalendarDays className="h-5 w-5" />
                          Request Site Visit
                        </Button>
                      </a>

                      <a
                        href={whatsappUrl(
                          "260975705555",
                          `Hi, do you have payment plans/installments for ${title}?`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button size="lg" variant="outline" className="w-full gap-2">
                          <CreditCard className="h-5 w-5" />
                          Ask for Payment Plans
                        </Button>
                      </a>

                      <div className="pt-2 text-xs text-muted-foreground">
                        WhatsApp opens in a new tab.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
