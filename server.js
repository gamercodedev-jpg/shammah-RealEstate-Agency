import express from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";

import db from "./db.js";
import config from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.port;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API responses are dynamic (admin can create/delete). Prevent caching so refreshes
// always reflect the latest server state.
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// Configure Cloudinary from config (which has environment fallbacks)
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// Multer configuration: keep files in memory, then upload to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Helper: upload a file buffer using cloudinary.uploader.upload
async function uploadToCloudinary(file, folder, resourceType = "image") {
  const base64 = file.buffer.toString("base64");
  const dataUri = `data:${file.mimetype};base64,${base64}`;
  return cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: resourceType,
  });
}

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
    const { title, location, price_zmw } = req.body;
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
    // Upload all images to Cloudinary
    const uploadResults = await Promise.all(
      imageFiles.map((file) => uploadToCloudinary(file, "shammah/plots")),
    );

    const imageUrls = uploadResults.map((r) => r.secure_url);
    const primaryImageUrl = imageUrls[0];

    // Optional video & audio uploads
    let videoUrl = null;
    if (videoFile) {
      const videoResult = await uploadToCloudinary(
        videoFile,
        "shammah/plots/videos",
        "video",
      );
      videoUrl = videoResult.secure_url;
    }

    let audioUrl = null;
    if (audioFile) {
      const audioResult = await uploadToCloudinary(
        audioFile,
        "shammah/plots/audio",
        "video",
      );
      audioUrl = audioResult.secure_url;
    }

    // Insert the main plot record with a primary image URL
    const info = await db.run(
      "INSERT INTO plots (title, location, price_zmw, image_url, video_url, audio_url, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
      [
        title,
        location,
        Number(price_zmw),
        primaryImageUrl,
        videoUrl,
        audioUrl,
      ],
    );

    // Insert all image URLs into plot_images linked to this plot
    const plotId = Number(info.lastID);
    for (const url of imageUrls) {
      // eslint-disable-next-line no-await-in-loop
      await db.run("INSERT INTO plot_images (plot_id, image_url) VALUES (?, ?)", [
        plotId,
        url,
      ]);
    }

    const inserted = await db.get("SELECT * FROM plots WHERE id = ?", [plotId]);
    return res.status(201).json({ ...inserted, images: imageUrls });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("POST /api/plots error", err);
    return res.status(500).json({ error: "Failed to create plot" });
  }
});

app.get("/api/plots", async (_req, res) => {
  try {
    const plots = await db.all(
      "SELECT * FROM plots ORDER BY datetime(created_at) DESC",
    );

    const images = await db.all(
      "SELECT plot_id, image_url FROM plot_images ORDER BY id ASC",
    );

    const imagesByPlot = new Map();
    for (const row of images) {
      const key = row.plot_id;
      if (!imagesByPlot.has(key)) imagesByPlot.set(key, []);
      imagesByPlot.get(key).push(row.image_url);
    }

    const result = plots.map((plot) => {
      const imgs = imagesByPlot.get(plot.id) || (plot.image_url ? [plot.image_url] : []);
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
    const id = Number(req.params.id);
    const { is_sold } = req.body ?? {};

    if (typeof is_sold !== "boolean") {
      return res.status(400).json({ error: "is_sold (boolean) is required" });
    }

    const info = await db.run("UPDATE plots SET is_sold = ? WHERE id = ?", [
      is_sold ? 1 : 0,
      id,
    ]);

    if (info.changes === 0) {
      return res.status(404).json({ error: "Plot not found" });
    }

    const updated = await db.get("SELECT * FROM plots WHERE id = ?", [id]);
    return res.json(updated);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("PATCH /api/plots/:id/sold error", err);
    return res.status(500).json({ error: "Failed to update sold status" });
  }
});

app.delete("/api/plots/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const info = await db.run("DELETE FROM plots WHERE id = ?", [id]);
    if (info.changes === 0) {
      return res.status(404).json({ error: "Plot not found" });
    }
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
    const { headline, content, author } = req.body;
    const files = req.files || {};
    const imageFile = !Array.isArray(files) && files.image ? files.image[0] : undefined;
    const videoFile = !Array.isArray(files) && files.video ? files.video[0] : undefined;
    const audioFile = !Array.isArray(files) && files.audio ? files.audio[0] : undefined;

    if (!headline || !content || !author) {
      return res.status(400).json({ error: "headline, content, and author are required" });
    }

    if (!imageFile) {
      return res.status(400).json({ error: "Image file is required" });
    }
    const uploadResult = await uploadToCloudinary(imageFile, "shammah/news");
    const imageUrl = uploadResult.secure_url;

    let videoUrl = null;
    if (videoFile) {
      const videoResult = await uploadToCloudinary(
        videoFile,
        "shammah/news/videos",
        "video",
      );
      videoUrl = videoResult.secure_url;
    }

    let audioUrl = null;
    if (audioFile) {
      const audioResult = await uploadToCloudinary(
        audioFile,
        "shammah/news/audio",
        "video",
      );
      audioUrl = audioResult.secure_url;
    }

    const info = await db.run(
      "INSERT INTO news (headline, content, author, image_url, video_url, audio_url, published_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
      [headline, content, author, imageUrl, videoUrl, audioUrl],
    );

    const inserted = await db.get("SELECT * FROM news WHERE id = ?", [info.lastID]);
    return res.status(201).json(inserted);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("POST /api/news error", err);
    return res.status(500).json({ error: "Failed to create news item" });
  }
});

app.get("/api/news", async (_req, res) => {
  try {
    const rows = await db.all(
      "SELECT * FROM news ORDER BY datetime(published_at) DESC",
    );
    return res.json(rows);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/news error", err);
    return res.status(500).json({ error: "Failed to load news" });
  }
});

app.delete("/api/news/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const info = await db.run("DELETE FROM news WHERE id = ?", [id]);
    if (info.changes === 0) {
      return res.status(404).json({ error: "News item not found" });
    }
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
