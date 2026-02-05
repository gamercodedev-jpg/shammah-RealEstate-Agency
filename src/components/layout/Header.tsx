import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Phone, ChevronDown, Building2, HardHat, Landmark, Sparkles, Video } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/diaspora", label: "Diaspora Investment" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
];

const serviceSections = {
  core: [
    { href: "/properties", label: "Land Sales", icon: Landmark },
    { href: "/contact", label: "Title Processing", icon: Sparkles },
    { href: "/diaspora", label: "Virtual Property Tours", icon: Video },
    { href: "/contact", label: "Investment Advisory", icon: Building2 },
  ],
  solutions: [
    { href: "/solutions", label: "Project Solutions", icon: Sparkles },
    { href: "/building-journey", label: "Plans Form", icon: Sparkles },
  ],
  construction: [
    { href: "/solutions", label: "Tiling", icon: HardHat },
    { href: "/solutions", label: "Wiring", icon: HardHat },
    { href: "/solutions", label: "Plumbing", icon: HardHat },
    { href: "/solutions", label: "Plastering", icon: HardHat },
    { href: "/solutions", label: "Landscaping", icon: HardHat },
  ],
} as const;

// Updated to official shamah Real Estate production contacts per client request
const PRIMARY_PHONE = "0975705555";
const SECONDARY_PHONE = "0975717120";
const SECONDARY_WHATSAPP = "260975705555";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Secret 5-tap login (5 taps within 3 seconds)
  const tapTimesRef = useRef<number[]>([]);

  const handleLogoClick = () => {
    const now = Date.now();
    const windowMs = 3000;

    tapTimesRef.current = [...tapTimesRef.current, now].filter((t) => now - t <= windowMs);

    if (tapTimesRef.current.length >= 5) {
      tapTimesRef.current = [];
      navigate("/admin-login");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <button onClick={handleLogoClick} aria-label="Logo" className="flex items-center gap-2 bg-transparent border-0 p-0">
          <img src="/shammah-logo.png" alt="Shammah Real Estate Limited" className="h-10 w-auto" />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-auto px-0 py-0 text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-primary"
              >
                Services <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[360px] p-2 max-h-[70vh] overflow-y-auto"
            >
              <DropdownMenuLabel className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Core services
              </DropdownMenuLabel>
              <div className="grid grid-cols-2 gap-1 p-1">
                {serviceSections.core.map((s) => (
                  <DropdownMenuItem
                    key={s.label}
                    asChild
                    className="cursor-pointer"
                  >
                    <Link to={s.href} className="flex items-center gap-2">
                      <s.icon className="h-4 w-4 text-primary" />
                      <span className="truncate">{s.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Solutions
              </DropdownMenuLabel>
              <div className="grid grid-cols-2 gap-1 p-1">
                {serviceSections.solutions.map((s) => (
                  <DropdownMenuItem
                    key={s.label}
                    asChild
                    className="cursor-pointer"
                  >
                    <Link to={s.href} className="flex items-center gap-2">
                      <s.icon className="h-4 w-4 text-accent" />
                      <span className="truncate">{s.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Construction
              </DropdownMenuLabel>
              <div className="grid grid-cols-2 gap-1 p-1">
                {serviceSections.construction.map((s) => (
                  <DropdownMenuItem
                    key={s.label}
                    asChild
                    className="cursor-pointer"
                  >
                    <Link to={s.href} className="flex items-center gap-2">
                      <s.icon className="h-4 w-4 text-primary" />
                      <span className="truncate">{s.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <a
            href={`https://wa.me/${SECONDARY_WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp ${SECONDARY_PHONE}`}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
          >
            <Phone className="h-4 w-4" />
            WhatsApp
          </a>

          <a
            href={`tel:${PRIMARY_PHONE}`}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
          >
            <Phone className="h-4 w-4" />
            Call Us
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
              <button
                type="button"
                onClick={() => setIsMobileServicesOpen((v) => !v)}
                className="w-full flex items-center justify-between text-sm font-semibold text-foreground"
                aria-expanded={isMobileServicesOpen}
              >
                Services
                <ChevronDown className={`h-4 w-4 transition-transform ${isMobileServicesOpen ? "rotate-180" : ""}`} />
              </button>

              <div className="mt-2 grid grid-cols-2 gap-2">
                {serviceSections.core.map((s) => (
                  <Link
                    key={s.label}
                    to={s.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>

              {isMobileServicesOpen ? (
                <>
                  <div className="mt-3 pt-3 border-t border-border/60">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Solutions</div>
                    <div className="grid grid-cols-2 gap-2">
                      {serviceSections.solutions.map((s) => (
                        <Link
                          key={s.label}
                          to={s.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/60">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Construction</div>
                    <div className="grid grid-cols-2 gap-2">
                      {serviceSections.construction.map((s) => (
                        <Link
                          key={s.label}
                          to={s.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-3 text-xs text-muted-foreground">
                  More: <Link to="/solutions" onClick={() => setIsMenuOpen(false)} className="underline underline-offset-4">Project Solutions</Link>
                </div>
              )}
            </div>

            <a
              href={`https://wa.me/${SECONDARY_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp ${SECONDARY_PHONE}`}
              className="flex items-center gap-2 text-sm font-medium text-primary"
            >
              <Phone className="h-4 w-4" />
              WhatsApp Us
            </a>

            <a href={`tel:${PRIMARY_PHONE}`} className="flex items-center gap-2 text-sm font-medium text-primary">
              <Phone className="h-4 w-4" />
              Call Us
            </a>
            {/* Admin access hidden — use logo 5x tap to open */}
          </nav>
        </div>
      )}
    </header>
  );
}
