import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import shamahLogo from "@/assets/shamah-logo.png";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <img src={shamahLogo} alt="Shammah Real Estate Agency Limited" className="h-12 w-auto brightness-0 invert" />
            <p className="text-sm text-primary-foreground/80">
              Your trusted partner for land investment in Zambia. Building legacies for generations.
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
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/properties" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Browse Properties
                </Link>
              </li>
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
                <Link to="/contact" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Services</h4>
            <ul className="space-y-2">
              <li className="text-sm text-primary-foreground/80">Land Sales</li>
              <li className="text-sm text-primary-foreground/80">Title Processing</li>
              <li className="text-sm text-primary-foreground/80">Virtual Property Tours</li>
              <li className="text-sm text-primary-foreground/80">Investment Advisory</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-accent" />
                <span className="text-sm text-primary-foreground/80">
                  Lusaka, Zambia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent" />
                <a href="tel:0975705555" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  0975705555
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent" />
                <a href="mailto:alexkabinga83@gmail.com" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                  alexkabinga83@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center space-y-2">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} Shammah Real Estate Agency Limited. All rights reserved.
          </p>
          <p className="text-sm text-primary-foreground/60">Developed by Mthunzi-Tech-Labs.</p>
        </div>
      </div>
    </footer>
  );
}
