import mongoose, { Schema, models } from "mongoose";

const trackedProductSchema = new Schema({
  url: { type: String, required: true },
  userEmail: { type: String, required: false },
  targetPrice: { type: Number, required: false  },
  currentPrice: { type: String, required: true },
  title: { type: String, required: true  },
});

const TrackedProduct =
  models.TrackedProduct || mongoose.model("TrackedProduct", trackedProductSchema);

export default TrackedProduct;
