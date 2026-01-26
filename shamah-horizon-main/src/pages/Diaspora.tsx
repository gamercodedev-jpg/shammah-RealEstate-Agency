import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { publicStorageUrl } from "@/integrations/supabase/utils";
import { Globe, CheckCircle, CreditCard, MapPin, FileText } from "lucide-react";
import { playGlobalAudio } from "@/hooks/use-global-audio";

export default function Diaspora() {
  const [plots, setPlots] = useState<any[]>([]);
  const [currency, setCurrency] = useState<"ZMW" | "USD">("USD");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("plots").select("*").order("created_at", { ascending: false });
      setPlots((data as any[]) || []);
    })();
    // attempt to play ambient diaspora track (if available)
    try {
      playGlobalAudio('/src/assets/diaspora-ambient.mp3');
    } catch {}
  }, []);

  return (
    <Layout>
      <section className="relative bg-black/60 text-white">
        <div className="bg-[url('/src/assets/hero-diaspora.jpg')] bg-cover bg-center absolute inset-0 opacity-40" />
        <div className="relative container py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
              <CheckCircle className="h-4 w-4 text-green-400" /> Safe & Secure
            </span>
            <h1 className="mt-6 text-4xl font-heading font-bold">Invest from Anywhere</h1>
            <p className="mt-4 text-lg text-muted-foreground">Full-service remote property investment with verified documentation and ongoing management.</p>
            <div className="mt-6 flex items-center gap-4">
              <Button className="bg-[color:var(--primary-foreground)] bg-green-600">Invest from Anywhere</Button>
              <div className="ml-4 flex items-center gap-2 text-sm">
                <div className="text-xs text-muted-foreground">Currency</div>
                <div className="inline-flex rounded bg-white/5 p-1">
                  <button className={`px-3 py-1 ${currency === 'ZMW' ? 'bg-white/10' : ''}`} onClick={() => setCurrency('ZMW')}>ZMW</button>
                  <button className={`px-3 py-1 ${currency === 'USD' ? 'bg-white/10' : ''}`} onClick={() => setCurrency('USD')}>USD</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-card rounded">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Verified Documentation</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">We verify titles, land surveys and ownership records for every plot.</p>
          </div>
          <div className="p-6 bg-card rounded">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Secure Payment Gateways</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Multiple payment methods with escrow options for international transfers.</p>
          </div>
          <div className="p-6 bg-card rounded">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Property Management</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">On-the-ground property caretaking, access and rental management services.</p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plots.map((p) => (
            <article key={p.id} className="bg-card rounded overflow-hidden shadow hover:shadow-lg transition-transform hover:translate-y-[-4px]">
              <img src={publicStorageUrl(p.images?.[0] || '') || '/src/assets/placeholder.jpg'} alt={p.title} className="h-48 w-full object-cover" />
              <div className="p-4">
                <h4 className="font-semibold">{p.title}</h4>
                <div className="mt-2 text-sm text-muted-foreground">{p.location}</div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="font-bold">{currency === 'USD' ? `$${p.price_usd.toLocaleString()}` : `K${p.price_zmw.toLocaleString()}`}</div>
                  <Button size="sm">Enquire</Button>
                </div>
              </div>
            </article>
          ))}
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
