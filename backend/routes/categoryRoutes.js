import express from "express";
import mongoose from "mongoose";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

export const categoryRouter = express.Router();

categoryRouter.get("/", async (_req, res, next) => {
  try {
    const productCategories = await Product.distinct("category", {
      category: { $exists: true, $ne: "" },
    });

    await Promise.all(
      productCategories.map((name) => {
        if (!name || typeof name !== "string") return null;
        const trimmed = name.trim();
        if (!trimmed) return null;
        return Category.updateOne(
          { nameLower: trimmed.toLowerCase() },
          { $setOnInsert: { name: trimmed, nameLower: trimmed.toLowerCase() } },
          { upsert: true }
        );
      })
    );

    const categories = await Category.find({}).sort({ nameLower: 1 }).lean();
    return res.json(categories);
  } catch (err) {
    next(err);
  }
});

categoryRouter.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name } = req.body || {};
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Invalid category name" });
    }

    const category = await Category.create({ name: name.trim() });
    return res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Category already exists" });
    }
    next(err);
  }
});

categoryRouter.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
