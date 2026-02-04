import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "shammah.db");
const db = new Database(dbPath);

// Initialize schema if it doesn't exist
// Clean schema: only the columns we actually use.
db.exec(`
  CREATE TABLE IF NOT EXISTS plots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    price_zmw INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    video_url TEXT,
    audio_url TEXT,
    is_sold INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS plot_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plot_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    headline TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    image_url TEXT NOT NULL,
    video_url TEXT,
    audio_url TEXT,
    published_at TEXT NOT NULL
  );
`);

// Ensure newer columns exist when upgrading an existing DB
const plotColumns = db.prepare("PRAGMA table_info(plots)").all();
const plotColumnNames = plotColumns.map((c) => c.name);
if (!plotColumnNames.includes("is_sold")) {
  db.prepare("ALTER TABLE plots ADD COLUMN is_sold INTEGER NOT NULL DEFAULT 0").run();
}
if (!plotColumnNames.includes("video_url")) {
  db.prepare("ALTER TABLE plots ADD COLUMN video_url TEXT").run();
}
if (!plotColumnNames.includes("audio_url")) {
  db.prepare("ALTER TABLE plots ADD COLUMN audio_url TEXT").run();
}

const newsColumns = db.prepare("PRAGMA table_info(news)").all();
const newsColumnNames = newsColumns.map((c) => c.name);
if (!newsColumnNames.includes("video_url")) {
  db.prepare("ALTER TABLE news ADD COLUMN video_url TEXT").run();
}
if (!newsColumnNames.includes("audio_url")) {
  db.prepare("ALTER TABLE news ADD COLUMN audio_url TEXT").run();
}

export default db;
