import mongoose, { Schema, models } from "mongoose";

const alertSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "TrackedProduct", required: true },
  userEmail: { type: String, required: true },
  targetPrice: { type: Number, required: true },
  alerted: { type: Boolean, default: false }, // Flag to prevent duplicate alerts
  lastAlertPrice: { type: Number }, // Track the last price we alerted at
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index to ensure one alert per product-email-targetPrice combination
alertSchema.index({ productId: 1, userEmail: 1, targetPrice: 1 }, { unique: true });

const Alert = models.Alert || mongoose.model("Alert", alertSchema);

export default Alert;

