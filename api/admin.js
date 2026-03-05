import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";
import config from "../config.js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_SERVICE_ROLE;

const ALLOWED_TABLES = ["plots", "feeds", "news", "inquiries"];

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// Helper function to extract public_id from Cloudinary URL
function getPublicIdFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  // Match the part after /upload/ and before the extension
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
  return match ? match[1] : null;
}

// Helper function to delete media from Cloudinary
async function deleteFromCloudinary(url) {
  const publicId = getPublicIdFromUrl(url);
  if (publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log(`Deleted from Cloudinary: ${publicId}`, result);
      return true;
    } catch (err) {
      console.error(`Failed to delete ${publicId} from Cloudinary:`, err);
      return false;
    }
  }
  return true; // No public_id, consider success
}

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
      
      // Delete old media from Cloudinary if URLs changed
      const oldUrls = [currentRow.image_url, currentRow.video_url, currentRow.audio_url];
      const newUrls = [updatedRow.image_url, updatedRow.video_url, updatedRow.audio_url];
      
      for (let i = 0; i < oldUrls.length; i++) {
        if (oldUrls[i] && oldUrls[i] !== newUrls[i]) {
          await deleteFromCloudinary(oldUrls[i]); // Don't fail the update if this fails
        }
      }
      
      return res.json({ data: updatedRow });
    }

    if (action === "delete") {
      if (!id) return res.status(400).json({ error: "Missing id for delete" });
      
      // First, fetch the row to get media URLs
      const { data: row, error: fetchError } = await supabaseAdmin.from(table).select('*').eq("id", id).single();
      if (fetchError) return res.status(400).json({ error: fetchError.message });
      
      // Delete media from Cloudinary
      const mediaUrls = [row.image_url, row.video_url, row.audio_url].filter(Boolean);
      const deletePromises = mediaUrls.map(deleteFromCloudinary);
      const deleteResults = await Promise.all(deletePromises);
      
      // If any Cloudinary deletion failed, don't delete from Supabase
      if (deleteResults.includes(false)) {
        return res.status(500).json({ error: "Failed to delete media from Cloudinary" });
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
