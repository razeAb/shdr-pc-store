import express from "express";
import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

export const orderRouter = express.Router();

const ALLOWED_STATUSES = new Set(["pending", "paid", "failed", "shipped", "delivered"]);

/**
 * USER: list own orders
 * GET /api/orders/my
 */
orderRouter.get("/my", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json(orders);
  } catch (err) {
    next(err);
  }
});

/**
 * ADMIN: list all orders
 * GET /api/orders/admin/all
 */
orderRouter.get("/admin/all", requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return res.json(orders);
  } catch (err) {
    next(err);
  }
});

/**
 * ADMIN: order history (for admin UI)
 * GET /api/orders/history
 */
orderRouter.get("/history", requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    const mapped = orders.map((order) => ({
      _id: order._id,
      createdAt: order.createdAt,
      status: order.status,
      totalPrice: Number(order.total) || 0,
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
    }));

    return res.json(mapped);
  } catch (err) {
    next(err);
  }
});

/**
 * USER/ADMIN: get single order
 * GET /api/orders/:id
 */
orderRouter.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const order = await Order.findById(id).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isAdmin = req.user?.role === "admin";
    const isOwner = order.userId && order.userId.toString() === req.user?.userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(order);
  } catch (err) {
    next(err);
  }
});

/**
 * ADMIN: update order status
 * PATCH /api/orders/:id/status
 */
orderRouter.patch("/:id/status", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    if (!ALLOWED_STATUSES.has(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: "Order not found" });

    return res.json(updated);
  } catch (err) {
    next(err);
  }
});
