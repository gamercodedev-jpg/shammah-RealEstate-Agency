import { Link } from "react-router-dom";
import { Globe, Video, DollarSign, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: DollarSign,
    title: "USD Pricing",
    description: "All prices displayed in both ZMW and USD for easy conversion",
  },
  {
    icon: Video,
    title: "Virtual Tours",
    description: "Request video calls or virtual property tours from anywhere",
  },
  {
    icon: Shield,
    title: "Secure Process",
    description: "Transparent documentation and secure international transactions",
  },
];

export function DiasporaSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-6">
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">Diaspora Investment Program</span>
            </div>

            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Invest in Zambian Land from Anywhere in the World
            </h2>

            <p className="text-muted-foreground mb-8">
              Whether you're in the UK, USA, South Africa, or anywhere else, 
              Shammah Real Estate Agency Limited makes it easy for you to invest in prime Zambian land. 
              Our dedicated diaspora services include virtual property tours, 
              international payment options, and comprehensive investment guidance.
            </p>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/diaspora">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a
                href={`https://wa.me/260975705555?text=${encodeURIComponent(
                  "Hi Shammah, I am interested in a Virtual Tour. Can you share available properties and a short video tour or more details?"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                  <Video className="h-4 w-4" />
                  Request Virtual Tour
                </Button>
              </a>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1573167243872-43c6433b9d40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="African diaspora investing"
              className="rounded-xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-lg shadow-lg">
              <p className="font-heading font-bold text-2xl text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Diaspora Clients Served</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
