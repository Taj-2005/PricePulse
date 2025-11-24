import { NextRequest, NextResponse } from "next/server";
import { runScheduler } from "@/services/schedulerService";

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      const secretParam = request.nextUrl.searchParams.get("secret");
      
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
