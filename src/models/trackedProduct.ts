import mongoose from "mongoose";

const TrackedProductSchema = new mongoose.Schema({
  url: { type: String, required: true },
  userEmail: { type: String },
  targetPrice: { type: Number },
});

export default mongoose.models.TrackedProduct || mongoose.model("TrackedProduct", TrackedProductSchema);