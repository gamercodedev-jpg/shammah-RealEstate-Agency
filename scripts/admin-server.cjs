// Minimal local admin server using native http to avoid installing express.
(async () => {
  const http = require('http');
  const fs = require('fs');
  const path = require('path');
  const url = require('url');

  function loadDotEnvIfPresent(filePath) {
    try {
      if (!fs.existsSync(filePath)) return;
      const text = fs.readFileSync(filePath, 'utf8');
      for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const eq = line.indexOf('=');
        if (eq <= 0) continue;
        const key = line.slice(0, eq).trim();
        let value = line.slice(eq + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
      }
    } catch {
      // ignore
    }
  }

  // Load .env files for convenience when running locally (Node does not load these automatically)
  const cwd = process.cwd();
  loadDotEnvIfPresent(path.join(cwd, '.env'));
  loadDotEnvIfPresent(path.join(cwd, '.env.local'));

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_SERVICE_ROLE;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE env vars.');
    console.error('Tip: add SUPABASE_SERVICE_ROLE to .env.local (server-only) or set $env:SUPABASE_SERVICE_ROLE in PowerShell.');
    process.exit(1);
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } });

  const ALLOWED_TABLES = ['plots', 'feeds', 'news', 'inquiries'];

  const port = process.env.PORT ? Number(process.env.PORT) : 8787;

  const server = http.createServer(async (req, res) => {
    const parsed = url.parse(req.url || '', true);

    // Basic CORS for local development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }
    if (req.method === 'POST' && parsed.pathname === '/admin/db') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const json = body ? JSON.parse(body) : {};
          const { action, table, row, id, limit, publishedOnly } = json;
          if (!action || !table) return respond(400, { error: 'Missing action or table' });
          if (!ALLOWED_TABLES.includes(table)) return respond(400, { error: 'Table not allowed' });

          if (action === 'select') {
            // Keep this safe: only allow reading feeds, and only published (or null) rows.
            if (table !== 'feeds') return respond(400, { error: 'Select not allowed for this table' });
            let q = supabaseAdmin.from('feeds').select('*').order('created_at', { ascending: false });
            if (publishedOnly !== false) {
              // Treat null as published for legacy rows
              q = q.or('is_published.is.true,is_published.is.null');
            }
            const safeLimit = Math.max(1, Math.min(Number(limit || 20), 50));
            q = q.limit(safeLimit);
            const { data, error } = await q;
            if (error) return respond(400, { error: error.message });
            return respond(200, { data });
          }

          if (action === 'insert') {
            const { data, error } = await supabaseAdmin.from(table).insert([row]).select().single();
            if (error) return respond(400, { error: error.message });
            return respond(200, { data });
          }

          if (action === 'update') {
            if (!id) return respond(400, { error: 'Missing id for update' });
            const { data, error } = await supabaseAdmin.from(table).update(row).eq('id', id).select().single();
            if (error) return respond(400, { error: error.message });
            return respond(200, { data });
          }

          if (action === 'delete') {
            if (!id) return respond(400, { error: 'Missing id for delete' });
            const { error } = await supabaseAdmin.from(table).delete().eq('id', id);
            if (error) return respond(400, { error: error.message });
            return respond(200, { ok: true });
          }

          return respond(400, { error: 'Invalid action' });
        } catch (e) {
          return respond(500, { error: String(e) });
        }
      });
      function respond(status, obj) {
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(obj));
      }
      return;
    }

    res.statusCode = 404;
    res.end('Not found');
  });

  server.listen(port, () => {
    console.log('Admin server listening on http://localhost:' + port + '/admin/db');
  });

})();
