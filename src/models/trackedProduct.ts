import mongoose from "mongoose";

const TrackedProductSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    userEmail: { type: String, required: true },
    targetPrice: { type: Number, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  },
  { timestamps: true }
);

export default mongoose.models.TrackedProduct ||
  mongoose.model("TrackedProduct", TrackedProductSchema);
