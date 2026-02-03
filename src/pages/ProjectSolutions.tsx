import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Cable, LayoutGrid, PaintRoller, Shovel, Wrench } from "lucide-react";
const SHAMAH_LOGO_URL = "/shamah-logo.png";

const WHATSAPP_INTL = "260975705555";

function buildWhatsAppUrl(text: string) {
  return `https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(text)}`;
}

const services = [
  {
    title: "Tiling",
    description: "Professional floor and wall tiling with clean finishes.",
    icon: LayoutGrid,
  },
  {
    title: "Wiring",
    description: "Safe, standards-compliant electrical wiring and fittings.",
    icon: Cable,
  },
  {
    title: "Plumbing",
    description: "Reliable plumbing installation for homes and projects.",
    icon: Wrench,
  },
  {
    title: "Plastering",
    description: "Smooth interior/exterior plastering for a premium look.",
    icon: PaintRoller,
  },
  {
    title: "Landscaping",
    description: "Outdoor landscaping to complete your property beautifully.",
    icon: Shovel,
  },
];

export default function ProjectSolutions() {
  const materialAccountText = [
    "Hello shamah Horizon,",
    "I would like to open a shamah Material Account and pay in installments.",
    "Please share the requirements, payment options, and next steps.",
  ].join("\n");

  return (
    <Layout>
      <section className="w-full bg-background relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.05] bg-center bg-no-repeat bg-contain"
          style={{ backgroundImage: `url(${SHAMAH_LOGO_URL})` }}
        />

        <div className="container py-14 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-medium tracking-wide">
              Comprehensive Project Solutions
            </div>
            <h1 className="mt-4 font-heading text-3xl md:text-5xl font-bold">
              You Choose the Plan, We Hand Over the Keys.
            </h1>
            <p className="mt-4 text-muted-foreground">
              From finishing services to outdoor works, shamah helps you move from land to a complete home with trusted
              workmanship and clear delivery.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                <Link to="/building-journey">Start Your Building Journey Today</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Talk to Us</Link>
              </Button>
            </div>
          </div>

          {/* Services grid */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {services.map((service) => (
              <Card key={service.title} className="border border-border/60">
                <CardHeader className="pb-2">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-center text-base">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-sm text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Material account feature */}
          <div className="mt-10">
            <Card className="overflow-hidden border-2 border-accent/50">
              <div className="bg-gradient-to-r from-primary/10 via-background to-accent/10">
                <CardContent className="p-6 md:p-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="md:col-span-2">
                      <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-4 py-1 text-xs font-medium">
                        Flexible Material Accounts
                      </div>
                      <h2 className="mt-3 font-heading text-2xl md:text-3xl font-bold">
                        Can&apos;t afford everything at once?
                      </h2>
                      <p className="mt-3 text-muted-foreground leading-relaxed">
                        Open a shamah Material Account today and pay in installments.
                      </p>
                    </div>

                    <div className="flex md:justify-end">
                      <div className="w-full md:w-auto space-y-2">
                        <Button
                          size="lg"
                          className="w-full md:w-auto bg-accent hover:bg-accent/90"
                          onClick={() => window.open(buildWhatsAppUrl(materialAccountText), "_blank", "noopener,noreferrer")}
                        >
                          Open a Material Account
                        </Button>
                        <div className="text-xs text-muted-foreground md:text-right">
                          Prefer a form?{" "}
                          <Link to="/building-journey" className="underline underline-offset-4 hover:text-foreground">
                            Go to Plans Form
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <h3 className="font-heading text-2xl font-bold">Start Your Building Journey Today</h3>
            <p className="mt-2 text-muted-foreground">
              Tell us what you want to build and we&apos;ll guide you through the best plan.
            </p>
            <div className="mt-5">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                <Link to="/building-journey">Go to Plans Form</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
