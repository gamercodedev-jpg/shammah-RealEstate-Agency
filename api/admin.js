import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_SERVICE_ROLE;

const ALLOWED_TABLES = ["plots", "feeds", "news", "inquiries"];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    return res.status(500).json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE env" });
  }

  let body = req.body;
  // Some serverless platforms provide body parsed, others don't
  if (!body && req.headers["content-type"]?.includes("application/json")) {
    try {
      body = await new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => resolve(JSON.parse(data)));
        req.on("error", reject);
      });
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
  }

  const { action, table, row, id, limit, publishedOnly } = body || {};
  if (!action || !table) return res.status(400).json({ error: "Missing action or table" });
  if (!ALLOWED_TABLES.includes(table)) return res.status(400).json({ error: "Table not allowed" });

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  try {
    if (action === "select") {
      // Keep this safe: only allow reading feeds, and only published (or null) rows.
      if (table !== "feeds") return res.status(400).json({ error: "Select not allowed for this table" });
      let q = supabaseAdmin.from("feeds").select("*").order("created_at", { ascending: false });
      if (publishedOnly !== false) {
        q = q.or("is_published.is.true,is_published.is.null");
      }
      const safeLimit = Math.max(1, Math.min(Number(limit || 20), 50));
      q = q.limit(safeLimit);
      const { data, error } = await q;
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ data });
    }

    if (action === "insert") {
      const { data, error } = await supabaseAdmin.from(table).insert([row]).select().single();
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ data });
    }

    if (action === "update") {
      if (!id) return res.status(400).json({ error: "Missing id for update" });
      const { data, error } = await supabaseAdmin.from(table).update(row).eq("id", id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ data });
    }

    if (action === "delete") {
      if (!id) return res.status(400).json({ error: "Missing id for delete" });
      const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
