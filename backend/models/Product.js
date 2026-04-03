import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        images: [{ type: String }],
        videos: [{ type: String }],
        price: { type: Number, required: true },
        sku: { type: String, default: "" },
        category: { type: String, default: "" },
        subCategory: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
        tags: [{ type: String }],
    },
    { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
