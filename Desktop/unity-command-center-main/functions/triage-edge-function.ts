// Supabase Edge Function (Deno/TypeScript) - Triage AI
// Deploy this to Supabase Edge Functions. Requires OPENAI_API_KEY or similar.

import { serve } from 'std/server';

serve(async (req: Request) => {
  try {
    const body = await req.json();
    const description = (body.description || '').toString().slice(0, 2000);

    const prompt = `You are an assistant that classifies GBV incident reports. Respond with strict JSON only (no extra text) with keys: urgency_score (1-10 int), category (Physical|Emotional|Financial), summary (2 sentences).\n\nReport description:\n${description}`;

    const openaiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPENAI_KEY');
    if (!openaiKey) return new Response(JSON.stringify({ error: 'OPENAI_API_KEY missing' }), { status: 500 });

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 200 }),
    });

    const j = await resp.json();
    // Try extracting JSON from the AI output
    const text = j?.choices?.[0]?.message?.content || j?.choices?.[0]?.text || '';

    // Attempt to parse first JSON block
    const m = text.match(/\{[\s\S]*\}/);
    const parsed = m ? JSON.parse(m[0]) : null;

    if (!parsed) {
      return new Response(JSON.stringify({ error: 'AI did not return JSON', raw: text }), { status: 502 });
    }

    return new Response(JSON.stringify(parsed), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
