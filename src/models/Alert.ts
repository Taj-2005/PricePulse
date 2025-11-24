import mongoose, { Schema, models } from "mongoose";

const alertSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "TrackedProduct", required: true },
  userEmail: { type: String, required: true },
  targetPrice: { type: Number, required: true },
  alerted: { type: Boolean, default: false },
  lastAlertPrice: { type: Number }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

alertSchema.index({ productId: 1, userEmail: 1, targetPrice: 1 }, { unique: true });

const Alert = models.Alert || mongoose.model("Alert", alertSchema);

export default Alert;

