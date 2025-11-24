/**
 * Local development cron script
 * Runs the price tracking scheduler every 30 minutes
 * 
 * Usage:
 *   npm run cron:dev
 *   or
 *   ts-node --require dotenv/config scripts/cron-dev.ts
 * 
 * Make sure to set up your .env.local file with all required variables
 */

// Load environment variables from .env.local
import dotenv from "dotenv";
import path from "path";

// Load .env.local file
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import cron from "node-cron";
import { runScheduler } from "../src/services/schedulerService";

const CRON_SCHEDULE = "*/30 * * * *"; // Every 30 minutes

console.log("🚀 Starting local cron job scheduler...");
console.log(`📅 Schedule: Every 30 minutes (${CRON_SCHEDULE})`);
console.log("⏰ First run will start in 30 minutes, or run manually by calling the API\n");

// Run immediately on startup (optional - comment out if you don't want this)
console.log("🔄 Running initial price check...");
runScheduler()
  .then((result) => {
    console.log(`✅ Initial run completed: ${result.success} succeeded, ${result.failed} failed\n`);
  })
  .catch((error) => {
    console.error("❌ Initial run failed:", error);
  });

// Schedule recurring runs every 30 minutes
cron.schedule(CRON_SCHEDULE, async () => {
  console.log(`\n🕐 [${new Date().toISOString()}] Running scheduled price tracking...`);
  
  try {
    const result = await runScheduler();
    console.log(`✅ Scheduled run completed: ${result.success} succeeded, ${result.failed} failed`);
    console.log(`📊 Next run scheduled in 30 minutes\n`);
  } catch (error: any) {
    console.error(`❌ Scheduled run failed:`, error.message);
  }
});

// Keep the process running
console.log("⏳ Cron job is running. Press Ctrl+C to stop.\n");

