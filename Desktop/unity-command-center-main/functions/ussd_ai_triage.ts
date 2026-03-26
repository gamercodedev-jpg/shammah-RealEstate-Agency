// Supabase Edge Function (Deno/TypeScript) - USSD AI Triage
// Receives raw USSD input text and returns cleaned JSON with language, incident_type, urgency_score, summary

import { serve } from 'std/server';

serve(async (req: Request) => {
  try {
    const body = await req.json();
    const inputText = (body.input_text || '').toString().slice(0, 2000);
    if (!inputText || inputText.trim().length < 10) {
      return new Response(JSON.stringify({ need_more_info: true, reason: 'input_too_short' }), { status: 200 });
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) return new Response(JSON.stringify({ error: 'OPENAI_API_KEY missing' }), { status: 500 });

    const prompt = `You are a JSON-only assistant. Detect language (English, Nyanja, Bemba), extract incident type (Rape/Defilement/Assault/Other), and give an urgency_score 1-10 and a 2-sentence summary. Return strict JSON like: {"language":"English","incident_type":"Rape","urgency_score":8,"summary":"..."}. If unclear, return {"need_more_info":true}.\n\nUser input:\n${inputText}`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 200 }),
    });

    const j = await resp.json();
    const text = j?.choices?.[0]?.message?.content || j?.choices?.[0]?.text || '';

    // extract JSON object
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return new Response(JSON.stringify({ need_more_info: true }), { status: 200 });

    try {
      const parsed = JSON.parse(m[0]);
      // normalize
      const out: any = {};
      out.language = parsed.language || 'unknown';
      out.incident_type = parsed.incident_type || parsed.category || 'Other';
      out.urgency_score = Number(parsed.urgency_score) || 1;
      out.summary = parsed.summary || '';
      return new Response(JSON.stringify(out), { status: 200 });
    } catch (e) {
      return new Response(JSON.stringify({ need_more_info: true }), { status: 200 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
