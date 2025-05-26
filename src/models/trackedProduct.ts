import mongoose from "mongoose";

const TrackedProductSchema = new mongoose.Schema({
  url: { type: String, required: true },
  userEmail: { type: String }, // Keep if needed for alerts
  targetPrice: { type: Number },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // NEW
});

export default mongoose.models.TrackedProduct || mongoose.model("TrackedProduct", TrackedProductSchema);
