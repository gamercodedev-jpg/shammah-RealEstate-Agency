import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load .env.local as fallback
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("✓ Loaded .env.local from:", envPath);
} else {
  console.log("⚠ No .env.local found, using process.env only");
}

// Configuration object with fallbacks
const config = {
  // Server configuration
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  
  // Database configuration
  database: {
    path: path.resolve(process.cwd(), "shammah.db"),
    name: "shammah.db"
  },
  
  // Cloudinary configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET || ""
  },
  
  // API configuration
  api: {
    baseUrl: process.env.VITE_API_BASE_URL || "http://localhost:4000"
  }
};

// Validation function
export function validateConfig() {
  const errors = [];
  
  if (!config.cloudinary.cloudName) {
    errors.push("Missing CLOUDINARY_CLOUD_NAME");
  }
  if (!config.cloudinary.apiKey) {
    errors.push("Missing CLOUDINARY_API_KEY");
  }
  if (!config.cloudinary.apiSecret) {
    errors.push("Missing CLOUDINARY_API_SECRET");
  }
  
  if (errors.length > 0) {
    console.error("❌ Configuration errors:", errors);
    return { valid: false, errors };
  }
  
  console.log("✓ Configuration validated successfully");
  return { valid: true, errors: [] };
}

// Log configuration status (without exposing secrets)
console.log("Configuration loaded:", {
  port: config.port,
  nodeEnv: config.nodeEnv,
  dbPath: config.database.path,
  cloudinary: {
    cloudName: config.cloudinary.cloudName,
    hasApiKey: !!config.cloudinary.apiKey,
    hasApiSecret: !!config.cloudinary.apiSecret
  },
  apiBaseUrl: config.api.baseUrl
});

export default config;
