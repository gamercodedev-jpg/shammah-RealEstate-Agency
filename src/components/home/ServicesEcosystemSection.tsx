import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, HardHat, Landmark } from "lucide-react";

const services = [
  {
    title: "Real Estate & Management",
    description: "ZIEA-Regulated property acquisition and professional management.",
    icon: Landmark,
  },
  {
    title: "Material Savings Accounts",
    description:
      "The smart way to build. Pay for your hardware materials in installments through our secure internal accounting system.",
    icon: Building2,
  },
  {
    title: "Turnkey Construction",
    description:
      "From foundation to landscaping. Specialized teams for Tiling, Plumbing, Wiring, and Plastering.",
    icon: HardHat,
  },
];

function ZieaSealImage() {
  return (
    <img
      src="/ziea-logo.png"
      alt="ZIEA seal of authenticity"
      className="h-12 w-auto opacity-90"
      loading="lazy"
      onError={(e) => {
        e.currentTarget.src = "/ziea-logo.svg";
      }}
    />
  );
}

export function ServicesEcosystemSection() {
  return (
    <section className="w-full bg-[#0b3d2e]">
      <div className="container py-14">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-[#d4af37]/40 bg-white/5 px-4 py-1 text-xs font-medium tracking-wide text-white">
            All Under One Roof
          </div>
          <h2 className="mt-4 font-heading text-3xl md:text-5xl font-bold text-white">
            You Choose the Plan, We Hand Over the Keys.
          </h2>
          <p className="mt-4 text-white/80">
            A complete ecosystem designed to build trust, simplify delivery, and protect clients through transparent,
            regulated processes.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s) => (
            <Card
              key={s.title}
              className="h-full bg-white/5 border border-[#d4af37]/30 text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30">
                    <s.icon className="h-6 w-6 text-[#d4af37]" />
                  </div>
                  <div className="text-xs font-medium text-[#d4af37]">Gold Standard</div>
                </div>
                <CardTitle className="mt-4 text-xl text-white">{s.title}</CardTitle>
              </CardHeader>

              <CardContent className="flex h-full flex-col">
                <p className="text-white/80 leading-relaxed">{s.description}</p>

                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                  <div className="text-xs text-white/70">Seal of Authenticity</div>
                  <ZieaSealImage />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
