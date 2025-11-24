import { connectDB } from "@/lib/mongodb";
import Alert from "@/models/Alert";
import TrackedProduct from "@/models/trackedProduct";
import { sendPriceAlertEmail } from "./emailService";
import type { InferSchemaType } from "mongoose";
  
type AlertDocument = InferSchemaType<typeof Alert>;

export interface CheckAlertResult {
  shouldAlert: boolean;
  alertSent: boolean;
  message: string;
}

/**
 * Check if price drop alert should be sent and send it if conditions are met
 * Prevents duplicate alerts for the same price drop
 */
export async function checkAndSendAlert(
  productId: string,
  currentPrice: number
): Promise<CheckAlertResult> {
  await connectDB();

  try {
    // Find the tracked product
    const product = await TrackedProduct.findById(productId);
    if (!product) {
      return {
        shouldAlert: false,
        alertSent: false,
        message: "Product not found",
      };
    }

    // Find all alerts for this product
    const alerts = await Alert.find({ productId });

    if (alerts.length === 0) {
      return {
        shouldAlert: false,
        alertSent: false,
        message: "No alerts configured for this product",
      };
    }

    let alertsSent = 0;
    const results: string[] = [];

    for (const alert of alerts) {
      // Check if price is below target
      if (currentPrice > alert.targetPrice) {
        results.push(
          `Price ₹${currentPrice} is above target ₹${alert.targetPrice} for ${alert.userEmail}`
        );
        continue;
      }

      // Check if we've already alerted for this price drop
      // We only alert again if:
      // 1. We haven't alerted yet (alerted = false), OR
      // 2. The price has dropped further since the last alert
      const shouldSendAlert =
        !alert.alerted ||
        (alert.lastAlertPrice !== undefined &&
          currentPrice < alert.lastAlertPrice);

      if (!shouldSendAlert) {
        results.push(
          `Already alerted ${alert.userEmail} for price ₹${currentPrice}`
        );
        continue;
      }

      try {
        // Send the alert email
        await sendPriceAlertEmail(
          alert.userEmail,
          product.title,
          currentPrice,
          alert.targetPrice,
          product.url
        );

        // Update alert record
        alert.alerted = true;
        alert.lastAlertPrice = currentPrice;
        alert.updatedAt = new Date();
        await alert.save();

        alertsSent++;
        results.push(`✅ Alert sent to ${alert.userEmail}`);
      } catch (error: any) {
        console.error(`Failed to send alert to ${alert.userEmail}:`, error);
        results.push(`❌ Failed to send alert to ${alert.userEmail}: ${error.message}`);
      }
    }

    return {
      shouldAlert: alertsSent > 0,
      alertSent: alertsSent > 0,
      message: results.join("; "),
    };
  } catch (error: any) {
    console.error("Error in checkAndSendAlert:", error);
    return {
      shouldAlert: false,
      alertSent: false,
      message: `Error: ${error.message}`,
    };
  }
}

  
export async function createOrUpdateAlert(
  productId: string,
  userEmail: string,
  targetPrice: number
): Promise<AlertDocument> {
  await connectDB();

  const alert = await Alert.findOneAndUpdate(
    { productId, userEmail, targetPrice },
    {
      productId,
      userEmail,
      targetPrice,
      $setOnInsert: { alerted: false, lastAlertPrice: undefined },
    },
    { upsert: true, new: true }
  );

  return alert;
}  

/**
 * Reset alert flag when price goes back above target (optional feature)
 */
export async function resetAlertIfPriceAboveTarget(
  productId: string,
  currentPrice: number
): Promise<void> {
  await connectDB();

  await Alert.updateMany(
    {
      productId,
      targetPrice: { $lt: currentPrice },
      alerted: true,
    },
    {
      $set: {
        alerted: false,
        lastAlertPrice: undefined,
        updatedAt: new Date(),
      },
    }
  );
}
