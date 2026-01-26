import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, CreditCard, Users } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-3xl text-primary-foreground">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Own Your Piece of Zambia
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Shammah Real Estate Agency Limited – Your trusted partner for secure land investments 
            with transparent documentation and flexible payment plans.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Link to="/properties">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 w-full sm:w-auto">
                Browse Properties
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/diaspora">
              <Button size="lg" variant="outline" className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto">
                Diaspora Investment
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4">
              <Shield className="h-8 w-8 text-accent" />
              <div>
                <p className="font-semibold text-sm">Verified Titles</p>
                <p className="text-xs text-primary-foreground/70">100% Legal Documentation</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4">
              <CreditCard className="h-8 w-8 text-accent" />
              <div>
                <p className="font-semibold text-sm">Flexible Payments</p>
                <p className="text-xs text-primary-foreground/70">Plans for Every Budget</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4">
              <Users className="h-8 w-8 text-accent" />
              <div>
                <p className="font-semibold text-sm">500+ Happy Clients</p>
                <p className="text-xs text-primary-foreground/70">Trusted Since 2015</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
