import { NextRequest, NextResponse } from "next/server";
import { runScheduler } from "@/services/schedulerService";

/**
 * Cron job endpoint for periodic price tracking
 * Should be called every 30 minutes by a cron service (Vercel Cron, etc.)
 * 
 * Security: If CRON_SECRET is set, it must be provided in the Authorization header
 * or as a query parameter 'secret'
 */
export async function GET(request: NextRequest) {
  try {
    // Security: Check for CRON_SECRET if configured
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      const secretParam = request.nextUrl.searchParams.get("secret");
      
      // Vercel Cron automatically sends the secret in Authorization header
      // External cron services can use ?secret=xxx query parameter
      const providedSecret = authHeader?.replace("Bearer ", "") || secretParam;
      
      if (providedSecret !== cronSecret) {
        console.warn("❌ Unauthorized cron job attempt");
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    console.log("🕐 Starting scheduled price tracking...");
    const result = await runScheduler();

    return NextResponse.json({
      message: "Scheduler completed successfully",
      success: result.success,
      failed: result.failed,
      total: result.success + result.failed,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("❌ Cron job error:", err);
    return NextResponse.json(
      {
        error: err.message || "Scheduler failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
