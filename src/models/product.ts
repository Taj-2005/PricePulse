import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  url: String,
  title: String,
  price: String,
  timestamp: { type: Date, default: Date.now },
});

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
