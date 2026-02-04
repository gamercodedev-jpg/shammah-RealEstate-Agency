import express from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import db from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "public", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

// Serve uploads as static so frontend can render /uploads/...
app.use("/uploads", express.static(uploadsDir));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_");
    cb(null, `${timestamp}_${safeName}`);
  },
});

const upload = multer({ storage });

// Helper to build local URL path stored in DB
function buildImagePath(filename) {
  return `/uploads/${filename}`;
}

// --- PLOTS API ---

app.post("/api/plots", upload.single("image"), (req, res) => {
  try {
    const { title, location, price_zmw } = req.body;
    const file = req.file;

    if (!title || !location || !price_zmw) {
      return res.status(400).json({ error: "title, location, and price_zmw are required" });
    }

    if (!file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const imageUrl = buildImagePath(file.filename);

    const stmt = db.prepare(
      "INSERT INTO plots (title, location, price_zmw, image_url, created_at) VALUES (?, ?, ?, ?, datetime('now'))"
    );
    const info = stmt.run(title, location, Number(price_zmw), imageUrl);

    const inserted = db.prepare("SELECT * FROM plots WHERE id = ?").get(info.lastInsertRowid);
    return res.status(201).json(inserted);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("POST /api/plots error", err);
    return res.status(500).json({ error: "Failed to create plot" });
  }
});

app.get("/api/plots", (_req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM plots ORDER BY datetime(created_at) DESC").all();
    return res.json(rows);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/plots error", err);
    return res.status(500).json({ error: "Failed to load plots" });
  }
});

app.delete("/api/plots/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const stmt = db.prepare("DELETE FROM plots WHERE id = ?");
    const info = stmt.run(id);
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

app.post("/api/news", upload.single("image"), (req, res) => {
  try {
    const { headline, content, author } = req.body;
    const file = req.file;

    if (!headline || !content || !author) {
      return res.status(400).json({ error: "headline, content, and author are required" });
    }

    if (!file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const imageUrl = buildImagePath(file.filename);

    const stmt = db.prepare(
      "INSERT INTO news (headline, content, author, image_url, published_at) VALUES (?, ?, ?, ?, datetime('now'))"
    );
    const info = stmt.run(headline, content, author, imageUrl);

    const inserted = db.prepare("SELECT * FROM news WHERE id = ?").get(info.lastInsertRowid);
    return res.status(201).json(inserted);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("POST /api/news error", err);
    return res.status(500).json({ error: "Failed to create news item" });
  }
});

app.get("/api/news", (_req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM news ORDER BY datetime(published_at) DESC").all();
    return res.json(rows);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/news error", err);
    return res.status(500).json({ error: "Failed to load news" });
  }
});

app.delete("/api/news/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const stmt = db.prepare("DELETE FROM news WHERE id = ?");
    const info = stmt.run(id);
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

// Fallback: send index.html for any non-API route (SPA routing support)
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Shammah API server running on http://localhost:${PORT}`);
});
