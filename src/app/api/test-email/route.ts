import { NextRequest, NextResponse } from "next/server";
import { sendPriceAlertEmail } from "@/services/emailService";

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      const secretParam = request.nextUrl.searchParams.get("secret");
      const providedSecret = authHeader?.replace("Bearer ", "") || secretParam;
      if (providedSecret !== cronSecret) {
        console.warn("❌ Unauthorized test-email attempt");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const testRecipient = process.env.TEST_ALERT_EMAIL || "your.email@domain.com";
    const productTitle = "PricePulse Test Product";
    const currentPrice = 1;
    const targetPrice = 999999;
    const productUrl = "https://price-pulse-taj.vercel.app/";

    await sendPriceAlertEmail(
      testRecipient,
      productTitle,
      currentPrice,
      targetPrice,
      productUrl
    );

    return NextResponse.json({ message: "Test email triggered" });
  } catch (err: any) {
    console.error("❌ /api/test-email error:", err);
    return NextResponse.json({ error: err.message || "Test failed" }, { status: 500 });
  }
}
