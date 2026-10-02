import express from "express";
import mongoose from "mongoose";

import { Product } from "../models/Product.js";
import { Deal } from "../models/Deal.js";
import { Order } from "../models/Order.js";
import { checkoutSchema } from "../utils/validators.js";
import { optionalAuth } from "../middleware/auth.js";
import { sendOrderConfirmation } from "../mailer.js";

export const checkoutRouter = express.Router();

/**
 * PUBLIC (optional auth): create order
 * POST /api/checkout
 */
checkoutRouter.post("/", optionalAuth, async (req, res, next) => {
  try {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const { customer, items } = parsed.data;
    const productIds = items.map((item) => item.productId);

    for (const id of productIds) {
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid product id" });
      }
    }

    const products = await Product.find({ _id: { $in: productIds }, isActive: true }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    const missingIds = productIds.filter((id) => !productMap.has(id));
    const deals = missingIds.length
      ? await Deal.find({ _id: { $in: missingIds }, isActive: true }).lean()
      : [];
    const dealMap = new Map(deals.map((d) => [d._id.toString(), d]));
    const stillMissing = missingIds.filter((id) => !dealMap.has(id));
    if (stillMissing.length) {
      return res.status(400).json({ message: "One or more products not found" });
    }
    // Products listed before their price is set ("price coming soon") can't be bought.
    const unpriced = products.filter((p) => !(p.price > 0));
    if (unpriced.length) {
      return res.status(400).json({ message: `אין עדיין מחיר למוצר: ${unpriced[0].title}` });
    }

    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);
      if (product) {
        return {
          productId: product._id,
          title: product.title,
          price: product.price,
          qty: item.qty,
        };
      }

      const deal = dealMap.get(item.productId);
      const dealPrice = Number.isFinite(deal?.discountedPrice)
        ? deal.discountedPrice
        : Number.isFinite(deal?.basePrice)
          ? deal.basePrice
          : null;
      if (!dealPrice) {
        throw new Error("Deal has no valid price");
      }
      return {
        productId: deal._id,
        title: deal.title,
        price: dealPrice,
        qty: item.qty,
      };
    });

    const total = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    const order = await Order.create({
      userId: req.user?.userId || undefined,
      customer,
      items: orderItems,
      total,
      status: "pending",
    });

    if (customer.email) {
      sendOrderConfirmation({ to: customer.email, orderId: order._id.toString() }).catch((err) => {
        console.error("Failed to send order confirmation:", err);
      });
    }

    return res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});
