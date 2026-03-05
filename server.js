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

// Helper function to extract public_id from Cloudinary URL
function getPublicIdFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  // Match the part after /upload/ and before the extension
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
  return match ? match[1] : null;
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

      // Get the current plot
      const currentPlot = await db.get("SELECT * FROM plots WHERE id = ?", [id]);
      if (!currentPlot) {
        return res.status(404).json({ error: "Plot not found" });
      }

      // Update basic fields
      const newTitle = title || currentPlot.title;
      const newLocation = location || currentPlot.location;
      const newPriceZmw = price_zmw ? Number(price_zmw) : currentPlot.price_zmw;

      let primaryImageUrl = currentPlot.image_url;
      const existingImages = await db.all(
        "SELECT image_url FROM plot_images WHERE plot_id = ?",
        [id],
      );

      // Handle new images if provided
      if (imageFiles && imageFiles.length > 0) {
        // Delete old images from Cloudinary
        const oldUrls = [currentPlot.image_url, ...existingImages.map((r) => r.image_url)];
        for (const url of oldUrls) {
          if (url) {
            const publicId = getPublicIdFromUrl(url);
            if (publicId) {
              try {
                await cloudinary.uploader.destroy(publicId);
              } catch (err) {
                console.error(`Failed to delete old image ${publicId}:`, err);
              }
            }
          }
        }

        // Upload new images
        const uploadResults = await Promise.all(
          imageFiles.map((file) => uploadToCloudinary(file, "shammah/plots")),
        );

        const imageUrls = uploadResults.map((r) => r.secure_url);
        primaryImageUrl = imageUrls[0];

        // Clear old plot_images entries
        await db.run("DELETE FROM plot_images WHERE plot_id = ?", [id]);

        // Insert new image URLs into plot_images
        for (const url of imageUrls) {
          // eslint-disable-next-line no-await-in-loop
          await db.run("INSERT INTO plot_images (plot_id, image_url) VALUES (?, ?)", [
            id,
            url,
          ]);
        }
      }

      // Handle new video if provided
      let videoUrl = currentPlot.video_url;
      if (videoFile) {
        const videoResult = await uploadToCloudinary(
          videoFile,
          "shammah/plots/videos",
          "video",
        );
        videoUrl = videoResult.secure_url;
        // Delete old video
        if (currentPlot.video_url) {
          const publicId = getPublicIdFromUrl(currentPlot.video_url);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (err) {
              console.error(`Failed to delete old video ${publicId}:`, err);
            }
          }
        }
      }

      // Handle new audio if provided
      let audioUrl = currentPlot.audio_url;
      if (audioFile) {
        const audioResult = await uploadToCloudinary(
          audioFile,
          "shammah/plots/audio",
          "video",
        );
        audioUrl = audioResult.secure_url;
        // Delete old audio
        if (currentPlot.audio_url) {
          const publicId = getPublicIdFromUrl(currentPlot.audio_url);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (err) {
              console.error(`Failed to delete old audio ${publicId}:`, err);
            }
          }
        }
      }

      // Update plot record
      await db.run(
        "UPDATE plots SET title = ?, location = ?, price_zmw = ?, image_url = ?, video_url = ?, audio_url = ? WHERE id = ?",
        [newTitle, newLocation, newPriceZmw, primaryImageUrl, videoUrl, audioUrl, id],
      );

      const updated = await db.get("SELECT * FROM plots WHERE id = ?", [id]);
      const images = await db.all(
        "SELECT plot_id, image_url FROM plot_images WHERE plot_id = ?",
        [id],
      );
      const imageUrls = images.map((r) => r.image_url);

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
    const id = Number(req.params.id);
    
    // Get all images for this plot
    const plotImages = await db.all("SELECT image_url FROM plot_images WHERE plot_id = ?", [id]);
    const plot = await db.get("SELECT image_url, video_url, audio_url FROM plots WHERE id = ?", [id]);
    
    const allUrls = [];
    if (plot) {
      if (plot.image_url) allUrls.push(plot.image_url);
      if (plot.video_url) allUrls.push(plot.video_url);
      if (plot.audio_url) allUrls.push(plot.audio_url);
    }
    plotImages.forEach(img => allUrls.push(img.image_url));
    
    // Delete from Cloudinary
    const deletePromises = allUrls.map(async (url) => {
      const publicId = getPublicIdFromUrl(url);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted from Cloudinary: ${publicId}`);
        } catch (err) {
          console.error(`Failed to delete ${publicId}:`, err);
          return false;
        }
      }
      return true;
    });
    
    const results = await Promise.all(deletePromises);
    if (results.includes(false)) {
      return res.status(500).json({ error: "Failed to delete media from Cloudinary" });
    }
    
    // Delete from DB
    await db.run("DELETE FROM plot_images WHERE plot_id = ?", [id]);
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

app.patch(
  "/api/news/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { headline, content, author } = req.body;
      const files = req.files || {};
      const imageFile = !Array.isArray(files) && files.image ? files.image[0] : undefined;
      const videoFile = !Array.isArray(files) && files.video ? files.video[0] : undefined;
      const audioFile = !Array.isArray(files) && files.audio ? files.audio[0] : undefined;

      // Get the current news item
      const currentItem = await db.get("SELECT * FROM news WHERE id = ?", [id]);
      if (!currentItem) {
        return res.status(404).json({ error: "News item not found" });
      }

      // Upload new image if provided
      let imageUrl = currentItem.image_url;
      if (imageFile) {
        const uploadResult = await uploadToCloudinary(imageFile, "shammah/news");
        imageUrl = uploadResult.secure_url;
        // Delete old image from Cloudinary
        if (currentItem.image_url) {
          const publicId = getPublicIdFromUrl(currentItem.image_url);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (err) {
              console.error(`Failed to delete old image ${publicId}:`, err);
            }
          }
        }
      }

      // Upload new video if provided
      let videoUrl = currentItem.video_url;
      if (videoFile) {
        const videoResult = await uploadToCloudinary(videoFile, "shammah/news/videos", "video");
        videoUrl = videoResult.secure_url;
        // Delete old video from Cloudinary
        if (currentItem.video_url) {
          const publicId = getPublicIdFromUrl(currentItem.video_url);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (err) {
              console.error(`Failed to delete old video ${publicId}:`, err);
            }
          }
        }
      }

      // Upload new audio if provided
      let audioUrl = currentItem.audio_url;
      if (audioFile) {
        const audioResult = await uploadToCloudinary(audioFile, "shammah/news/audio", "video");
        audioUrl = audioResult.secure_url;
        // Delete old audio from Cloudinary
        if (currentItem.audio_url) {
          const publicId = getPublicIdFromUrl(currentItem.audio_url);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (err) {
              console.error(`Failed to delete old audio ${publicId}:`, err);
            }
          }
        }
      }

      // Update in DB
      await db.run(
        "UPDATE news SET headline = ?, content = ?, author = ?, image_url = ?, video_url = ?, audio_url = ? WHERE id = ?",
        [
          headline || currentItem.headline,
          content || currentItem.content,
          author || currentItem.author,
          imageUrl,
          videoUrl,
          audioUrl,
          id,
        ],
      );

      const updated = await db.get("SELECT * FROM news WHERE id = ?", [id]);
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
    const id = Number(req.params.id);
    
    // Get the news item
    const newsItem = await db.get("SELECT image_url, video_url, audio_url FROM news WHERE id = ?", [id]);
    if (!newsItem) {
      return res.status(404).json({ error: "News item not found" });
    }
    
    const urls = [newsItem.image_url, newsItem.video_url, newsItem.audio_url].filter(Boolean);
    
    // Delete from Cloudinary
    const deletePromises = urls.map(async (url) => {
      const publicId = getPublicIdFromUrl(url);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted from Cloudinary: ${publicId}`);
        } catch (err) {
          console.error(`Failed to delete ${publicId}:`, err);
          return false;
        }
      }
      return true;
    });
    
    const results = await Promise.all(deletePromises);
    if (results.includes(false)) {
      return res.status(500).json({ error: "Failed to delete media from Cloudinary" });
    }
    
    // Delete from DB
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
