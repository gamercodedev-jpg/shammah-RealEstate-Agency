import { createClient } from "@supabase/supabase-js";
import config from "../config.js";

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
      
      // Fetch current row
      const { data: currentRow, error: fetchError } = await supabaseAdmin.from(table).select('*').eq("id", id).single();
      if (fetchError) return res.status(400).json({ error: fetchError.message });
      
      // Update the row
      const { data: updatedRow, error } = await supabaseAdmin.from(table).update(row).eq("id", id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      
      // Delete old media from Supabase Storage if URLs changed
      const oldUrls = [currentRow.image_url, currentRow.video_url, currentRow.audio_url];
      const newUrls = [updatedRow.image_url, updatedRow.video_url, updatedRow.audio_url];
      const buckets = ["plots-images", "plots-videos", "plots-audio"];
      for (let i = 0; i < oldUrls.length; i++) {
        if (oldUrls[i] && oldUrls[i] !== newUrls[i]) {
          await deleteFromSupabaseStorage(oldUrls[i], buckets[i]);
        }
      }
      
      return res.json({ data: updatedRow });
    }

    if (action === "delete") {
      if (!id) return res.status(400).json({ error: "Missing id for delete" });
      
      // First, fetch the row to get media URLs
      const { data: row, error: fetchError } = await supabaseAdmin.from(table).select('*').eq("id", id).single();
      if (fetchError) return res.status(400).json({ error: fetchError.message });
      
      // Delete media from Supabase Storage
      const buckets = ["plots-images", "plots-videos", "plots-audio"];
      const mediaUrls = [row.image_url, row.video_url, row.audio_url];
      for (let i = 0; i < mediaUrls.length; i++) {
        if (mediaUrls[i]) {
          await deleteFromSupabaseStorage(mediaUrls[i], buckets[i]);
        }
      }
      
      // Now delete from Supabase
      const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}

// Helper: delete a file from Supabase Storage
async function deleteFromSupabaseStorage(url, bucket) {
  if (!url) return true;
  const parts = url.split(`/${bucket}/`);
  if (parts.length < 2) return false;
  const filePath = parts[1];
  const { error } = await supabaseAdmin.storage.from(bucket).remove([filePath]);
  return !error;
}
