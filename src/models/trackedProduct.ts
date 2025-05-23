import mongoose from "mongoose";

const trackedProductSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export const TrackedProduct = mongoose.models.TrackedProduct || mongoose.model("TrackedProduct", trackedProductSchema);
