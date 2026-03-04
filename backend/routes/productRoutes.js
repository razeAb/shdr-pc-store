import express from "express";
import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { productSchema } from "../utils/validators.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

export const productRouter = express.Router();

async function ensureCategory(name) {
  if (!name || typeof name !== "string") return;
  const trimmed = name.trim();
  if (!trimmed) return;
  const lower = trimmed.toLowerCase();
  await Category.updateOne(
    { nameLower: lower },
    { $setOnInsert: { name: trimmed, nameLower: lower } },
    { upsert: true }
  );
}

/**
 * PUBLIC: list active products
 * GET /api/products?q=&category=
 */
productRouter.get("/", async (req, res, next) => {
  try {
    const q = (req.query.q || "").toString().trim();
    const category = (req.query.category || "").toString().trim();

    const filter = { isActive: true };
    if (category) filter.category = category;

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

/**
 * PUBLIC: get one active product
 * GET /api/products/:id
 */
productRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const product = await Product.findOne({ _id: id, isActive: true }).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    next(err);
  }
});

/**
 * ADMIN: list all (active + inactive) for admin dashboard
 * GET /api/products/admin/all
 */
productRouter.get("/admin/all/list", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

/**
 * ADMIN: create product
 * POST /api/products
 */
productRouter.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const created = await Product.create(parsed.data);
    await ensureCategory(created.category);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * ADMIN: update product
 * PUT /api/products/:id
 */
productRouter.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const updated = await Product.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    await ensureCategory(updated.category);

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * ADMIN: edit product (partial update)
 * PATCH /api/products/:id/edit
 */
productRouter.patch("/:id/edit", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const parsed = productSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const updated = await Product.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    if (parsed.data.category) {
      await ensureCategory(parsed.data.category);
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * ADMIN: soft delete (set isActive=false)
 * DELETE /api/products/:id
 */
productRouter.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const updated = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deactivated", product: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * ADMIN: toggle active
 * PATCH /api/products/:id/toggle
 */
productRouter.patch("/:id/toggle", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.isActive = !product.isActive;
    await product.save();

    res.json(product);
  } catch (err) {
    next(err);
  }
});

/**
 * ADMIN: activate all products
 * PATCH /api/products/activate-all
 */
productRouter.patch("/activate-all", requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    await Product.updateMany({}, { $set: { isActive: true } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/**
 * ADMIN: deactivate all products
 * PATCH /api/products/deactivate-all
 */
productRouter.patch("/deactivate-all", requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    await Product.updateMany({}, { $set: { isActive: false } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
