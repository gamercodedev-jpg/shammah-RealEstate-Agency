#!/usr/bin/env node

/**
 * CLEANUP SCRIPT - Removes all plots and news from the database
 * This is a destructive operation - it will delete EVERYTHING
 * 
 * Usage: node cleanup-all-data.js
 * 
 * Make sure you have a backup before running this!
 */

import db from "./db.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE,
);

async function cleanupAll() {
  console.log("\n🗑️  DESTRUCTIVE CLEANUP - REMOVING ALL DATA\n");
  console.log("⚠️  WARNING: This will delete ALL plots, news, and related data!\n");

  try {
    // Delete all plot images first (foreign key constraint)
    console.log("1️⃣  Deleting all plot images...");
    const plotImagesResult = await db.run("DELETE FROM plot_images");
    console.log(`   ✓ Deleted ${plotImagesResult.changes} image records\n`);

    // Delete all plots
    console.log("2️⃣  Deleting all plots...");
    const plotsResult = await db.run("DELETE FROM plots");
    console.log(`   ✓ Deleted ${plotsResult.changes} plot records\n`);

    // Delete all news
    console.log("3️⃣  Deleting all news...");
    const newsResult = await db.run("DELETE FROM news");
    console.log(`   ✓ Deleted ${newsResult.changes} news records\n`);

    // also clear Supabase tables if configured
    console.log("🗄️  Cleaning up Supabase tables (plots/news)");
    for (const t of ["plot_images", "plots", "news"]) {
      const { error } = await supabase.from(t).delete();
      if (error && !error.message.includes("relation \"")) {
        // ignore "relation does not exist" errors
        console.warn(`   ⚠️  Supabase cleanup ${t} error:`, error.message);
      }
    }

    // Verify deletion
    console.log("4️⃣  Verifying cleanup...");
    const plotCount = await db.get("SELECT COUNT(*) as count FROM plots");
    const newsCount = await db.get("SELECT COUNT(*) as count FROM news");
    const imageCount = await db.get("SELECT COUNT(*) as count FROM plot_images");

    console.log(`   • Plots remaining: ${plotCount.count}`);
    console.log(`   • News remaining: ${newsCount.count}`);
    console.log(`   • Images remaining: ${imageCount.count}\n`);

    if (plotCount.count === 0 && newsCount.count === 0) {
      console.log("✅ CLEANUP COMPLETE! All data has been removed.\n");
      console.log("Next steps:");
      console.log("1. Go to your admin dashboard at /admin");
      console.log("2. Create fresh properties and news items");
      console.log("3. Clear your browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)");
      console.log("4. If you're on Vercel/Netlify, clear the CDN cache\n");
    } else {
      console.log("⚠️  WARNING: Some data still exists! Check the numbers above.\n");
    }

    await db.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ CLEANUP FAILED:", error.message);
    console.error("\nFull error:", error);
    await db.close();
    process.exit(1);
  }
}

// Ask for confirmation
console.log("\n😱 THIS WILL DELETE ALL PLOTS AND NEWS!");
console.log("────────────────────────────────────────\n");

const args = process.argv.slice(2);
if (args.includes("--confirm")) {
  cleanupAll();
} else {
  console.log("To proceed, run with --confirm flag:\n");
  console.log("  node cleanup-all-data.js --confirm\n");
  process.exit(0);
}
