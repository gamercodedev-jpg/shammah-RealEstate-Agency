import express from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables (prefer .env.local if present)
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("Loaded .env.local from:", envPath);
} else {
  dotenv.config();
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.warn("⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE not set; persistence will fail");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log Supabase URL on startup for verification (does not log secrets)
console.log("Loaded SUPABASE_URL:", SUPABASE_URL ? SUPABASE_URL : "(not set)");

// API responses are dynamic (admin can create/delete). Prevent caching so refreshes
// always reflect the latest server state.
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// Multer configuration: keep files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Helper: upload a file buffer to Supabase Storage
async function uploadToSupabaseStorage(file, bucket, folder = "") {
  const fileName = `${Date.now()}-${file.originalname}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });
  if (error) throw error;
  // Get public URL
  const { publicUrl } = supabase.storage.from(bucket).getPublicUrl(filePath).data;
  return publicUrl;
}

// Helper: delete a file from Supabase Storage
async function deleteFromSupabaseStorage(url, bucket) {
  if (!url) return true;
  // Extract file path from public URL
  const parts = url.split(`/${bucket}/`);
  if (parts.length < 2) return false;
  const filePath = parts[1];
  const { error } = await supabase.storage.from(bucket).remove([filePath]);
  return !error;
}

// No Cloudinary logic remains

// --- PLOTS API ---

// Allow up to 10 images plus optional video & audio per plot
app.post(
  "/api/plots",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, location, price_zmw, size_sqm } = req.body;
      const files = req.files || {};
      const imageFiles = Array.isArray(files) ? files : files.images || [];
      const videoFile = !Array.isArray(files) && files.video ? files.video[0] : undefined;
      const audioFile = !Array.isArray(files) && files.audio ? files.audio[0] : undefined;

      if (!title || !location || !price_zmw) {
        return res.status(400).json({ error: "title, location, and price_zmw are required" });
      }

      if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
        return res.status(400).json({ error: "At least one image file is required" });
      }
      // Upload all images to Supabase Storage
      const imageUrls = await Promise.all(
        imageFiles.map((file) => uploadToSupabaseStorage(file, "plots-images")),
      );
      const primaryImageUrl = imageUrls[0];

      // Optional video & audio uploads
      let videoUrl = null;
      if (videoFile) {
        videoUrl = await uploadToSupabaseStorage(videoFile, "plots-videos");
      }

      let audioUrl = null;
      if (audioFile) {
        audioUrl = await uploadToSupabaseStorage(audioFile, "plots-audio");
      }

      // Persist plot to Supabase
      const { data: created, error: insertError } = await supabase
        .from("plots")
        .insert([{
          title,
          location,
          price_zmw: Number(price_zmw),
          size_sqm: size_sqm ? Number(size_sqm) : null,
          image_url: primaryImageUrl,
          video_url: videoUrl,
          audio_url: audioUrl,
          is_sold: false,
          images: imageUrls,
        }])
        .select()
        .single();
      if (insertError) throw insertError;
      return res.status(201).json({ ...created, images: imageUrls });
    } catch (err) {
      console.error("POST /api/plots error", err);
      return res.status(500).json({ error: "Failed to create plot" });
    }
  }
);

app.get("/api/plots", async (_req, res) => {
  try {
    const { data: plots, error } = await supabase
      .from("plots")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const result = plots.map((plot) => {
      const imgs = plot.images || (plot.image_url ? [plot.image_url] : []);
      return { ...plot, images: imgs };
    });

    return res.json(result);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/plots error", err);
    return res.status(500).json({ error: "Failed to load plots" });
  }
});

app.patch("/api/plots/:id/sold", async (req, res) => {
  try {
    const id = req.params.id;
    const { is_sold } = req.body ?? {};

    if (typeof is_sold !== "boolean") {
      return res.status(400).json({ error: "is_sold (boolean) is required" });
    }

    const { data: updated, error } = await supabase
      .from("plots")
      .update({ is_sold })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    return res.json(updated);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("PATCH /api/plots/:id/sold error", err);
    return res.status(500).json({ error: "Failed to mark plot sold" });
  }
});

app.patch(
  "/api/plots/:id",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { title, location, price_zmw } = req.body;
      const files = req.files || {};
      const imageFiles = !Array.isArray(files) && files.images ? files.images : [];
      const videoFile = !Array.isArray(files) && files.video ? files.video[0] : undefined;
      const audioFile = !Array.isArray(files) && files.audio ? files.audio[0] : undefined;

      // Get the current plot from Supabase
      const { data: currentPlot, error: fetchError } = await supabase
        .from("plots")
        .select("*")
        .eq("id", id)
        .single();
      if (fetchError) throw fetchError;
      if (!currentPlot) {
        return res.status(404).json({ error: "Plot not found" });
      }

      // Update basic fields
      const newTitle = title || currentPlot.title;
      const newLocation = location || currentPlot.location;
      const newPriceZmw = price_zmw ? Number(price_zmw) : currentPlot.price_zmw;

      let primaryImageUrl = currentPlot.image_url;
      const existingImages = currentPlot.images || [];

      // Handle new images if provided
      let updatedImages = existingImages;
      if (imageFiles && imageFiles.length > 0) {
        // Upload new images to Supabase Storage
        updatedImages = await Promise.all(
          imageFiles.map((file) => uploadToSupabaseStorage(file, "plots-images")),
        );
        primaryImageUrl = updatedImages[0];
      }

      // Handle new video if provided
      let videoUrl = currentPlot.video_url;
      if (videoFile) {
        videoUrl = await uploadToSupabaseStorage(videoFile, "plots-videos");
      }

      // Handle new audio if provided
      let audioUrl = currentPlot.audio_url;
      if (audioFile) {
        audioUrl = await uploadToSupabaseStorage(audioFile, "plots-audio");
      }

      // Update plot record in Supabase
      const { data: updated, error: updateError } = await supabase
        .from("plots")
        .update({
          title: newTitle,
          location: newLocation,
          price_zmw: newPriceZmw,
          image_url: primaryImageUrl,
          video_url: videoUrl,
          audio_url: audioUrl,
          images: updatedImages,
        })
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;

      const imageUrls = updated.images || (primaryImageUrl ? [primaryImageUrl] : []);

      return res.json({ ...updated, images: imageUrls.length > 0 ? imageUrls : [primaryImageUrl] });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("PATCH /api/plots/:id error", err);
      return res.status(500).json({ error: "Failed to update plot" });
    }
  },
);

app.delete("/api/plots/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch plot from Supabase so we know what media to clean up
    const { data: plot, error: fetchError } = await supabase
      .from("plots")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;
    if (!plot) return res.status(404).json({ error: "Plot not found" });

    // Delete from Supabase Storage (optional: implement if you want to remove files)
    // Supabase Storage does not auto-delete files when DB record is deleted.
    // You can implement file deletion here if needed, using supabase.storage.from(bucket).remove([filePath])

    // Remove from Supabase
    const { error: deleteError } = await supabase
      .from("plots")
      .delete()
      .eq("id", id);
    if (deleteError) throw deleteError;

    return res.status(204).end();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("DELETE /api/plots/:id error", err);
    return res.status(500).json({ error: "Failed to delete plot" });
  }
});

// --- NEWS API ---

app.post(
  "/api/news",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
  try {
    const { title, content } = req.body;
    const files = req.files || {};
    const imageFile = !Array.isArray(files) && files.image ? files.image[0] : undefined;
    const videoFile = !Array.isArray(files) && files.video ? files.video[0] : undefined;
    const audioFile = !Array.isArray(files) && files.audio ? files.audio[0] : undefined;

    if (!title || !content) {
      return res.status(400).json({ error: "title and content are required" });
    }

    if (!imageFile) {
      return res.status(400).json({ error: "Image file is required" });
    }
    const imageUrl = await uploadToSupabaseStorage(imageFile, "news-images");

    let videoUrl = null;
    if (videoFile) {
      videoUrl = await uploadToSupabaseStorage(videoFile, "news-videos");
    }

    let audioUrl = null;
    if (audioFile) {
      audioUrl = await uploadToSupabaseStorage(audioFile, "news-audio");
    }

    const { data: created, error: insertError } = await supabase
      .from("news")
      .insert([{
        title,
        content,
        image_url: imageUrl,
        video_url: videoUrl,
        audio_url: audioUrl,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();
    if (insertError) throw insertError;
    return res.status(201).json(created);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("POST /api/news error", err);
    return res.status(500).json({ error: "Failed to create news item" });
  }
});

app.get("/api/news", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("news")
      .select("id,title,content,image_url,video_url,audio_url,created_at")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/news error", err);
    return res.status(500).json({ error: "Failed to load news" });
  }
});

app.patch(
  "/api/news/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const id = req.params.id;
      const { title, content } = req.body;
      const files = req.files || {};
      const imageFile = !Array.isArray(files) && files.image ? files.image[0] : undefined;
      const videoFile = !Array.isArray(files) && files.video ? files.video[0] : undefined;
      const audioFile = !Array.isArray(files) && files.audio ? files.audio[0] : undefined;

      // Get the current news item from Supabase
      const { data: currentItem, error: fetchError } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();
      if (fetchError) throw fetchError;
      if (!currentItem) {
        return res.status(404).json({ error: "News item not found" });
      }

      // Upload new image if provided
      let imageUrl = currentItem.image_url;
      if (imageFile) {
        imageUrl = await uploadToSupabaseStorage(imageFile, "news-images");
      }

      // Upload new video if provided
      let videoUrl = currentItem.video_url;
      if (videoFile) {
        videoUrl = await uploadToSupabaseStorage(videoFile, "news-videos");
      }

      // Upload new audio if provided
      let audioUrl = currentItem.audio_url;
      if (audioFile) {
        audioUrl = await uploadToSupabaseStorage(audioFile, "news-audio");
      }

      // Update in Supabase
      const { data: updated, error: updateError } = await supabase
        .from("news")
        .update({
          title: title || currentItem.title,
          content: content || currentItem.content,
          image_url: imageUrl,
          video_url: videoUrl,
          audio_url: audioUrl,
        })
        .eq("id", id)
        .select()
        .single();
      if (updateError) throw updateError;

      return res.json(updated);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("PATCH /api/news/:id error", err);
      return res.status(500).json({ error: "Failed to update news item" });
    }
  },
);

app.delete("/api/news/:id", async (req, res) => {
  try {
    const id = req.params.id;
    
    // Get the news item from Supabase
    const { data: newsItem, error: fetchError } = await supabase
      .from("news")
      .select("image_url, video_url, audio_url")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;
    if (!newsItem) {
      return res.status(404).json({ error: "News item not found" });
    }
    
    const urls = [newsItem.image_url, newsItem.video_url, newsItem.audio_url].filter(Boolean);
    
    // Delete from Supabase Storage (optional: implement if you want to remove files)
    // Supabase Storage does not auto-delete files when DB record is deleted.
    // You can implement file deletion here if needed, using supabase.storage.from(bucket).remove([filePath])
    
    // Delete from Supabase
    const { error: deleteError } = await supabase
      .from("news")
      .delete()
      .eq("id", id);
    if (deleteError) throw deleteError;

    return res.status(204).end();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("DELETE /api/news/:id error", err);
    return res.status(500).json({ error: "Failed to delete news item" });
  }
});

// --- STATIC FRONTEND BUILD ---

// Serve the built React app from /dist when running in production mode
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// Fallback: send index.html for any non-API route (SPA routing support),
// but leave /api/* to the API handlers above.
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }
  return res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Shammah API server running on http://localhost:${PORT}`);
});


