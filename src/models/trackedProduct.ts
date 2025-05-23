import mongoose from "mongoose";

const TrackedProductSchema = new mongoose.Schema({
  url: { type: String, required: true },
  userEmail: { type: String },
  targetPrice: { type: Number }, 
});

export const TrackedProduct =
  mongoose.models.TrackedProduct || mongoose.model("TrackedProduct", TrackedProductSchema);
