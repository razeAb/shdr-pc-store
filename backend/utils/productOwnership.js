import { User } from "../models/User.js";

// An admin role alone never grants access to purchasing information.
export async function resolveProductOwner(req, res, next) {
  res.set("Cache-Control", "no-store");
  req.isProductOwner = false;
  try {
    if (req.user?.role === "admin" && req.user?.userId) {
      const user = await User.findById(req.user.userId).select("email role").lean();
      const ownerId = process.env.PRODUCT_OWNER_USER_ID?.trim();
      const ownerEmail = (process.env.PRODUCT_OWNER_EMAIL || process.env.ADMIN_EMAIL || "admin@shdr.com").trim().toLowerCase();
      req.isProductOwner = user?.role === "admin" && (ownerId
        ? String(user._id) === ownerId
        : user.email?.toLowerCase() === ownerEmail);
    }
    next();
  } catch (error) { next(error); }
}

export function requireProductOwner(req, res, next) {
  if (!req.isProductOwner) return res.status(403).json({ message: "פרטי הרכש זמינים לבעל החשבון בלבד." });
  next();
}

export function privateProductFields(product, req) {
  if (!req.isProductOwner) return {};
  const stored = product.ownerInfo || {};
  const supplier = stored.supplier || (product.sku?.startsWith("AL-") ? "אלדין" : product.sku?.startsWith("ML-") ? "מור לוי" : "");
  return {
    canManagePrivateProducts: true,
    ownerInfo: {
      supplier,
      purchaseCost: stored.purchaseCost ?? null,
      costIncludesVat: stored.costIncludesVat ?? !product.sku?.startsWith("ML-"),
    },
    automationLocked: product.automationLocked === true,
  };
}

export function productForViewer(product, req = {}) {
  const plain = product.toObject ? product.toObject() : { ...product };
  delete plain.ownerInfo;
  delete plain.automationLocked;
  delete plain.canManagePrivateProducts;
  return { ...plain, ...privateProductFields(product, req) };
}

export const privateProductSelection = "+ownerInfo +automationLocked";
export const unlockedProductFilter = (id) => ({ ...(id ? { _id: id } : {}), automationLocked: { $ne: true } });

export function rejectPrivateProductFields(req, res, next) {
  if (["ownerInfo", "automationLocked", "canManagePrivateProducts"].some((key) => Object.hasOwn(req.body || {}, key))) {
    return res.status(400).json({ message: "יש לשמור פרטי רכש ונעילה בחלק הפרטי לבעלים בלבד." });
  }
  next();
}
