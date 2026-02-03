import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
const SHAMAH_LOGO_URL = "/shammah-logo.png";

const CONTACT = {
  whatsappInternational: "260975705555",
  email: "alexkabinga83@gmail.com",
  phoneTel: "0975705555",
} as const;

function buildWhatsAppUrl(text: string) {
  return `https://wa.me/${CONTACT.whatsappInternational}?text=${encodeURIComponent(text)}`;
}

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Identity */}
          <div className="space-y-4">
            <div className="inline-flex w-full max-w-[320px] flex-col items-center justify-center rounded-xl bg-white/95 p-4 shadow-sm">
              <img
                src={SHAMAH_LOGO_URL}
                alt="shamah Real Estate Agency Limited"
                className="h-12 w-auto object-contain"
                loading="lazy"
              />
            </div>

            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Your trusted partner for land investment in Zambia — with professional real estate delivery and reliable construction support.
            </p>

            <div className="flex gap-4">
              <a href="#" className="hover:text-accent transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-accent" />
                <span className="text-sm text-primary-foreground/80">Lusaka, Zambia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent" />
                <a
                  href={`tel:${CONTACT.phoneTel}`}
                  className="text-sm text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  {CONTACT.phoneTel}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent" />
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-sm text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Real Estate */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Real Estate</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/properties" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Land Sales
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Title Processing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Property Management
                </Link>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="font-heading font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/diaspora" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                    Diaspora Investment
                  </Link>
                </li>
                <li>
                  <Link to="/news" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                    News & Updates
                  </Link>
                </li>
                <li>
                  <Link to="/solutions" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                    Project Solutions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: Construction */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Construction</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/solutions" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Turnkey Building
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Tiling &amp; Finishing
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Electrical &amp; Plumbing
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Landscaping
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Finance */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Building Materials</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={buildWhatsAppUrl(
                    [
                      "Hello shamah Horizon,",
                      "I would like to open a Hardware Supply Account (pay in installments) for building materials.",
                      "Please share the requirements, payment options, and next steps.",
                    ].join("\n"),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  Hardware Supply Accounts (Pay in Installments)
                </a>
              </li>
              <li>
                <Link to="/building-journey" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Start a Plan / Request a Quote
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Talk to Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center space-y-2">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} shamah Real Estate Agency Limited. All rights reserved.
          </p>
          <p className="text-sm text-primary-foreground/60">Developed by Mthunzi-Tech-Labs.</p>
        </div>
      </div>
    </footer>
  );
}
