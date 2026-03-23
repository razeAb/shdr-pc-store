const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const pickImage = (images = []) => {
  if (Array.isArray(images) && images.length > 0) return images[0];
  return "/images/placeholder-1.svg";
};

export const normalizeProduct = (product) => {
  const id = product?._id?.toString?.() || product?.id?.toString?.() || "";
  const title = product?.title || "Untitled product";
  const baseSlug = slugify(title) || "product";
  const suffix = id ? `-${id.slice(-6)}` : "";

  return {
    id,
    title,
    slug: `${baseSlug}${suffix}`,
    platform: product?.category || "PC",
    description: product?.description || "",
    price: Number(product?.price) || 0,
    salePrice: Number.isFinite(product?.salePrice) ? product.salePrice : undefined,
    rating: Number.isFinite(product?.rating) ? product.rating : undefined,
    tags: Array.isArray(product?.tags) ? product.tags : [],
    sku: product?.sku || "",
    category: product?.category || "",
    image: pickImage(product?.images),
    images: Array.isArray(product?.images) ? product.images : []
  };
};
