// Supabase Edge Function (Deno/TypeScript) - USSD State Machine
// This function accepts telecom provider requests and advances a user's USSD session.
// It stores minimal session state in `ussd_sessions` and never logs raw phone numbers.

import { serve } from 'std/server';

async function sha256hex(input: string) {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function maskPhone(phone: string) {
  // show only last 2 digits, prefix masked
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return '****';
  const last = digits.slice(-2);
  return '****' + last;
}

// Simple state machine definitions
const MENUS: Record<string, string> = {
  selecting_language: 'Select language:\n1. English\n2. Nyanja\n3. Bemba',
  selecting_incident: 'Select incident type:\n1. Rape\n2. Defilement\n3. Assault\n4. Other',
  selecting_province: 'Enter province name (e.g., Lusaka, Copperbelt):',
  selecting_district: 'Enter district:',
  entering_description: 'Please type a short description of the incident (max 240 chars):',
  confirm_submission: 'Send report? 1. Yes 2. No',
};

serve(async (req: Request) => {
  try {
    const body = await req.json();
    const sessionId = body.session_id || body.sessionId || null;
    const phone = body.phone || body.phoneNumber || body.msisdn || '';
    const input = (body.input || '').toString().trim();

    if (!phone) return new Response(JSON.stringify({ error: 'missing phone' }), { status: 400 });

    const hashed = await sha256hex(phone);
    const masked = maskPhone(phone);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: 'server misconfigured' }), { status: 500 });

    // 1) Find active session by sessionId or hashed phone
    const queryParams = new URLSearchParams();
    if (sessionId) queryParams.set('session_id', `eq.${sessionId}`);
    // also try hashed phone
    const sessionsRes = await fetch(`${supabaseUrl}/rest/v1/ussd_sessions?or=(session_id.eq.${encodeURIComponent(sessionId||'')},hashed_phone.eq.${hashed})&select=*`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });

    let session = null;
    if (sessionsRes.ok) {
      const arr = await sessionsRes.json();
      session = arr?.[0] || null;
    }

    // If session exists and is recent, present resume options
    if (session && !input) {
      return new Response(JSON.stringify({ menu: 'You have an unfinished report.\n1. Continue\n2. Start New', session_id: session.session_id, masked_phone: masked }), { status: 200 });
    }

    // If user chose to continue
    if (session && input === '1') {
      // return current step menu
      const step = session.current_step || 'selecting_language';
      const temp = session.temp_data || {};
      return new Response(JSON.stringify({ menu: MENUS[step] || MENUS.selecting_language, session_id: session.session_id, temp_data: temp }), { status: 200 });
    }

    // If user chose to start new
    if (session && input === '2') {
      // overwrite session
      const upRes = await fetch(`${supabaseUrl}/rest/v1/ussd_sessions`, {
        method: 'POST', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify({ session_id: sessionId || crypto.randomUUID(), hashed_phone: hashed, current_step: 'selecting_language', temp_data: {} }),
      });
      const newS = await upRes.json();
      return new Response(JSON.stringify({ menu: MENUS.selecting_language, session_id: (newS?.[0]?.session_id || sessionId || null) }), { status: 200 });
    }

    // No session: start one
    if (!session) {
      const sid = sessionId || crypto.randomUUID();
      await fetch(`${supabaseUrl}/rest/v1/ussd_sessions`, {
        method: 'POST', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid, hashed_phone: hashed, current_step: 'selecting_language', temp_data: {} }),
      });
      return new Response(JSON.stringify({ menu: MENUS.selecting_language, session_id: sid, masked_phone: masked }), { status: 200 });
    }

    // Otherwise, we have a session and an input. Advance the state machine.
    let currentStep = session.current_step || 'selecting_language';
    let temp = session.temp_data || {};
    const sid = session.session_id;

    // helper to persist session
    async function persist(step: string, tmp: any) {
      await fetch(`${supabaseUrl}/rest/v1/ussd_sessions?session_id=eq.${sid}`, {
        method: 'PATCH', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_step: step, temp_data: tmp, last_activity: new Date().toISOString() }),
      });
    }

    // state transitions
    if (currentStep === 'selecting_language') {
      const lang = input === '1' ? 'en' : input === '2' ? 'ny' : input === '3' ? 'bm' : 'en';
      temp.language = lang;
      currentStep = 'selecting_incident';
      await persist(currentStep, temp);
      return new Response(JSON.stringify({ menu: MENUS.selecting_incident, session_id: sid }), { status: 200 });
    }

    if (currentStep === 'selecting_incident') {
      const map = { '1': 'Rape', '2': 'Defilement', '3': 'Assault', '4': 'Other' };
      temp.incident_type = map[input] || 'Other';
      currentStep = 'selecting_province';
      await persist(currentStep, temp);
      return new Response(JSON.stringify({ menu: MENUS.selecting_province, session_id: sid }), { status: 200 });
    }

    if (currentStep === 'selecting_province') {
      temp.province = input;
      currentStep = 'selecting_district';
      await persist(currentStep, temp);
      return new Response(JSON.stringify({ menu: MENUS.selecting_district, session_id: sid }), { status: 200 });
    }

    if (currentStep === 'selecting_district') {
      temp.district = input;
      currentStep = 'entering_description';
      await persist(currentStep, temp);
      return new Response(JSON.stringify({ menu: MENUS.entering_description, session_id: sid }), { status: 200 });
    }

    if (currentStep === 'entering_description') {
      temp.description = input.slice(0, 240);
      // call AI triage function to clean text and produce urgency/category
      const triageUrl = Deno.env.get('USSD_TRIAGE_URL');
      let triageRes = null;
      if (triageUrl) {
        try {
          const r = await fetch(triageUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input_text: temp.description, phone_language: temp.language }) });
          triageRes = await r.json();
        } catch (e) { triageRes = null; }
      }

      // If AI asks for more info, persist and ask
      if (triageRes?.need_more_info) {
        temp.ai = triageRes;
        await persist('entering_description', temp);
        return new Response(JSON.stringify({ menu: 'Please provide more details. What else happened? (short)', session_id: sid }), { status: 200 });
      }

      // Finalize: insert into reports table using service role key (redacted storage pattern recommended)
      const reportsUrl = `${supabaseUrl}/rest/v1/reports`;
      const reportPayload: any = {
        incident_type: temp.incident_type || 'Other',
        province: temp.province || null,
        district: temp.district || null,
        description: temp.description,
        reporter_phone_hashed: hashed,
        reporter_phone_masked: masked,
        report_channel: 'USSD',
        status: 'New',
        created_at: new Date().toISOString(),
      };

      // include AI fields if present
      if (triageRes) {
        reportPayload.urgency_score = triageRes.urgency_score;
        reportPayload.category = triageRes.category;
        reportPayload.ai_summary = triageRes.summary;
      }

      await fetch(reportsUrl, { method: 'POST', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(reportPayload) });

      // clear session
      await fetch(`${supabaseUrl}/rest/v1/ussd_sessions?session_id=eq.${sid}`, { method: 'DELETE', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } });

      return new Response(JSON.stringify({ menu: 'Thank you. Your report has been submitted and responders will be alerted.', session_id: null }), { status: 200 });
    }

    // default fallback
    return new Response(JSON.stringify({ menu: MENUS.selecting_language, session_id: session.session_id }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
