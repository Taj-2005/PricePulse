import mongoose from "mongoose";

const TrackedProductSchema = new mongoose.Schema({
  url: { type: String, required: true },
  userEmail: { type: String, required: false },
  targetPrice: { type: Number, required: false }, 
});

export const TrackedProduct =
  mongoose.models.TrackedProduct || mongoose.model("TrackedProduct", TrackedProductSchema);
