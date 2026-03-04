import express from "express";
import mongoose from "mongoose";
import { Deal } from "../models/Deal.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

export const dealRouter = express.Router();

dealRouter.get("/admin", requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const deals = await Deal.find({})
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    res.json({ deals });
  } catch (err) {
    next(err);
  }
});

dealRouter.get("/", async (_req, res, next) => {
  try {
    const deals = await Deal.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    res.json({ deals });
  } catch (err) {
    next(err);
  }
});

dealRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const deal = await Deal.findById(id).lean();
    if (!deal || !deal.isActive) {
      return res.status(404).json({ message: "Deal not found" });
    }

    res.json({ deal });
  } catch (err) {
    next(err);
  }
});

dealRouter.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const {
      title,
      imageUrl,
      description = "",
      linkUrl = "",
      basePrice = null,
      discountedPrice = null,
      isActive = true,
      sortOrder = 0,
    } = req.body || {};

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Invalid title" });
    }
    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
      return res.status(400).json({ message: "Invalid image URL" });
    }

    const deal = await Deal.create({
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : "",
      imageUrl: imageUrl.trim(),
      linkUrl: typeof linkUrl === "string" ? linkUrl.trim() : "",
      basePrice: Number.isFinite(Number(basePrice)) ? Number(basePrice) : null,
      discountedPrice: Number.isFinite(Number(discountedPrice))
        ? Number(discountedPrice)
        : null,
      isActive: Boolean(isActive),
      sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
    });

    res.status(201).json({ deal });
  } catch (err) {
    next(err);
  }
});

dealRouter.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const updates = {};
    if (typeof req.body?.title === "string") updates.title = req.body.title.trim();
    if (typeof req.body?.description === "string") {
      updates.description = req.body.description.trim();
    }
    if (typeof req.body?.imageUrl === "string") updates.imageUrl = req.body.imageUrl.trim();
    if (typeof req.body?.linkUrl === "string") updates.linkUrl = req.body.linkUrl.trim();
    if (typeof req.body?.isActive === "boolean") updates.isActive = req.body.isActive;
    if (req.body?.sortOrder !== undefined) {
      updates.sortOrder = Number.isFinite(Number(req.body.sortOrder))
        ? Number(req.body.sortOrder)
        : 0;
    }
    if (req.body?.basePrice !== undefined) {
      updates.basePrice = Number.isFinite(Number(req.body.basePrice))
        ? Number(req.body.basePrice)
        : null;
    }
    if (req.body?.discountedPrice !== undefined) {
      updates.discountedPrice = Number.isFinite(Number(req.body.discountedPrice))
        ? Number(req.body.discountedPrice)
        : null;
    }

    if (updates.title !== undefined && !updates.title) {
      return res.status(400).json({ message: "Invalid title" });
    }
    if (updates.imageUrl !== undefined && !updates.imageUrl) {
      return res.status(400).json({ message: "Invalid image URL" });
    }

    const deal = await Deal.findByIdAndUpdate(id, updates, { new: true });
    if (!deal) return res.status(404).json({ message: "Deal not found" });

    res.json({ deal });
  } catch (err) {
    next(err);
  }
});

dealRouter.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const deleted = await Deal.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Deal not found" });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
