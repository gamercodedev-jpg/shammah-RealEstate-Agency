import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
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
    // legacy fallback
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
    const colors = ["#2C9143", "#D4AF37", "#0B3D2E", "#F2D16B", "#1F6B33", "#C89F2D"];
    const count = 46;
    const rng = (n: number) => {
      const x = Math.sin(seed + n * 97.13) * 10000;
      return x - Math.floor(x);
    };

    return Array.from({ length: count }).map((_, i) => {
      const left = 10 + rng(i) * 80;
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
    const lines = [
      "Hello Shammah Horizon,",
      name.trim() ? `My name is ${name.trim()}.` : "",
      phone.trim() ? `Phone: ${phone.trim()}` : "",
      email.trim() ? `Email: ${email.trim()}` : "",
      message.trim() ? message.trim() : "I would like to enquire about your properties.",
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
    setSubmitting(true);

    // For the local-first handover, skip backend storage and
    // encourage the user to reach out via WhatsApp/email instead.
    setConfettiSeed(Date.now());
    window.setTimeout(() => setConfettiSeed(null), 1600);
    toast({
      title: "Inquiry drafted",
      description: "Use WhatsApp, call, or email to send your message directly.",
    });
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setSubmitting(false);
  }

  return (
    <Layout>
      {confettiSeed !== null ? <ConfettiBurst seed={confettiSeed} /> : null}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />
        
        {/* FIXED LOGO PATH - Use /shammah-logo.png from public folder */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none opacity-[0.025] bg-center bg-no-repeat bg-contain"
          style={{ backgroundImage: "url('/shammah-logo.png')" }}
        />

        <div className="container py-14 relative z-10">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              ← Back to Home
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <Badge variant="secondary" className="bg-primary/10 text-primary">We reply fast on WhatsApp</Badge>
              <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight">Let's talk about your property</h1>
              <p className="text-base text-muted-foreground">Tap a card to reach us instantly or fill out the form.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="cursor-pointer" onClick={() => window.open(buildWhatsAppUrl(enquiryText), "_blank")}>
                  <CardHeader className="pb-2"><CardTitle className="text-base">WhatsApp</CardTitle></CardHeader>
                  <CardContent className="text-sm font-semibold">{CONTACT.whatsappDisplay}</CardContent>
                </Card>
                <Card className="cursor-pointer" onClick={() => (window.location.href = `tel:${CONTACT.phoneTel}`)}>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Call</CardTitle></CardHeader>
                  <CardContent className="text-sm font-semibold">{CONTACT.phoneDisplay}</CardContent>
                </Card>
                <Card className="cursor-pointer" onClick={() => (window.location.href = buildMailto("Enquiry", enquiryText))}>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Email</CardTitle></CardHeader>
                  <CardContent className="text-sm font-semibold truncate">{CONTACT.email}</CardContent>
                </Card>
              </div>
            </div>

            <Card className="shadow-xl bg-card/95">
              <CardHeader><CardTitle>Send an inquiry</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required />
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email (optional)" />
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" />
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" className="min-h-28" />
                  <Button type="submit" className="w-full bg-primary text-white" disabled={submitting}>
                    {submitting ? "Sending..." : "Send Inquiry"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}