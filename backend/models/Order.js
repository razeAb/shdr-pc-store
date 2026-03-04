import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    customer: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true },
    currency: { type: String, default: "ils" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "shipped", "delivered"],
      default: "pending",
    },
    // Generic payment info.
    payment: {
      provider: { type: String },
      externalOrderId: { type: String },
      paymentRef: { type: String },
      raw: { type: mongoose.Schema.Types.Mixed },
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", OrderSchema);
