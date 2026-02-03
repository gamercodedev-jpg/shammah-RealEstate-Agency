import { useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ToastAction } from "@/components/ui/toast";
import { ArrowRight, CheckCircle2, Phone, Sparkles } from "lucide-react";
import shamahLogo from "@/assets/shamah-logo.png";

const CONTACT = {
  phoneDisplay: "0975705555",
  phoneTel: "0975705555",
  whatsappInternational: "260975705555",
  whatsappDisplay: "+260 975705555",
  email: "alexkabinga83@gmail.com",
} as const;

function buildWhatsAppUrl(text: string) {
  return `https://wa.me/${CONTACT.whatsappInternational}?text=${encodeURIComponent(text)}`;
}

const planOptions = [
  { value: "finishing", label: "Finishing Plan (Tiling/Plastering/Paint)" },
  { value: "electrical", label: "Electrical Plan (Wiring & fittings)" },
  { value: "plumbing", label: "Plumbing Plan" },
  { value: "landscaping", label: "Landscaping Plan" },
  { value: "materials", label: "Material Account (Installments)" },
  { value: "custom", label: "Custom Plan" },
];

const serviceOptions = ["Tiling", "Wiring", "Plumbing", "Plastering", "Landscaping"] as const;

export default function BuildingJourney() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState<string>("finishing");
  const [services, setServices] = useState<Record<(typeof serviceOptions)[number], boolean>>({
    Tiling: false,
    Wiring: false,
    Plumbing: false,
    Plastering: false,
    Landscaping: false,
  });
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedServices = useMemo(() => serviceOptions.filter((s) => services[s]), [services]);
  const planLabel = useMemo(
    () => planOptions.find((p) => p.value === plan)?.label || plan,
    [plan]
  );

  const enquiryText = useMemo(() => {
    const lines = [
      "Hello shamah Horizon,",
      "I want to start my Building Journey.",
      fullName.trim() ? `Full name: ${fullName.trim()}` : "",
      phone.trim() ? `Phone: ${phone.trim()}` : "",
      email.trim() ? `Email: ${email.trim()}` : "",
      "",
      `Plan: ${planLabel}`,
      selectedServices.length ? `Services needed: ${selectedServices.join(", ")}` : "",
      notes.trim() ? `Notes: ${notes.trim()}` : "",
      "",
      "Please advise the best next steps.",
    ].filter(Boolean);

    return lines.join("\n");
  }, [fullName, phone, email, planLabel, selectedServices, notes]);

  const completion = useMemo(() => {
    const steps = [
      Boolean(fullName.trim()),
      Boolean(phone.trim() || email.trim()),
      Boolean(plan),
      Boolean(selectedServices.length || notes.trim()),
    ];
    const done = steps.filter(Boolean).length;
    return Math.round((done / steps.length) * 100);
  }, [fullName, phone, email, plan, selectedServices.length, notes]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim()) {
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

    const messageParts = ["Building Journey Request", enquiryText].filter(Boolean);

    const { error } = await supabase.from("inquiries").insert([
      {
        name: fullName,
        email: email || null,
        phone,
        message: messageParts.join("\n"),
        plot_id: null,
      },
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

    toast({
      title: "Submitted",
      description: "We received your request. Want faster response? Message us on WhatsApp.",
      action: (
        <ToastAction
          altText="Open WhatsApp"
          onClick={() => window.open(buildWhatsAppUrl(enquiryText), "_blank", "noopener,noreferrer")}
        >
          WhatsApp
        </ToastAction>
      ),
    });
    setFullName("");
    setEmail("");
    setPhone("");
    setPlan("finishing");
    setServices({ Tiling: false, Wiring: false, Plumbing: false, Plastering: false, Landscaping: false });
    setNotes("");
  }

  return (
    <Layout>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div aria-hidden="true" className="absolute -top-24 -right-24 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 -left-24 -z-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 pointer-events-none opacity-[0.03] bg-center bg-no-repeat bg-contain"
          style={{ backgroundImage: `url(${shamahLogo})` }}
        />

        <div className="container py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-2 space-y-5 lg:sticky lg:top-24">
              <div className="space-y-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="mr-1 h-3.5 w-3.5" /> Start Your Building Journey
                </Badge>
                <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">Choose a plan</h1>
                <p className="text-muted-foreground">
                  Share your details and preferences. We’ll advise the best plan and next steps — fast.
                </p>
              </div>

              <Card className="bg-card/95 border border-border/70 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Progress</CardTitle>
                  <CardDescription>Complete the form to get a tailored plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{completion}% complete</div>
                    <div className="text-xs text-muted-foreground">Takes ~1 minute</div>
                  </div>
                  <Progress value={completion} className="h-2" />

                  <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                    <div className="text-xs text-muted-foreground">Selected plan</div>
                    <div className="mt-1 font-semibold leading-snug">{planLabel}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedServices.length ? (
                        selectedServices.map((s) => (
                          <Badge key={s} variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> {s}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No extra services selected (optional).</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      type="button"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                      onClick={() => window.open(buildWhatsAppUrl(enquiryText), "_blank", "noopener,noreferrer")}
                    >
                      WhatsApp us <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button type="button" variant="outline" className="border-border/70" asChild>
                      <a href={`tel:${CONTACT.phoneTel}`} className="inline-flex items-center">
                        <Phone className="mr-2 h-4 w-4" /> Call {CONTACT.phoneDisplay}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Card className="bg-card/95 border border-border/70 shadow-xl shadow-primary/10">
                <CardHeader>
                  <CardTitle>Plans form</CardTitle>
                  <CardDescription>Neat, quick, and tailored to your needs.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full name</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 0975…"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="email">Email (optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={CONTACT.email}
                        />
                        <p className="text-xs text-muted-foreground">Tip: Add phone or email so we can reach you.</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <Label>Choose your plan</Label>
                        <span className="text-xs text-muted-foreground">Tap a plan card</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {planOptions.map((p) => {
                          const active = plan === p.value;
                          return (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => setPlan(p.value)}
                              className={`text-left rounded-xl border p-4 transition-all active:scale-[0.99] ${
                                active
                                  ? "border-primary/40 bg-primary/5 shadow-sm"
                                  : "border-border/70 hover:border-primary/25 hover:bg-muted/30"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="font-semibold leading-snug">{p.label}</div>
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    {p.value === "materials"
                                      ? "Flexible installments for materials"
                                      : p.value === "custom"
                                      ? "Tell us what you need"
                                      : "Quickly scoped and scheduled"}
                                  </div>
                                </div>
                                {active ? (
                                  <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                                ) : (
                                  <Badge variant="secondary">Pick</Badge>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <Label>Services you need (optional)</Label>
                        <span className="text-xs text-muted-foreground">{selectedServices.length} selected</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {serviceOptions.map((s) => {
                          const checked = services[s];
                          return (
                            <label
                              key={s}
                              className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                                checked
                                  ? "border-primary/40 bg-primary/5"
                                  : "border-border/70 hover:bg-muted/30"
                              }`}
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) => setServices((prev) => ({ ...prev, [s]: Boolean(v) }))}
                              />
                              <span className="text-sm font-medium">{s}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <span className="text-xs text-muted-foreground">{notes.length}/600</span>
                      </div>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value.slice(0, 600))}
                        placeholder="Tell us what you want to build, location, timeline, budget, etc."
                        className="min-h-28"
                      />
                    </div>

                    <Separator />

                    <div className="flex flex-col sm:flex-row gap-3 justify-between">
                      <Button type="button" variant="outline" className="border-border/70" asChild>
                        <a href={`tel:${CONTACT.phoneTel}`}>Call Us: {CONTACT.phoneDisplay}</a>
                      </Button>

                      <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-sm"
                      >
                        {submitting ? "Submitting..." : "Submit"}
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      By submitting, you agree we may contact you to discuss your plan.
                    </p>
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
