import sqlite3 from "sqlite3";
import path from "node:path";

sqlite3.verbose();

// Use absolute path based on current directory for Linux server compatibility
const dbPath = path.resolve(process.cwd(), "shammah.db");
// eslint-disable-next-line no-console
console.log("Database path:", dbPath);

const rawDb = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    // eslint-disable-next-line no-console
    console.error("Database connection error:", err.message);
  } else {
    // eslint-disable-next-line no-console
    console.log("Connected to the SQLite database.");
  }
});

function exec(sql) {
  return new Promise((resolve, reject) => {
    rawDb.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    rawDb.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    rawDb.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    rawDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function close() {
  return new Promise((resolve, reject) => {
    rawDb.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function initSchema() {
  await exec("PRAGMA foreign_keys = ON;");

  // Initialize schema if it doesn't exist
  // Clean schema: only the columns we actually use.
  await exec(`
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
  const plotColumns = await all("PRAGMA table_info(plots)");
  const plotColumnNames = plotColumns.map((c) => c.name);
  if (!plotColumnNames.includes("is_sold")) {
    await exec(
      "ALTER TABLE plots ADD COLUMN is_sold INTEGER NOT NULL DEFAULT 0",
    );
  }
  if (!plotColumnNames.includes("video_url")) {
    await exec("ALTER TABLE plots ADD COLUMN video_url TEXT");
  }
  if (!plotColumnNames.includes("audio_url")) {
    await exec("ALTER TABLE plots ADD COLUMN audio_url TEXT");
  }

  const newsColumns = await all("PRAGMA table_info(news)");
  const newsColumnNames = newsColumns.map((c) => c.name);
  if (!newsColumnNames.includes("video_url")) {
    await exec("ALTER TABLE news ADD COLUMN video_url TEXT");
  }
  if (!newsColumnNames.includes("audio_url")) {
    await exec("ALTER TABLE news ADD COLUMN audio_url TEXT");
  }
}

await initSchema();

const db = {
  path: dbPath,
  raw: rawDb,
  exec,
  run,
  get,
  all,
  close,
};

export default db;
