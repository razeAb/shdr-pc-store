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
        productType: { type: String, default: "" },
        brand: { type: String, default: "" },
        connectivity: { type: String, default: "" },
        priceRange: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
        tags: [{ type: String }],
        // Filterable specs for computers (empty for other products).
        specs: {
            cpuBrand: { type: String, default: "" },
            cpu: { type: String, default: "" },
            gpu: { type: String, default: "" },
            ram: { type: String, default: "" },
            storage: { type: String, default: "" },
        },
        // Filterable specs for other product types (socket, VRAM, wattage…),
        // as key/value pairs so new keys need no schema change. Keys must be
        // listed in ATTRIBUTE_KEYS (productRoutes.js) to be filterable.
        attributes: [
            {
                _id: false,
                key: { type: String, required: true },
                value: { type: String, required: true },
            },
        ],
    },
    { timestamps: true }
);

// sku holds the product barcode; it must be unique when set.
productSchema.index({ sku: 1 }, { unique: true, partialFilterExpression: { sku: { $gt: "" } } });

export const Product = mongoose.model("Product", productSchema);
