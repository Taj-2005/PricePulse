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

export async function checkAndSendAlert(
  productId: string,
  currentPrice: number
): Promise<CheckAlertResult> {
  await connectDB();

  try {
    const product = await TrackedProduct.findById(productId);
    if (!product) {
      return {
        shouldAlert: false,
        alertSent: false,
        message: "Product not found",
      };
    }

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
      if (currentPrice > alert.targetPrice) {
        results.push(
          `Price ₹${currentPrice} is above target ₹${alert.targetPrice} for ${alert.userEmail}`
        );
        continue;
      }

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
        await sendPriceAlertEmail(
          alert.userEmail,
          product.title,
          currentPrice,
          alert.targetPrice,
          product.url
        );

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
