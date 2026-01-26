import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
          description: "Your Supabase project is missing the inquiries table. Run the SQL in supabase/migrations/20260125_one_click_setup_free_mode.sql, then reload and try again.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Submission failed", description: error.message, variant: "destructive" });
      }
      return;
    }
    toast({ title: "Inquiry submitted", description: "We'll get back to you shortly." });
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
  }

  return (
    <section className="py-16 bg-background relative">
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('/src/assets/shamah-logo.png')] bg-center bg-no-repeat bg-contain" />
      <div className="container max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="inline-flex items-center gap-2">← Back to Home</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="font-heading text-3xl font-bold">Contact Us</h2>
            <div className="bg-card p-6 rounded-lg">
              <h3 className="font-medium mb-3">Get in touch</h3>
              <p className="text-sm text-muted-foreground/80 mb-4">Reach us via phone, WhatsApp or email and we'll respond as soon as possible.</p>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium">Phone</div>
                  <a href="tel:0975705555" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">0975705555</a>
                </div>
                <div>
                  <div className="text-sm font-medium">WhatsApp</div>
                  <a href="https://wa.me/260975705555" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">+260 975705555 (WhatsApp)</a>
                </div>
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <a href="mailto:alexkabinga83@gmail.com" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">alexkabinga83@gmail.com</a>
                </div>
              </div>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg shadow">
              <div>
                <label className="text-sm font-medium">Full name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
              </div>

              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={submitting}>
                  {submitting ? "Sending..." : "Send Inquiry"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
