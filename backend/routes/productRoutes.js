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
 * Returns the product already using this sku (barcode), ignoring excludeId.
 */
async function findSkuConflict(sku, excludeId) {
  if (!sku) return null;
  const filter = { sku };
  if (excludeId) filter._id = { $ne: excludeId };
  return Product.findOne(filter, { _id: 1, title: 1 }).lean();
}

function skuConflictResponse(res, conflict) {
  return res.status(409).json({
    message: `מק"ט / ברקוד זה כבר קיים במוצר: ${conflict.title}`,
    conflictId: conflict._id,
  });
}

const GIFT_CARD_TYPE = "Gift Card";

// Spec filters for computers: query param -> product field.
const SPEC_FILTERS = {
  cpuBrand: "specs.cpuBrand",
  cpu: "specs.cpu",
  gpu: "specs.gpu",
  ram: "specs.ram",
  storage: "specs.storage",
};

// Filterable `attributes` keys (query param name = key). Must match
// ATTRIBUTE_GROUPS in frontend/src/utils/products.js, and must not collide
// with the other query params above.
const ATTRIBUTE_KEYS = [
  "cpuSeries", "socket", "cores", "igpu", "chipset", "formFactor", "memoryType", "wifi",
  "capacity", "modules", "speed", "storageType", "pcieGen", "gpuChipset", "gpuModel", "vram",
  "caseSize", "boardSupport", "color", "wattage", "efficiency", "atxVersion", "coolingType",
  "radiatorSize", "accessoryType", "screenSize", "resolution", "refreshRate", "panelType",
  "screenShape", "os",
];

// Price buckets used by the storefront price filter (must match
// PRICE_RANGE_ORDER in frontend/src/utils/products.js).
const PRICE_RANGES = [
  [100, "Under ₪100"],
  [300, "₪100 - ₪299"],
  [600, "₪300 - ₪599"],
  [1500, "₪600 - ₪1,499"],
  [Infinity, "₪1,500+"],
];

function getPriceRange(price) {
  if (!(price > 0)) return "";
  return PRICE_RANGES.find(([limit]) => price < limit)[1];
}

/**
 * Keeps priceRange in sync with price so products land in the right price
 * filter without anyone setting it by hand.
 */
function withPriceRange(data) {
  if (data.price === undefined) return data;
  return { ...data, priceRange: getPriceRange(data.price) };
}

const SORT_OPTIONS = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  newest: { createdAt: -1 },
};

/**
 * Parses a comma-separated query param into a trimmed, non-empty string array.
 */
function parseListParam(value) {
  return (value || "")
    .toString()
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Builds the shared product filter from query params, optionally excluding
 * one of the multi-select dimensions (used by the facets endpoint to compute
 * "what would match if this filter weren't applied" counts).
 */
function buildProductFilter(query, excludeDimension) {
  const q = (query.q || "").toString().trim();
  const category = (query.category || "").toString().trim();
  const type = parseListParam(query.type);
  const brand = parseListParam(query.brand);
  const connectivity = parseListParam(query.connectivity);
  const price = parseListParam(query.price);

  const filter = { isActive: true };
  if (category) filter.category = category;
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { tags: { $in: [new RegExp(q, "i")] } },
    ];
  }
  if (type.length && excludeDimension !== "productType") filter.productType = { $in: type };
  if (brand.length && excludeDimension !== "brand") filter.brand = { $in: brand };
  if (connectivity.length && excludeDimension !== "connectivity") filter.connectivity = { $in: connectivity };
  if (price.length && excludeDimension !== "priceRange") filter.priceRange = { $in: price };
  Object.entries(SPEC_FILTERS).forEach(([param, field]) => {
    const values = parseListParam(query[param]);
    if (values.length && excludeDimension !== field) filter[field] = { $in: values };
  });
  const attributeFilters = ATTRIBUTE_KEYS.filter((key) => excludeDimension !== `attr:${key}`)
    .map((key) => [key, parseListParam(query[key])])
    .filter(([, values]) => values.length)
    .map(([key, values]) => ({ attributes: { $elemMatch: { key, value: { $in: values } } } }));
  if (attributeFilters.length) filter.$and = attributeFilters;

  return filter;
}

/**
 * Attribute option counts: { socket: [{ value, count }], ... }. Like the
 * other facets, a selected key's counts ignore that key's own selection.
 */
async function getAttributeFacets(query) {
  const countBy = (filter, key) =>
    Product.aggregate([
      { $match: filter },
      { $unwind: "$attributes" },
      ...(key ? [{ $match: { "attributes.key": key } }] : []),
      { $group: { _id: { key: "$attributes.key", value: "$attributes.value" }, count: { $sum: 1 } } },
      { $project: { _id: 0, key: "$_id.key", value: "$_id.value", count: 1 } },
    ]);

  const selectedKeys = ATTRIBUTE_KEYS.filter((key) => parseListParam(query[key]).length);
  const [unselected, ...selected] = await Promise.all([
    countBy(buildProductFilter(query)),
    ...selectedKeys.map((key) => countBy(buildProductFilter(query, `attr:${key}`), key)),
  ]);

  const result = {};
  unselected
    .filter(({ key }) => ATTRIBUTE_KEYS.includes(key) && !selectedKeys.includes(key))
    .concat(selected.flat())
    .forEach(({ key, value, count }) => (result[key] ??= []).push({ value, count }));
  return result;
}

/**
 * PUBLIC: list active products
 * GET /api/products?q=&category=&type=&brand=&connectivity=&price=&sort=
 *   plus spec params (cpu=, ram=…) and attribute params (socket=, vram=…)
 */
productRouter.get("/", async (req, res, next) => {
  try {
    const filter = buildProductFilter(req.query);
    const sort = SORT_OPTIONS[req.query.sort] || SORT_OPTIONS.newest;

    const products = await Product.find(filter).sort(sort).lean();
    // Default "recommended" order: newest first, but the near-identical gift
    // cards go last so real products lead the listing.
    if (!SORT_OPTIONS[req.query.sort]) {
      const isGiftCard = (product) => product.productType === GIFT_CARD_TYPE;
      return res.json([...products.filter((p) => !isGiftCard(p)), ...products.filter(isGiftCard)]);
    }
    res.json(products);
  } catch (err) {
    next(err);
  }
});

/**
 * PUBLIC: filter option counts for the current filter context.
 * Each dimension's counts are computed with every OTHER active filter
 * applied (but not its own), so a group's checkboxes show how many
 * results each option would yield if added to the current selection.
 * GET /api/products/facets?category=&type=&brand=&connectivity=&price=&q=
 */
productRouter.get("/facets", async (req, res, next) => {
  try {
    const dimensions = ["productType", "brand", "connectivity", "priceRange", ...Object.values(SPEC_FILTERS)];
    const [attributes, productType, brand, connectivity, priceRange, ...specCounts] = await Promise.all([
      getAttributeFacets(req.query),
      ...dimensions.map((dimension) =>
        Product.aggregate([
          { $match: buildProductFilter(req.query, dimension) },
          { $match: { [dimension]: { $nin: ["", null] } } },
          { $group: { _id: `$${dimension}`, count: { $sum: 1 } } },
          { $project: { _id: 0, value: "$_id", count: 1 } },
          { $sort: { value: 1 } },
        ])
      ),
    ]);

    const specs = Object.fromEntries(Object.keys(SPEC_FILTERS).map((param, i) => [param, specCounts[i]]));
    res.json({ productType, brand, connectivity, priceRange, specs, attributes });
  } catch (err) {
    next(err);
  }
});

/**
 * ADMIN: list all (active + inactive) for admin dashboard
 * GET /api/products/admin/all
 */
async function listAllProducts(_req, res, next) {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch (err) {
    next(err);
  }
}

/**
 * ADMIN: list all (active + inactive) for admin dashboard
 * GET /api/products/admin/all/list
 */
productRouter.get("/admin/all", requireAuth, requireAdmin, listAllProducts);
productRouter.get("/admin/all/list", requireAuth, requireAdmin, listAllProducts);

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
 * ADMIN: create product
 * POST /api/products
 */
productRouter.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const conflict = await findSkuConflict(parsed.data.sku);
    if (conflict) return skuConflictResponse(res, conflict);

    const created = await Product.create(withPriceRange(parsed.data));
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

    const conflict = await findSkuConflict(parsed.data.sku, id);
    if (conflict) return skuConflictResponse(res, conflict);

    const updated = await Product.findByIdAndUpdate(id, withPriceRange(parsed.data), { new: true });
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

    const conflict = await findSkuConflict(parsed.data.sku, id);
    if (conflict) return skuConflictResponse(res, conflict);

    const updated = await Product.findByIdAndUpdate(id, withPriceRange(parsed.data), {
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
