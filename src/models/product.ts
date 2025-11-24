import mongoose, { Schema } from "mongoose";

// PriceHistory model - stores historical price data
const priceHistorySchema = new Schema({
  productUrl: { type: String, required: true, index: true },
  price: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
});

// Compound index for efficient queries
priceHistorySchema.index({ productUrl: 1, timestamp: -1 });

export const PriceHistory = mongoose.models.PriceHistory || mongoose.model("PriceHistory", priceHistorySchema);

// Legacy Product model for backward compatibility (can be removed later)
const productSchema = new Schema({
  url: String,
  title: String,
  price: String,
  timestamp: { type: Date, default: Date.now },
});

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
