Healer Edge Function webhook instructions

Overview

This project includes `functions/healer-edge-function.ts`, an Edge Function that validates/corrects incoming `reports` (province typos, phone numbers) and patches the DB via the Supabase service role key.

Recommended webhook options:

1) Supabase DB -> Edge Function (recommended)
- In the Supabase Dashboard, go to "Database" → "Triggers" (or use the CLI) and create a trigger that calls your Edge Function URL on INSERT to `reports`.
- Supabase does not provide a direct "HTTP call from trigger" out-of-the-box inside Postgres, so the simplest approach is to use the Supabase Dashboard's "Replication / Webhooks" feature (or third-party service) that forwards row changes to an HTTPS endpoint.

2) Use `pg_notify` + background listener
- Create a Postgres trigger that calls `pg_notify('new_report', row_to_json(NEW)::text)` on insert. Run a small background worker (Node/deno) that listens to the database via `LISTEN new_report` and then POSTs the payload to the Edge Function URL.

Example SQL: create a NOTIFY trigger

```sql
CREATE OR REPLACE FUNCTION public.notify_new_report() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('new_report', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_new_report_trigger ON public.reports;
CREATE TRIGGER notify_new_report_trigger
  AFTER INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_report();
```

Listener (example in Node):

```js
// Listen to pg NOTIFY and forward to Edge function
import { Client } from 'pg';
import fetch from 'node-fetch';

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
client.on('notification', async (msg) => {
  if (msg.channel === 'new_report') {
    try {
      await fetch(process.env.HEALER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: msg.payload });
    } catch (e) { console.error('forward failed', e); }
  }
});
await client.query('LISTEN new_report');
```

3) Supabase replication/webhook via 3rd party
- Use a small integration (e.g., n8n, Zapier, or Supabase's own integrations) to forward DB inserts to the Edge function.

Security

- The Edge Function should verify a shared secret (e.g., `HEALER_SECRET`) provided as an environment variable. Only accept requests that include a matching header.
- The Edge Function should use the Supabase Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`) to perform updates.

Deployment checklist

- Deploy `functions/healer-edge-function.ts` to Supabase Edge Functions and set env vars: `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `HEALER_SECRET`.
- Configure the trigger mechanism (pg_notify + listener, or dashboard webhook) to call the function URL with the new row payload.

