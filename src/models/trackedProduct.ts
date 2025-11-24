import mongoose, { Schema, models } from "mongoose";

const trackedProductSchema = new Schema({
  url: { type: String, required: true, unique: true },
  userEmail: { type: String },
  currentPrice: { type: Number, required: true },
  title: { type: String, required: true },
  imageUrl: { type: String },
  brand: { type: String },
  model: { type: String },
  lastScrapedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

trackedProductSchema.index({ userEmail: 1 });

const TrackedProduct =
  models.TrackedProduct || mongoose.model("TrackedProduct", trackedProductSchema);

export default TrackedProduct;
