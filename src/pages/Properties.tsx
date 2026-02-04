import { Layout } from "@/components/layout/Layout";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { usePlots } from "@/hooks/usePlots";

export default function Properties() {
  const { data: properties, isLoading, error } = usePlots();

  return (
    <Layout>
      <section className="py-16">
        <div className="container">
          <h1 className="font-heading text-3xl font-bold mb-6 text-shamah-green">
            All Listed Properties
          </h1>

          {isLoading ? (
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
              <AlertDescription>{String(error)}</AlertDescription>
            </Alert>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-shamah-orange/30">
              <p className="text-xl font-semibold text-muted-foreground mb-2">No listings visible yet.</p>
              <p className="text-sm text-gray-500">
                New listings will appear here once added through the admin dashboard.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}