import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    referralCode: { type: String, unique: true, required: true },
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    referralTree: { type: Array, default: [] }, // Hierarchical structure
    deedEnergy: { type: Number, default: 0 },
    walletAddress: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
