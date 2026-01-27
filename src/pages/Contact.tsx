import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ToastAction } from "@/components/ui/toast";
import { Copy, Mail, MessageCircle, Phone, Send } from "lucide-react";
import shamahLogo from "@/assets/shamah-logo.png";

const CONTACT = {
  phoneDisplay: "0975705555",
  phoneTel: "0975705555",
  whatsappInternational: "260975705555",
  whatsappDisplay: "+260 975705555",
  email: "alexkabinga83@gmail.com",
} as const;

type Channel = "whatsapp" | "phone" | "email";

function buildWhatsAppUrl(text: string) {
  return `https://wa.me/${CONTACT.whatsappInternational}?text=${encodeURIComponent(text)}`;
}

function buildMailto(subject: string, body: string) {
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function copyToClipboard(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
    return;
  } catch {
    // fall through to legacy fallback
  }

  try {
    const el = document.createElement("textarea");
    el.value = value;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    if (ok) {
      toast({ title: "Copied", description: `${label} copied to clipboard.` });
      return;
    }
  } catch {
    // ignore
  }

  toast({ title: "Copy failed", description: "Please copy manually.", variant: "destructive" });
}

function ConfettiBurst({ seed }: { seed: number }) {
  const pieces = useMemo(() => {
    const colors = ["#2C9143", "#D4AF37", "#0B3D2E", "#F2D16B", "#1F6B33", "#C89F2D"]; // Shammah green/gold palette
    const count = 46;
    const rng = (n: number) => {
      // deterministic-ish based on seed so React strict mode doesn't look weird
      const x = Math.sin(seed + n * 97.13) * 10000;
      return x - Math.floor(x);
    };

    return Array.from({ length: count }).map((_, i) => {
      const left = 10 + rng(i) * 80; // %
      const delay = rng(i + 1) * 120;
      const duration = 900 + rng(i + 2) * 650;
      const rotate = -180 + rng(i + 3) * 360;
      const drift = -120 + rng(i + 4) * 240;
      const size = 6 + rng(i + 5) * 8;
      const color = colors[Math.floor(rng(i + 6) * colors.length)];
      return { left, delay, duration, rotate, drift, size, color, id: `${seed}-${i}` };
    });
  }, [seed]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[120] overflow-hidden">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translate3d(var(--dx), -10px, 0) rotate(var(--rot)); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translate3d(calc(var(--dx) * 1.6), 110vh, 0) rotate(calc(var(--rot) * 2)); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${Math.max(10, p.size * 1.6)}px`,
              backgroundColor: p.color,
              animation: `confetti-fall ${p.duration}ms cubic-bezier(.2,.8,.2,1) ${p.delay}ms forwards`,
              transform: "translate3d(0,0,0)",
              // custom props for animation
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...( { "--dx": `${p.drift}px`, "--rot": `${p.rotate}deg` } as any ),
            } as React.CSSProperties
          }
          className="absolute top-0 rounded-[2px] opacity-0 shadow-sm"
        />
      ))}
    </div>
  );
}

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [preferred, setPreferred] = useState<Channel>("whatsapp");
  const [confettiSeed, setConfettiSeed] = useState<number | null>(null);

  const enquiryText = useMemo(() => {
    const safeName = name.trim() || "";
    const safeEmail = email.trim() || "";
    const safePhone = phone.trim() || "";
    const safeMessage = message.trim() || "";

    const lines = [
      "Hello Shamah Horizon,",
      safeName ? `My name is ${safeName}.` : "",
      safePhone ? `Phone: ${safePhone}` : "",
      safeEmail ? `Email: ${safeEmail}` : "",
      safeMessage ? "" : "I would like to enquire about your properties.",
      safeMessage,
      "",
      "Thank you.",
    ].filter(Boolean);

    return lines.join("\n");
  }, [name, email, phone, message]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Missing name", description: "Please enter your full name.", variant: "destructive" });
      return;
    }
    if (!phone.trim() && !email.trim()) {
      toast({
        title: "Add a contact",
        description: "Please enter a phone number or email so we can reach you.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("inquiries").insert([
      { name, email: email || null, phone, message: message || null, plot_id: null },
    ]);
    setSubmitting(false);
    if (error) {
      const status = (error as any)?.status;
      const msg = String((error as any)?.message || "");
      if (status === 404 || msg.toLowerCase().includes("could not find") || msg.toLowerCase().includes("inquiries")) {
        toast({
          title: "Inquiry system not set up",
          description:
            "Your Supabase project is missing the inquiries table. Apply the SQL migrations in the supabase/migrations folder (or create an inquiries table), then reload and try again.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Submission failed", description: error.message, variant: "destructive" });
      }
      return;
    }

    setConfettiSeed(Date.now());
    window.setTimeout(() => setConfettiSeed(null), 1600);

    toast({
      title: "Inquiry sent!",
      description: "We’ll get back to you shortly. Need faster response? Message us on WhatsApp.",
      action: (
        <ToastAction
          altText="Open WhatsApp"
          onClick={() => window.open(buildWhatsAppUrl(enquiryText), "_blank", "noopener,noreferrer")}
        >
          WhatsApp
        </ToastAction>
      ),
    });
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
  }

  const openPreferred = () => {
    if (preferred === "whatsapp") {
      window.open(buildWhatsAppUrl(enquiryText), "_blank", "noopener,noreferrer");
      return;
    }
    if (preferred === "email") {
      window.location.href = buildMailto("New enquiry", enquiryText);
      return;
    }
    window.location.href = `tel:${CONTACT.phoneTel}`;
  };

  return (
    <Layout>
      {confettiSeed !== null ? <ConfettiBurst seed={confettiSeed} /> : null}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div aria-hidden="true" className="absolute -top-24 -right-24 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 -left-24 -z-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

        <div
          className="absolute inset-0 -z-10 pointer-events-none opacity-[0.025] bg-center bg-no-repeat bg-contain"
          style={{ backgroundImage: `url(${shamahLogo})` }}
        />

        <div className="container py-14 relative z-10">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
            >
              ← Back to Home
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div className="space-y-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                  We reply fast on WhatsApp
                </Badge>
                <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight">
                  Let’s talk about your next property
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-xl">
                  Choose how you want to reach us. Tap a card to open WhatsApp, call, or email instantly — or send a quick inquiry and we’ll respond.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => window.open(buildWhatsAppUrl(enquiryText), "_blank", "noopener,noreferrer")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      window.open(buildWhatsAppUrl(enquiryText), "_blank", "noopener,noreferrer");
                    }
                  }}
                  className="group cursor-pointer bg-card/95 border-primary/25 hover:border-primary/50 shadow-sm hover:shadow-lg transition-all"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="relative inline-flex">
                        <span className="absolute -inset-1 rounded-full bg-primary/20 animate-ping" />
                        <MessageCircle className="relative h-4 w-4 text-primary" />
                      </span>
                      WhatsApp
                    </CardTitle>
                    <CardDescription>Chat with us</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="text-sm font-semibold">{CONTACT.whatsappDisplay}</div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(buildWhatsAppUrl(enquiryText), "_blank", "noopener,noreferrer");
                        }}
                      >
                        Open
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-border/70 hover:border-primary/40"
                        onClick={(e) => {
                          e.stopPropagation();
                          void copyToClipboard(CONTACT.whatsappDisplay, "WhatsApp number");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => (window.location.href = `tel:${CONTACT.phoneTel}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") window.location.href = `tel:${CONTACT.phoneTel}`;
                  }}
                  className="group cursor-pointer bg-card/95 border-border/70 hover:border-primary/30 shadow-sm hover:shadow-lg transition-all"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" /> Call
                    </CardTitle>
                    <CardDescription>Speak to us</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="text-sm font-semibold">{CONTACT.phoneDisplay}</div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${CONTACT.phoneTel}`;
                        }}
                      >
                        Call
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-border/70 hover:border-primary/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          void copyToClipboard(CONTACT.phoneDisplay, "Phone number");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => (window.location.href = buildMailto("New enquiry", enquiryText))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") window.location.href = buildMailto("New enquiry", enquiryText);
                  }}
                  className="group cursor-pointer bg-card/95 border-border/70 hover:border-primary/30 shadow-sm hover:shadow-lg transition-all"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" /> Email
                    </CardTitle>
                    <CardDescription>Send details</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="text-sm font-semibold truncate">{CONTACT.email}</div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="bg-accent hover:bg-accent/90 text-white shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = buildMailto("New enquiry", enquiryText);
                        }}
                      >
                        Write
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-border/70 hover:border-primary/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          void copyToClipboard(CONTACT.email, "Email");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border border-border/60 bg-card/95 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Quick send</CardTitle>
                  <CardDescription>
                    Choose your preferred channel — then tap “Open” to start a message with your details pre-filled.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={preferred} onValueChange={(v) => setPreferred(v as Channel)} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2 rounded-lg border border-border/70 p-3 hover:bg-muted/40 transition">
                      <RadioGroupItem value="whatsapp" id="pref-whatsapp" />
                      <Label htmlFor="pref-whatsapp" className="cursor-pointer">WhatsApp</Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border border-border/70 p-3 hover:bg-muted/40 transition">
                      <RadioGroupItem value="phone" id="pref-phone" />
                      <Label htmlFor="pref-phone" className="cursor-pointer">Call</Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border border-border/70 p-3 hover:bg-muted/40 transition">
                      <RadioGroupItem value="email" id="pref-email" />
                      <Label htmlFor="pref-email" className="cursor-pointer">Email</Label>
                    </div>
                  </RadioGroup>

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                      Message preview updates live as you type.
                    </div>
                    <Button type="button" onClick={openPreferred} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                      <Send className="h-4 w-4" /> Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="shadow-xl shadow-primary/10 border border-border/70 bg-card/95">
                <CardHeader>
                  <CardTitle className="text-xl">Send an inquiry</CardTitle>
                  <CardDescription>
                    Fill in your details. We’ll contact you with availability, pricing, and next steps.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Full name</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
                      </div>
                      <div>
                        <Label className="text-sm">Email (optional)</Label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={CONTACT.email} />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Phone (optional)</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0975..." />
                      <p className="mt-1 text-xs text-muted-foreground">Tip: Add phone or email so we can reach you.</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Message (optional)</Label>
                        <span className="text-xs text-muted-foreground">{message.length}/600</span>
                      </div>
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value.slice(0, 600))}
                        placeholder="Tell us what you’re looking for (area, budget, plot size, viewing date, etc.)"
                        className="min-h-28"
                      />
                    </div>

                    <Separator />

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                      <div className="text-xs text-muted-foreground">
                        By submitting, you agree we may contact you about your inquiry.
                      </div>
                      <Button type="submit" className="bg-accent hover:bg-accent/90 text-white shadow-sm" disabled={submitting}>
                        {submitting ? "Sending..." : "Send Inquiry"}
                      </Button>
                    </div>

                    <div className="rounded-lg bg-muted/30 p-3 text-sm">
                      <div className="font-medium mb-1">Prefer instant response?</div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="gap-2"
                          onClick={() => window.open(buildWhatsAppUrl(enquiryText), "_blank", "noopener,noreferrer")}
                        >
                          <MessageCircle className="h-4 w-4" /> WhatsApp now
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2"
                          onClick={() => (window.location.href = buildMailto("New enquiry", enquiryText))}
                        >
                          <Mail className="h-4 w-4" /> Email now
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
