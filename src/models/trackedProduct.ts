import mongoose, { Schema, models } from "mongoose";

const trackedProductSchema = new Schema({
  url: { type: String, required: true, unique: true },
  userEmail: { type: String, required: false },
  currentPrice: { type: Number, required: true },
  title: { type: String, required: true },
  imageUrl: { type: String }, // Product image URL
  brand: { type: String }, // Extracted brand name
  model: { type: String }, // Extracted model number
  lastScrapedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for faster queries
trackedProductSchema.index({ url: 1 });
trackedProductSchema.index({ userEmail: 1 });

const TrackedProduct =
  models.TrackedProduct || mongoose.model("TrackedProduct", trackedProductSchema);

export default TrackedProduct;
