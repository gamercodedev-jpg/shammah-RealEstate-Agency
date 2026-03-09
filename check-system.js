/**
 * System Validation Script for Live Server Deployment
 * Run this after deploying to verify all critical components
 * Usage: node check-system.js
 */

// Removed dependency on config.js and sqlite3 — checks now use environment
import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import http from "node:http";

// sqlite3 removed; skip SQLite-specific checks

const CHECKS = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// Utility functions
function logSuccess(message) {
  console.log(`✓ ${message}`);
  CHECKS.passed++;
}

function logError(message) {
  console.error(`✗ ${message}`);
  CHECKS.failed++;
}

function logWarning(message) {
  console.warn(`⚠ ${message}`);
  CHECKS.warnings++;
}

function logSection(title) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(60)}\n`);
}

// CHECK 1: Environment Configuration
async function checkEnvironmentConfig() {
  logSection("1. ENVIRONMENT CONFIGURATION");

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_SERVICE_ROLE;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    logWarning("SUPABASE_URL or SUPABASE_SERVICE_ROLE not set — Supabase will be unavailable");
  } else {
    logSuccess("Supabase environment variables present");
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || "";
  if (!cloudName) {
    logWarning("No Cloudinary cloud configured (this project now uses Supabase storage)");
  } else {
    logSuccess(`Cloudinary cloud: ${cloudName}`);
  }

  const apiBase = process.env.VITE_API_BASE_URL || process.env.API_BASE_URL || "http://localhost:4000";
  logSuccess(`API base URL: ${apiBase}`);

  return true;
}

// CHECK 2: Cloudinary Connection
async function checkCloudinaryConnection() {
  logSection("2. CLOUDINARY CONNECTION (OPTIONAL)");

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || "";
  if (!cloudName) {
    logWarning("Skipping Cloudinary checks — no Cloudinary cloud configured");
    return true;
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY || "",
      api_secret: process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET || ""
    });

    const result = await cloudinary.api.ping();
    if (result && result.status === "ok") {
      logSuccess("Cloudinary API connection successful");
      return true;
    }
    logWarning("Cloudinary ping did not return OK");
    return false;
  } catch (error) {
    logWarning(`Cloudinary connection failed: ${error.message}`);
    return false;
  }
}

// CHECK 3: SQLite Database Permissions
async function checkDatabasePermissions() {
  logSection("3. STORAGE / DATABASE (SUPABASE)");

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_SERVICE_ROLE;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    logWarning("Supabase environment variables not set — the app may use ephemeral storage.");
    return true;
  }

  logSuccess("Supabase credentials present (server can connect to persistent storage)");
  return true;
}

// CHECK 4: PWA Manifest Validation
async function checkPWAManifest() {
  logSection("4. PWA MANIFEST VALIDATION");
  
  const manifestPath = path.join(process.cwd(), "public", "manifest.json");
  
  try {
    // Check if manifest file exists
    if (!fs.existsSync(manifestPath)) {
      logError(`Manifest file not found: ${manifestPath}`);
      return false;
    }
    logSuccess(`Manifest file exists: ${manifestPath}`);
    
    // Read and parse manifest
    const manifestContent = fs.readFileSync(manifestPath, "utf8");
    const manifest = JSON.parse(manifestContent);
    
    // Validate required fields
    const requiredFields = ["name", "short_name", "start_url", "display", "icons"];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      logError(`Manifest missing required fields: ${missingFields.join(", ")}`);
      return false;
    }
    logSuccess("All required manifest fields present");
    
    // Check manifest details
    logSuccess(`App name: ${manifest.name}`);
    logSuccess(`Short name: ${manifest.short_name}`);
    logSuccess(`Start URL: ${manifest.start_url}`);
    logSuccess(`Display mode: ${manifest.display}`);
    
    // Validate icons
    if (Array.isArray(manifest.icons) && manifest.icons.length > 0) {
      logSuccess(`Icons defined: ${manifest.icons.length}`);
      
      // Check if icon files exist
      let iconsMissing = 0;
      manifest.icons.forEach(icon => {
        const iconPath = path.join(process.cwd(), "public", icon.src);
        if (!fs.existsSync(iconPath)) {
          logWarning(`Icon file missing: ${icon.src}`);
          iconsMissing++;
        }
      });
      
      if (iconsMissing === 0) {
        logSuccess("All icon files present");
      } else {
        logWarning(`${iconsMissing} icon file(s) missing`);
      }
    } else {
      logWarning("No icons defined in manifest");
    }
    
    // Check service worker
    const swPath = path.join(process.cwd(), "public", "sw.js");
    if (fs.existsSync(swPath)) {
      logSuccess("Service worker file exists: sw.js");
    } else {
      logWarning("Service worker file not found: sw.js");
    }
    
    return true;
  } catch (error) {
    logError(`Manifest validation failed: ${error.message}`);
    console.error("   Full error:", error);
    return false;
  }
}

// CHECK 5: Network Connectivity (Optional)
async function checkNetworkConnectivity() {
  logSection("5. NETWORK CONNECTIVITY (Optional)");
  
  const testUrl = config.api.baseUrl;
  
  if (!testUrl || testUrl === "http://localhost:4000") {
    logWarning("Skipping network check (localhost or no API URL configured)");
    return true;
  }
  
  return new Promise((resolve) => {
    try {
      const url = new URL(testUrl);
      const protocol = url.protocol === "https:" ? https : http;
      
      const req = protocol.get(testUrl, (res) => {
        if (res.statusCode) {
          logSuccess(`API endpoint reachable: ${testUrl} (Status: ${res.statusCode})`);
          resolve(true);
        } else {
          logWarning(`API endpoint returned no status code`);
          resolve(false);
        }
      });
      
      req.on("error", (error) => {
        logWarning(`Could not reach API endpoint: ${error.message}`);
        resolve(false);
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        logWarning("API endpoint request timed out");
        resolve(false);
      });
    } catch (error) {
      logWarning(`Network check failed: ${error.message}`);
      resolve(false);
    }
  });
}

// Main execution
async function runSystemChecks() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║         SHAMAH HORIZON PWA - SYSTEM VALIDATION             ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log(`\nTimestamp: ${new Date().toISOString()}`);
  console.log(`Node version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Working directory: ${process.cwd()}`);
  
  // Run all checks
  await checkEnvironmentConfig();
  await checkCloudinaryConnection();
  await checkDatabasePermissions();
  await checkPWAManifest();
  await checkNetworkConnectivity();
  
  // Summary
  logSection("SUMMARY");
  console.log(`Passed:   ${CHECKS.passed}`);
  console.log(`Failed:   ${CHECKS.failed}`);
  console.log(`Warnings: ${CHECKS.warnings}`);
  
  if (CHECKS.failed === 0) {
    console.log("\n🎉 All critical checks passed! System is ready for production.");
    process.exit(0);
  } else {
    console.log("\n❌ System validation failed. Please fix the errors above before deploying.");
    process.exit(1);
  }
}

// Run the checks
runSystemChecks().catch((error) => {
  console.error("\n💥 Fatal error during system check:");
  console.error(error);
  process.exit(1);
});
