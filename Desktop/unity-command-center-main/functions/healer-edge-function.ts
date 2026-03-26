// Supabase Edge Function: Healer
// Triggered by DB webhook when a new report is inserted. It validates and auto-corrects common errors.
// Environment variables required: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { serve } from 'std/server';

const PROVINCES = [
  'Central','Copperbelt','Eastern','Luapula','Lusaka','Muchinga','Northern','North-Western','Southern','Western'
];

serve(async (req: Request) => {
  try {
    const evt = await req.json();
    const record = evt?.record || evt?.new || {};
    const id = record?.id;
    if (!id) return new Response('no record', { status: 400 });

    // Basic heuristics: fix province via fuzzy match
    let province = (record.province || '').trim();
    const normalized = province.toLowerCase();
    let best = PROVINCES.find(p => p.toLowerCase() === normalized);
    if (!best) {
      // simple substring match
      best = PROVINCES.find(p => normalized && p.toLowerCase().startsWith(normalized[0]));
    }

    // If still not confident, ask AI
    if (!best) {
      const openaiKey = Deno.env.get('OPENAI_API_KEY');
      if (openaiKey) {
        const prompt = `Suggest the most likely Zambian province name for this input: "${province}". Return only the province name.`;
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
          body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 16 }),
        });
        const jj = await resp.json();
        const text = jj?.choices?.[0]?.message?.content || jj?.choices?.[0]?.text || '';
        const m = text.match(/[A-Za-z\s]+/);
        if (m) {
          const suggestion = m[0].trim();
          if (PROVINCES.includes(suggestion)) best = suggestion;
        }
      }
    }

    // Validate phone: remove non-digits and check length (Zambia country code +260 or local 09)
    let phone = (record.reporter_phone || '').toString();
    const digits = phone.replace(/\D/g,'');
    if (digits.length >= 9 && digits.length <= 13) {
      phone = digits;
    }

    // If we made corrections, update the record using Supabase service role
    if (best || phone !== (record.reporter_phone || '')) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (!supabaseUrl || !serviceKey) return new Response('no supabase creds', { status: 500 });

      const updates: any = {};
      if (best) updates.province = best;
      if (phone) updates.reporter_phone = phone;

      await fetch(`${supabaseUrl}/rest/v1/reports?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify(updates),
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
