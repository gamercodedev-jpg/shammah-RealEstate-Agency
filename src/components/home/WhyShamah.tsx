import { Shield, CreditCard, Users, FileCheck, Leaf, Clock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Integrity in Land Documentation",
    description:
      "Every property we sell comes with verified documentation. We ensure transparent, legal processes that protect your investment and give you peace of mind.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payment Plans",
    description:
      "We believe everyone deserves to own land. Our flexible payment options cater to every income level, making your dream of land ownership achievable.",
  },
  {
    icon: Users,
    title: "Building a Legacy",
    description:
      "Land is the foundation of generational wealth. Partner with shamah to secure your family's future and build a lasting legacy for the next generation.",
  },
  {
    icon: FileCheck,
    title: "Title Processing Support",
    description:
      "We guide you through the entire title deed process, from application to approval, ensuring your land ownership is fully secured and documented.",
  },
  {
    icon: Leaf,
    title: "Prime Locations",
    description:
      "Our properties are strategically located in areas with high growth potential, ensuring your investment appreciates over time.",
  },
  {
    icon: Clock,
    title: "Fast Transactions",
    description:
      "Our streamlined processes mean you can complete your land purchase quickly and efficiently, without unnecessary delays.",
  },
];

export function Whyshamah() {
  return (
    <section className="py-16 bg-secondary">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Why Choose <span className="text-primary">shamah</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            For over a decade, shamah Real Estate Agency Limited has been the trusted name in Zambian land investment. 
            Our commitment to integrity and customer success sets us apart.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
