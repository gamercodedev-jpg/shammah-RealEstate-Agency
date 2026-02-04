import React, { useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  FileText,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const WHATSAPP_NUMBER = "260975705555";
const ENQUIRY_EMAIL = "alexkabinga83@gmail.com";

const DEFAULT_USD_TO_ZMW = 27.5;
const FX_CACHE_KEY = "fx:usd_to_zmw:v1";
const FX_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

type Currency = "USD" | "ZMW";

function toFiniteNumber(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatMoney(value: unknown, currency: Currency) {
  const n = toFiniteNumber(value);
  if (n === null) return "—";
  if (currency === "USD") return `$${Math.round(n).toLocaleString()}`;
  return `K${Math.round(n).toLocaleString()}`;
}

export default function Diaspora() {
  const [plots, setPlots] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [usdToZmw, setUsdToZmw] = useState<number>(DEFAULT_USD_TO_ZMW);
  const [fxIsLive, setFxIsLive] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [sort, setSort] = useState<"newest" | "price_low" | "price_high">("newest");
  const [maxBudget, setMaxBudget] = useState<string>("");

  const navigate = useNavigate();
  const listingsRef = useRef<HTMLDivElement | null>(null);

  const API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    "https://shammah-realestate-agency.onrender.com";

  const getDisplayPrice = (plot: any, preferredCurrency: Currency) => {
    const priceZmw = toFiniteNumber(plot?.price_zmw);
    const priceUsd = toFiniteNumber(plot?.price_usd);

    // Prefer ZMW as the source-of-truth when available, then convert.
    // This ensures the currency toggle actually converts rather than merely switching fields.
    if (priceZmw !== null) {
      if (preferredCurrency === "ZMW") {
        return { amount: priceZmw, currency: "ZMW" as const, isConverted: false };
      }

      if (usdToZmw > 0) {
        return { amount: priceZmw / usdToZmw, currency: "USD" as const, isConverted: true };
      }

      return { amount: null, currency: "USD" as const, isConverted: true };
    }

    if (priceUsd !== null) {
      if (preferredCurrency === "USD") {
        return { amount: priceUsd, currency: "USD" as const, isConverted: false };
      }

      return { amount: priceUsd * usdToZmw, currency: "ZMW" as const, isConverted: true };
    }

    return { amount: null, currency: preferredCurrency, isConverted: false };
  };

  const openEnquiry = (plot: any, via: "whatsapp" | "email") => {
    const title = plot?.title ? String(plot.title) : "a plot";
    const location = plot?.location ? String(plot.location) : "";
    const display = getDisplayPrice(plot, currency);
    const price = display.amount === null ? "—" : formatMoney(display.amount, display.currency);
    const convertedTag = display.amount !== null && display.isConverted ? " (converted)" : "";

    const messageLines = [
      "Hello shamah Horizon,",
      `I'm enquiring about: ${title}${location ? ` (${location})` : ""}.`,
      `Preferred currency: ${currency}.`,
      `Listed price: ${price}${convertedTag}.`,
      "Please share availability, payment options, and next steps.",
    ];

    const message = messageLines.join("\n");

    if (via === "whatsapp") {
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    const subject = `Diaspora Enquiry - ${title}`;
    const mailto = `mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailto;
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/plots`);
        if (!res.ok) throw new Error("Failed to load plots");
        const raw = await res.json();
        const rows = Array.isArray(raw) ? raw : [];
        setPlots(rows);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load plots for Diaspora", err);
        setPlots([]);
      } finally {
        setLoading(false);
      }
    })();

    (async () => {
      try {
        const cachedRaw = typeof window !== "undefined" ? window.localStorage.getItem(FX_CACHE_KEY) : null;
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw) as { rate: number; ts: number };
          if (
            cached &&
            typeof cached.rate === "number" &&
            Number.isFinite(cached.rate) &&
            typeof cached.ts === "number" &&
            Date.now() - cached.ts < FX_CACHE_TTL_MS
          ) {
            setUsdToZmw(cached.rate);
            setFxIsLive(true);
            return;
          }
        }

        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 6000);
        const res = await fetch("https://open.er-api.com/v6/latest/USD", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        window.clearTimeout(timeout);
        if (!res.ok) throw new Error(`FX HTTP ${res.status}`);
        const json = (await res.json()) as any;
        const rate = toFiniteNumber(json?.rates?.ZMW);
        if (rate === null || rate <= 0) throw new Error("FX rate missing");
        setUsdToZmw(rate);
        setFxIsLive(true);
        try {
          window.localStorage.setItem(FX_CACHE_KEY, JSON.stringify({ rate, ts: Date.now() }));
        } catch {
          // ignore
        }
      } catch {
        setUsdToZmw(DEFAULT_USD_TO_ZMW);
        setFxIsLive(false);
      }
    })();

    // (Ambient audio removed: the asset wasn't present and caused build/runtime noise.)
  }, []);

  const locations = useMemo(() => {
    const set = new Set<string>();
    for (const p of plots) {
      const loc = p?.location ? String(p.location).trim() : "";
      if (loc) set.add(loc);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [plots]);

  const filteredPlots = useMemo(() => {
    const q = query.trim().toLowerCase();
    const budget = maxBudget.trim() ? Number(maxBudget) : null;
    const hasBudget = budget !== null && Number.isFinite(budget) && budget! > 0;

    const rows = plots
      .filter((p) => {
        if (locationFilter !== "all") {
          const loc = p?.location ? String(p.location) : "";
          if (loc !== locationFilter) return false;
        }
        if (q) {
          const title = p?.title ? String(p.title).toLowerCase() : "";
          const loc = p?.location ? String(p.location).toLowerCase() : "";
          if (!title.includes(q) && !loc.includes(q)) return false;
        }

        if (hasBudget) {
          const display = getDisplayPrice(p, currency);
          if (display.amount === null) return false;
          if (display.amount > (budget as number)) return false;
        }

        return true;
      })
      .slice();

    if (sort === "newest") {
      rows.sort((a, b) => {
        const ta = a?.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b?.created_at ? new Date(b.created_at).getTime() : 0;
        return tb - ta;
      });
    } else {
      rows.sort((a, b) => {
        const da = getDisplayPrice(a, currency).amount ?? Number.POSITIVE_INFINITY;
        const db = getDisplayPrice(b, currency).amount ?? Number.POSITIVE_INFINITY;
        return sort === "price_low" ? da - db : db - da;
      });
    }

    return rows;
  }, [plots, query, locationFilter, maxBudget, sort, currency, usdToZmw]);

  const scrollToListings = () => {
    listingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Layout>
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-950/90 to-background" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url(/hero-diaspora.svg)" }}
        />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative container py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm border border-white/10">
                <CheckCircle className="h-4 w-4 text-emerald-300" /> Safe & Secure
              </span>
              <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm border border-white/10">
                <Sparkles className="h-4 w-4 text-amber-300" /> Verified listings
              </span>
            </div>

            <h1 className="mt-6 text-4xl md:text-6xl font-heading font-bold tracking-tight">
              Invest from Anywhere
            </h1>
            <p className="mt-4 text-base md:text-lg text-white/80 max-w-2xl">
              A premium remote buying experience — verified documentation, secure payments, and on-the-ground support from selection to title.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <Button
                className="bg-emerald-600 hover:bg-emerald-600/90 text-white shadow-lg shadow-emerald-500/20"
                onClick={scrollToListings}
              >
                Browse available plots <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="flex items-center gap-3">
                <div className="text-xs text-white/70">Currency</div>
                <div className="inline-flex rounded-full bg-white/10 p-1 border border-white/10">
                  <button
                    type="button"
                    className={`px-4 py-1.5 rounded-full text-sm transition active:scale-[0.98] ${
                      currency === "ZMW" ? "bg-emerald-600 text-white" : "text-white/80 hover:text-white"
                    }`}
                    onClick={() => setCurrency("ZMW")}
                  >
                    ZMW
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-1.5 rounded-full text-sm transition active:scale-[0.98] ${
                      currency === "USD" ? "bg-emerald-600 text-white" : "text-white/80 hover:text-white"
                    }`}
                    onClick={() => setCurrency("USD")}
                  >
                    USD
                  </button>
                </div>

                <div className="hidden md:flex items-center gap-2 text-xs text-white/70">
                  <span
                    className={`h-2 w-2 rounded-full ${fxIsLive ? "bg-emerald-300" : "bg-amber-300"} ${
                      fxIsLive ? "animate-pulse" : ""
                    }`}
                  />
                  <span>
                    1 USD ≈ K{usdToZmw.toFixed(2)} {fxIsLive ? "" : "(fallback)"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12" ref={listingsRef}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-card border border-border/60 hover:border-emerald-500/30 transition">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold">Verified Documentation</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              We verify titles, land surveys, and ownership records for every listing.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border/60 hover:border-amber-500/30 transition">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="font-semibold">Secure Payments</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Multiple payment methods with clear steps and support for international buyers.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border/60 hover:border-sky-500/30 transition">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-sky-600" />
              </div>
              <h3 className="font-semibold">On-the-ground Support</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              We coordinate viewings, documentation, and handover while you’re abroad.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-border/60 bg-card/60 backdrop-blur p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <div className="text-sm font-semibold">Find a plot</div>
              <div className="mt-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title or location…"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="w-full md:w-56">
              <div className="text-sm font-semibold">Location</div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {locations.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-56">
              <div className="text-sm font-semibold">Sort</div>
              <Select value={sort} onValueChange={(v) => setSort(v as any)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Newest" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price_low">Price: Low → High</SelectItem>
                  <SelectItem value="price_high">Price: High → Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-56">
              <div className="text-sm font-semibold">Max budget ({currency})</div>
              <Input
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                inputMode="numeric"
                placeholder={currency === "USD" ? "e.g. 5000" : "e.g. 150000"}
                className="mt-2"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredPlots.length}</span> of {plots.length}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <Sparkles className="mr-1 h-3.5 w-3.5" /> FX {fxIsLive ? "Live" : "Fallback"}
              </Badge>
              <div className="text-xs text-muted-foreground">1 USD ≈ K{usdToZmw.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/60 bg-card overflow-hidden animate-pulse">
                  <div className="h-44 bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-2/3 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                    <div className="h-8 w-full bg-muted rounded" />
                  </div>
                </div>
              ))
            : filteredPlots.map((p) => (
                <article
                  key={p.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/properties/${p.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") navigate(`/properties/${p.id}`);
                  }}
                  className="group relative rounded-xl overflow-hidden border border-border/60 bg-card shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                >
                  <div className="relative">
                    <img
                      src={(Array.isArray(p.images) && p.images[0]) || "/placeholder.svg"}
                      alt={p.title}
                      className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-70" />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/10 text-white border border-white/15">Diaspora</Badge>
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Badge className="bg-white/10 text-white border border-white/15">Open</Badge>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="font-semibold leading-snug line-clamp-1">{p.title}</h4>
                        <div className="mt-1 text-sm text-muted-foreground line-clamp-1">{p.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {(() => {
                            const display = getDisplayPrice(p, currency);
                            return display.amount === null
                              ? "—"
                              : `${formatMoney(display.amount, display.currency)}${display.isConverted ? "*" : ""}`;
                          })()}
                        </div>
                        <div className="text-xs text-muted-foreground">{currency}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="group-hover:border-emerald-500/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/properties/${p.id}`);
                        }}
                      >
                        View details
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-600/90">
                            Enquire
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuItem onClick={() => openEnquiry(p, "whatsapp")} className="cursor-pointer">
                            <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEnquiry(p, "email")} className="cursor-pointer">
                            <Mail className="mr-2 h-4 w-4" /> Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </article>
              ))}
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          {currency === "USD" ? "* Converted from ZMW" : "* Converted from USD"}
        </div>
      </section>

      <section className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl font-bold mb-6">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-card rounded flex flex-col items-start gap-3">
              <div className="inline-flex items-center gap-2"><Globe /> <span className="font-semibold">Step 1</span></div>
              <div className="text-sm">Selection — Choose verified plots online.</div>
            </div>
            <div className="p-4 bg-card rounded flex flex-col items-start gap-3">
              <div className="inline-flex items-center gap-2"><FileText /> <span className="font-semibold">Step 2</span></div>
              <div className="text-sm">Legal — We handle documentation and transfers.</div>
            </div>
            <div className="p-4 bg-card rounded flex flex-col items-start gap-3">
              <div className="inline-flex items-center gap-2"><CheckCircle /> <span className="font-semibold">Step 3</span></div>
              <div className="text-sm">Title — Finalize title and handover remotely.</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
