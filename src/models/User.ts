import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },

  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpiry: { type: Date },

  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
