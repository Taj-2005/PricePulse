import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: String,
  price: Number,
  history: [
    {
      price: Number,
      timestamp: Date,
    },
  ],
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
