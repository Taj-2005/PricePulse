import mongoose, { Schema } from "mongoose";

const priceHistorySchema = new Schema({
  productUrl: { type: String, required: true }, // removed index: true
  price: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Keep only THIS single index definition
priceHistorySchema.index({ productUrl: 1, timestamp: -1 });

export const PriceHistory =
  mongoose.models.PriceHistory ||
  mongoose.model("PriceHistory", priceHistorySchema);


const productSchema = new Schema({
  url: String,
  title: String,
  price: String,
  timestamp: { type: Date, default: Date.now },
});

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
