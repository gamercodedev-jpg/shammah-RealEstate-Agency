// Supabase Edge Function (Deno/TypeScript): PII Mediator
// Purpose: Insert an audit log entry for PII access then return PII for a report.
// Security: This function MUST be protected by a secret (e.g., MEDIATOR_SECRET) and require a valid session.

/// <reference lib="deno.window" />
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

serve(async (req: Request) => {
  try {
    const secret = Deno.env.get('MEDIATOR_SECRET');
    const authHeader = req.headers.get('x-mediary-secret') || req.headers.get('x-mediator-secret') || req.headers.get('authorization');
    if (!secret || !authHeader) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    // simple header check (recommend better auth in production)
    if (authHeader !== `Bearer ${secret}` && authHeader !== secret) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });

    const body = await req.json();
    const reportId = body?.report_id;
    const reason = body?.reason || 'PII request';
    const actorId = body?.actor_id || null; // prefer server-inserted actor from JWT in production

    if (!reportId) return new Response(JSON.stringify({ error: 'missing report_id' }), { status: 400 });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: 'server misconfigured' }), { status: 500 });

    // 1) Insert audit_logs entry using service role
    const auditRow = {
      actor_id: actorId,
      report_id: reportId,
      action: 'PII_VIEW',
      reason,
      created_at: new Date().toISOString(),
    };

    await fetch(`${supabaseUrl}/rest/v1/audit_logs`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(auditRow),
    });

    // 2) Fetch PII from reports table (service role)
    const r = await fetch(`${supabaseUrl}/rest/v1/reports?id=eq.${reportId}&select=reporter_name,reporter_phone`, {
      method: 'GET',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    if (!r.ok) return new Response(JSON.stringify({ error: 'failed to fetch pii' }), { status: 502 });
    const data = await r.json();

    return new Response(JSON.stringify({ data: data[0] || null }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
