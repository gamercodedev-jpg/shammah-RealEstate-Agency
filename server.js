import express from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

// sqlite helper (only used in legacy scripts; production uses Supabase)
import config from "./config.js";

// Supabase client used for all persistent storage (replaces the ephemeral
// SQLite file in production). Environment variables must be set on deploy.
const supabase = createClient(
  "https://beagmgmrsmfovardrshc.supabase.co",
  "eyJhbGciOiJI…<your service role key>"
);
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
  console.warn("⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE not set; persistence will fail");
}

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

    // Persist plot to Supabase (and no longer rely on local SQLite).
    const { data: created, error: insertError } = await supabase
      .from("plots")
      .insert([{
        title,
        location,
        price_zmw: Number(price_zmw),
        image_url: primaryImageUrl,
        video_url: videoUrl,
        audio_url: audioUrl,
        is_sold: false,
        // store the full array in case the table has an "images" column
        images: imageUrls,
      }])
      .select()
      .single();
    if (insertError) throw insertError;
    // ensure the response includes the images array for compatibility
    return res.status(201).json({ ...created, images: imageUrls });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("POST /api/plots error", err);
    return res.status(500).json({ error: "Failed to create plot" });
  }
});

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
        // Delete old images from Cloudinary
        const oldUrls = [currentPlot.image_url, ...existingImages].filter(Boolean);
        for (const url of oldUrls) {
          const publicId = getPublicIdFromUrl(url);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (err) {
              console.error(`Failed to delete old image ${publicId}:`, err);
            }
          }
        }

        // Upload new images
        const uploadResults = await Promise.all(
          imageFiles.map((file) => uploadToCloudinary(file, "shammah/plots")),
        );

        updatedImages = uploadResults.map((r) => r.secure_url);
        primaryImageUrl = updatedImages[0];
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

    const allUrls = [];
    if (plot.image_url) allUrls.push(plot.image_url);
    if (plot.video_url) allUrls.push(plot.video_url);
    if (plot.audio_url) allUrls.push(plot.audio_url);
    if (plot.images && Array.isArray(plot.images)) allUrls.push(...plot.images);

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

    const { data: created, error: insertError } = await supabase
      .from("news")
      .insert([{
        headline,
        content,
        author,
        image_url: imageUrl,
        video_url: videoUrl,
        audio_url: audioUrl,
        published_at: new Date().toISOString(),
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
      .select("*")
      .order("published_at", { ascending: false });
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
      const id = Number(req.params.id);
      const { headline, content, author } = req.body;
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

      // Update in Supabase
      const { data: updated, error: updateError } = await supabase
        .from("news")
        .update({
          headline: headline || currentItem.headline,
          content: content || currentItem.content,
          author: author || currentItem.author,
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


