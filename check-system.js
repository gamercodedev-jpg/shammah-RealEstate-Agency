/**
 * System Validation Script for Live Server Deployment
 * Run this after deploying to verify all critical components
 * Usage: node check-system.js
 */

import config, { validateConfig } from "./config.js";
import { v2 as cloudinary } from "cloudinary";
import sqlite3 from "sqlite3";
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import http from "node:http";

sqlite3.verbose();

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
  
  const validation = validateConfig();
  
  if (validation.valid) {
    logSuccess("Environment variables loaded");
    logSuccess(`Database path: ${config.database.path}`);
    logSuccess(`Cloudinary cloud: ${config.cloudinary.cloudName}`);
    logSuccess(`API base URL: ${config.api.baseUrl}`);
  } else {
    validation.errors.forEach(error => logError(error));
  }
  
  return validation.valid;
}

// CHECK 2: Cloudinary Connection
async function checkCloudinaryConnection() {
  logSection("2. CLOUDINARY CONNECTION");
  
  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret
    });
    
    // Test connection by pinging the API
    const result = await cloudinary.api.ping();
    
    if (result.status === "ok") {
      logSuccess("Cloudinary API connection successful");
      logSuccess(`Cloud name: ${config.cloudinary.cloudName}`);
      
      // Get usage statistics if available
      try {
        const usage = await cloudinary.api.usage();
        logSuccess(`Storage used: ${(usage.storage.usage / 1024 / 1024).toFixed(2)} MB`);
        logSuccess(`Transformations: ${usage.transformations.usage}`);
      } catch (usageError) {
        logWarning("Could not fetch usage statistics (API key may have limited permissions)");
      }
      
      return true;
    } else {
      logError("Cloudinary ping returned unexpected status");
      return false;
    }
  } catch (error) {
    logError(`Cloudinary connection failed: ${error.message}`);
    console.error("   Full error:", error);
    return false;
  }
}

// CHECK 3: SQLite Database Permissions
async function checkDatabasePermissions() {
  logSection("3. SQLITE DATABASE PERMISSIONS");
  
  const dbPath = config.database.path;
  const dbDir = path.dirname(dbPath);
  
  try {
    // Check if database directory exists
    if (!fs.existsSync(dbDir)) {
      logError(`Database directory does not exist: ${dbDir}`);
      return false;
    }
    logSuccess(`Database directory exists: ${dbDir}`);
    
    // Check if database file exists
    const dbExists = fs.existsSync(dbPath);
    if (dbExists) {
      logSuccess(`Database file exists: ${dbPath}`);
    } else {
      logWarning(`Database file does not exist yet: ${dbPath}`);
      logWarning("It will be created on first write");
    }
    
    // Check directory write permissions
    try {
      const testFile = path.join(dbDir, ".write-test");
      fs.writeFileSync(testFile, "test");
      fs.unlinkSync(testFile);
      logSuccess("Directory is writable");
    } catch (writeError) {
      logError(`Directory is not writable: ${writeError.message}`);
      return false;
    }
    
    // Test database connection and write
    try {
      const rawDb = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          logError(`Database connection error: ${err.message}`);
        } else {
          logSuccess("Connected to the SQLite database.");
        }
      });

      const exec = (sql) =>
        new Promise((resolve, reject) => {
          rawDb.exec(sql, (err) => (err ? reject(err) : resolve()));
        });

      const run = (sql, params = []) =>
        new Promise((resolve, reject) => {
          rawDb.run(sql, params, function onRun(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
          });
        });

      const get = (sql, params = []) =>
        new Promise((resolve, reject) => {
          rawDb.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
        });

      const all = (sql, params = []) =>
        new Promise((resolve, reject) => {
          rawDb.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
        });

      const close = () =>
        new Promise((resolve, reject) => {
          rawDb.close((err) => (err ? reject(err) : resolve()));
        });

      // Try a simple query
      const info = await get("SELECT sqlite_version() as version");
      logSuccess(`SQLite version: ${info.version}`);

      // Test write operation
      await exec("CREATE TABLE IF NOT EXISTS _test_table (id INTEGER PRIMARY KEY)");
      await run("INSERT INTO _test_table (id) VALUES (?)", [Date.now()]);
      const count = await get("SELECT COUNT(*) as count FROM _test_table");
      await exec("DROP TABLE _test_table");

      logSuccess(`Database write test successful (${count.count} test records)`);

      // Check main tables
      const tables = await all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);

      if (tables.length > 0) {
        logSuccess(
          `Found ${tables.length} table(s): ${tables.map((t) => t.name).join(", ")}`,
        );

        // Check record counts
        for (const table of tables) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const result = await get(`SELECT COUNT(*) as count FROM ${table.name}`);
            console.log(`   - ${table.name}: ${result.count} records`);
          } catch {
            console.log(`   - ${table.name}: [error reading count]`);
          }
        }
      } else {
        logWarning("No application tables found in database (fresh install?)");
      }

      await close();
      return true;
    } catch (dbError) {
      logError(`Database operation failed: ${dbError.message}`);
      return false;
    }
  } catch (error) {
    logError(`Database check failed: ${error.message}`);
    console.error("   Full error:", error);
    return false;
  }
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
