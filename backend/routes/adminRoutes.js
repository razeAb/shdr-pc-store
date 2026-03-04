import express from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { Coupon } from "../models/Coupon.js";

export const adminRouter = express.Router();

const STATUS_MAP = new Map([
  ["pending", "pending"],
  ["paid", "paid"],
  ["shipped", "delivering"],
  ["delivered", "done"],
  ["failed", "canceled"],
]);

function mapOrder(order) {
  return {
    _id: order._id,
    status: STATUS_MAP.get(order.status) || order.status,
    totalPrice: Number(order.total) || 0,
    createdAt: order.createdAt,
    customerName: order.customer?.fullName || "",
    phone: order.customer?.phone || "",
    paymentDetails: {
      method: order.payment?.provider || "",
    },
    items: Array.isArray(order.items)
      ? order.items.map((item) => ({
          productId: item.productId,
          title: item.title,
          name: item.title,
          quantity: item.qty,
          isWeighted: false,
          vegetables: [],
          additions: [],
        }))
      : [],
  };
}

function mapProduct(product) {
  return {
    _id: product._id,
    title: product.title,
    name: product.title,
    name_en: product.title,
    name_he: product.title,
    description: product.description,
    description_en: product.description,
    description_he: product.description,
    category: product.category,
    price: product.price,
    sku: product.sku || "",
    isActive: product.isActive,
    images: product.images,
    image: Array.isArray(product.images) ? product.images[0] : "",
    videos: product.videos || [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

adminRouter.use(requireAuth, requireAdmin);

/**
 * GET /api/admin/dashboard
 */
adminRouter.get("/dashboard", async (_req, res, next) => {
  try {
    const [products, orders] = await Promise.all([
      Product.find({}).sort({ createdAt: -1 }).lean(),
      Order.find({}).sort({ createdAt: -1 }).lean(),
    ]);

    const eligibleOrderStatuses = new Set(["paid", "shipped", "delivered"]);
    const productOrderCounts = new Map();
    const customerTotals = new Map();

    orders.forEach((order) => {
      if (!eligibleOrderStatuses.has(order.status)) return;
      const total = Number(order.total) || 0;
      const customerName = order.customer?.fullName || "";
      if (customerName) {
        const current = customerTotals.get(customerName) || { name: customerName, total: 0, orders: 0 };
        current.total += total;
        current.orders += 1;
        customerTotals.set(customerName, current);
      }

      (order.items || []).forEach((item) => {
        const id = item.productId?.toString();
        if (!id) return;
        const qty = Number(item.qty) || 0;
        productOrderCounts.set(id, (productOrderCounts.get(id) || 0) + qty);
      });
    });

    const productSummary = products.map((product) => ({
      _id: product._id,
      title: product.title,
      name: product.title,
      name_en: product.title,
      name_he: product.title,
      orders: productOrderCounts.get(product._id.toString()) || 0,
    }));

    const hotProducts = [...productSummary]
      .sort((a, b) => b.orders - a.orders)
      .filter((item) => item.orders > 0)
      .slice(0, 5);

    const coldProducts = [...productSummary]
      .sort((a, b) => a.orders - b.orders)
      .slice(0, 5);

    const topCustomers = Array.from(customerTotals.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return res.json({
      products: products.map(mapProduct),
      orders: orders.map(mapOrder),
      topCustomers,
      hotProducts,
      coldProducts,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/category-stats?period=month
 */
adminRouter.get("/category-stats", async (req, res, next) => {
  try {
    const period = String(req.query.period || "").toLowerCase();
    const since =
      period === "month"
        ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        : null;

    const orderQuery = { status: "delivered" };
    if (since) orderQuery.createdAt = { $gte: since };

    const orders = await Order.find(orderQuery).lean();
    const productIds = new Set();
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (mongoose.isValidObjectId(item.productId)) {
          productIds.add(item.productId.toString());
        }
      });
    });

    const products = await Product.find({ _id: { $in: Array.from(productIds) } }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    const counts = new Map();

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const product = productMap.get(String(item.productId));
        const category = product?.category || "לא מקוטלג";
        const qty = Number(item.qty) || 0;
        counts.set(category, (counts.get(category) || 0) + qty);
      });
    });

    const categories = Array.from(counts.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    return res.json({ categories });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/coupons
 */
adminRouter.get("/coupons", async (_req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ coupons });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/coupons
 */
adminRouter.post("/coupons", async (req, res, next) => {
  try {
    const { code, type = "percent", value, active = true } = req.body || {};
    if (!code || typeof code !== "string") {
      return res.status(400).json({ message: "Invalid code" });
    }
    const numValue = Number(value);
    if (!Number.isFinite(numValue) || numValue < 0) {
      return res.status(400).json({ message: "Invalid value" });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      type,
      value: numValue,
      active: Boolean(active),
    });

    return res.status(201).json({ coupon });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Coupon code already exists" });
    }
    next(err);
  }
});

/**
 * DELETE /api/admin/coupons/:id
 */
adminRouter.delete("/coupons/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Coupon not found" });

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
