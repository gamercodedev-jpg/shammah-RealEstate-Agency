'use strict';
// CommonJS admin helper using Node's global fetch (Node 18+). Run with: node scripts/admin-insert-example.cjs
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE');
  process.exit(1);
}

// POST /admin/db
// body: { action: 'insert'|'update'|'delete', table: string, row?: object, id?: string }
app.post('/admin/db', async (req, res) => {
  const { action, table, row, id } = req.body;
  if (!action || !table) return res.status(400).json({ error: 'missing action or table' });

  try {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    let opts = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_ROLE,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}`,
        Prefer: 'return=representation'
      },
      body: row ? JSON.stringify(row) : undefined,
    };

    if (action === 'insert') {
      // POST to table
    } else if (action === 'update') {
      if (!id || !row) return res.status(400).json({ error: 'missing id or row for update' });
      url = `${url}?id=eq.${encodeURIComponent(id)}`;
      opts.method = 'PATCH';
    } else if (action === 'delete') {
      if (!id) return res.status(400).json({ error: 'missing id for delete' });
      url = `${url}?id=eq.${encodeURIComponent(id)}`;
      opts.method = 'DELETE';
      opts.body = undefined;
    } else {
      return res.status(400).json({ error: 'unknown action' });
    }

    const resp = await fetch(url, opts);
    const json = await resp.json();
    if (!resp.ok) return res.status(resp.status).json({ error: json });
    return res.json({ data: json });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`Admin DB helper running on http://localhost:${PORT}`));
