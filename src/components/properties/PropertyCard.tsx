import { Link } from "react-router-dom";
import { MapPin, Ruler, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Plot } from "@/types/database";

interface PropertyCardProps {
  property: Plot;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number | null | undefined, currency: string) => {
    if (price === null || price === undefined || Number.isNaN(Number(price))) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const isSold = !!property.is_sold;
  const sizeSqm = Number((property as any).size_sqm) || 0;
  const locationLabel = property.location || "Location TBD";
  const titleLabel = property.title || "Untitled Property";

  // Builds the direct URL for your specific Supabase project.
  // Supports either full URLs or filenames stored in the images[] array.
  const STORAGE_PREFIX =
    "https://whpycgzxznjklrnofsri.supabase.co/storage/v1/object/public/shamah-media/";

  const firstImage = property.images?.[0];
  const mainImage =
    (typeof firstImage === "string" && /^https?:\/\//i.test(firstImage)
      ? firstImage
      : typeof firstImage === "string" && firstImage.trim()
        ? `${STORAGE_PREFIX}${encodeURI(firstImage.replace(/^\/+/, ""))}`
        : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800");

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow border-none shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={mainImage}
          alt={titleLabel}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {isSold ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[140%] -rotate-12">
              <div className="relative bg-shamah-green/90 py-3 md:py-4">
                <div className="absolute left-0 right-0 top-0 h-[2px] bg-shamah-orange" />
                <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-shamah-orange" />
                <div
                  className="text-center text-4xl md:text-5xl font-extrabold tracking-[0.2em] text-red-600"
                  style={{ WebkitTextStroke: "1px white" }}
                >
                  SOLD
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {!isSold ? (
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary text-primary-foreground">Available</Badge>
          </div>
        ) : null}

        <div className="absolute top-3 left-3 flex gap-2">
          {property.is_titled && (
            <Badge className="bg-shamah-green text-white">Titled</Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-1 text-shamah-green">
          {titleLabel}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-shamah-orange" />
            <span className="text-sm">{locationLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Ruler className="h-4 w-4 text-shamah-orange" />
            <span className="text-sm">{sizeSqm > 0 ? `${sizeSqm.toLocaleString()} sqm` : "Size TBD"}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xl font-bold text-shamah-green">
            {formatPrice(property.price_zmw, "ZMW")}
          </p>
        </div>

        <div className="flex gap-2">
          <Link to={`/properties/${property.id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full border-shamah-green text-shamah-green hover:bg-shamah-green/10"
            >
              Learn More
            </Button>
          </Link>
          <a
            href={`https://wa.me/260975705555?text=${encodeURIComponent(
              `Hi shamah, I am interested in a Virtual Tour for the property: ${titleLabel} in ${locationLabel}. Can you send me the video or more details?`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-shamah-orange hover:bg-shamah-orange/90 gap-2">
              <Video className="h-4 w-4" />
              Tour
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}