import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    imageUrl: { type: String, required: true, trim: true },
    linkUrl: { type: String, default: "", trim: true },
    basePrice: { type: Number, default: null },
    discountedPrice: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Deal = mongoose.model("Deal", dealSchema);
