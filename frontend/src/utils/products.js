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

// Primary categories get their own tab in the top nav; the rest live under
// the "Other Electronics" menu. Order here drives display order everywhere.
export const PRIMARY_CATEGORIES = ["Gaming PCs", "PC Gaming", "PlayStation", "Xbox", "Nintendo"];

export const OTHER_CATEGORIES = [
  "Networking Equipment",
  "Mobile Phones",
  "Tablets",
  "Wearables & Accessories",
  "Monitors & Desk Setup",
  "Kids Electronics",
  "Laptops"
];

export const HOMEPAGE_CATEGORIES = [...PRIMARY_CATEGORIES, ...OTHER_CATEGORIES];

export const CATEGORY_LABELS = {
  "Gaming PCs": { en: "Gaming PCs", he: "מחשבי גיימינג" },
  "PC Gaming": { en: "PC Gaming", he: "גיימינג למחשב" },
  PlayStation: { en: "PlayStation", he: "פלייסטיישן" },
  Xbox: { en: "Xbox", he: "אקסבוקס" },
  Nintendo: { en: "Nintendo", he: "נינטנדו" },
  "Networking Equipment": { en: "Networking Equipment", he: "ציוד רשת" },
  "Mobile Phones": { en: "Mobile Phones", he: "טלפונים ניידים" },
  Tablets: { en: "Tablets", he: "טאבלטים" },
  "Wearables & Accessories": { en: "Wearables & Accessories", he: "לביש ואביזרים" },
  "Monitors & Desk Setup": { en: "Monitors & Desk Setup", he: "מסכים וסידור שולחן" },
  "Kids Electronics": { en: "Kids Electronics", he: "אלקטרוניקה לילדים" },
  Laptops: { en: "Laptops", he: "מחשבים ניידים" }
};

export const PRODUCT_TYPE_LABELS = {
  "Access Point / Extender": { en: "Access Point / Extender", he: "נקודת גישה / מגדיל טווח" },
  "Cable / Adapter / Hub (USB)": { en: "Cable / Adapter / Hub (USB)", he: "כבל / מתאם / רכזת USB" },
  "Case / Cover / Protector": { en: "Case / Cover / Protector", he: "כיסוי / מגן" },
  "Charging Station": { en: "Charging Station", he: "תחנת טעינה" },
  Console: { en: "Console", he: "קונסולה" },
  Controller: { en: "Controller", he: "שלט" },
  Earbuds: { en: "Earbuds", he: "אוזניות אלחוטיות" },
  "Gaming PC": { en: "Gaming PC", he: "מחשב גיימינג" },
  "Gift Card": { en: "Gift Card", he: "כרטיס מתנה" },
  Headset: { en: "Headset", he: "אוזניות" },
  Keyboard: { en: "Keyboard", he: "מקלדת" },
  Laptop: { en: "Laptop", he: "מחשב נייד" },
  Monitor: { en: "Monitor", he: "מסך" },
  "Monitor Arm": { en: "Monitor Arm", he: "זרוע למסך" },
  Mouse: { en: "Mouse", he: "עכבר" },
  "Network Adapter": { en: "Network Adapter", he: "מתאם רשת" },
  "Network Switch / Hub": { en: "Network Switch / Hub", he: "מתג / רכזת רשת" },
  "Racing Wheel": { en: "Racing Wheel", he: "הגה מירוץ" },
  "Router / Modem": { en: "Router / Modem", he: "נתב / מודם" },
  Smartphone: { en: "Smartphone", he: "סמארטפון" },
  Smartwatch: { en: "Smartwatch", he: "שעון חכם" },
  "Speaker / Soundbar": { en: "Speaker / Soundbar", he: "רמקול / סאונדבר" },
  "Storage Drive": { en: "Storage Drive", he: "כונן אחסון" },
  "Stylus / Pencil": { en: "Stylus / Pencil", he: "עט חכם" },
  Tablet: { en: "Tablet", he: "טאבלט" },
  "VR Headset": { en: "VR Headset", he: "משקפי מציאות מדומה" },
  "Wearable Accessory": { en: "Wearable Accessory", he: "אביזר לביש" }
};

export const CONNECTIVITY_LABELS = {
  Wired: { en: "Wired", he: "חוטי" },
  Wireless: { en: "Wireless", he: "אלחוטי" },
  "Wired & Wireless": { en: "Wired & Wireless", he: "חוטי ואלחוטי" },
  "N/A": { en: "Other", he: "אחר" }
};

// Display order for price buckets (not alphabetical).
export const PRICE_RANGE_ORDER = [
  "Under ₪100",
  "₪100 - ₪299",
  "₪300 - ₪599",
  "₪600 - ₪1,499",
  "₪1,500+"
];

export const PRICE_RANGE_LABELS = {
  "Under ₪100": { en: "Under ₪100", he: "מתחת ל-₪100" },
  "₪100 - ₪299": { en: "₪100 - ₪299", he: "₪100 - ₪299" },
  "₪300 - ₪599": { en: "₪300 - ₪599", he: "₪300 - ₪599" },
  "₪600 - ₪1,499": { en: "₪600 - ₪1,499", he: "₪600 - ₪1,499" },
  "₪1,500+": { en: "₪1,500+", he: "₪1,500 ומעלה" }
};

export const SORT_OPTIONS = [
  { value: "recommended", label: { en: "Recommended", he: "מומלצים" } },
  { value: "newest", label: { en: "Newest", he: "החדשים ביותר" } },
  { value: "price_asc", label: { en: "Price: low to high", he: "מחיר: מהנמוך לגבוה" } },
  { value: "price_desc", label: { en: "Price: high to low", he: "מחיר: מהגבוה לנמוך" } }
];

const RAIL_LIMIT = 14;

// Distinct productType values available within each category — powers the
// mega-menu's per-category sub-links without hardcoding any list.
export const getProductTypesByCategory = (products) => {
  const map = {};
  products.forEach((product) => {
    if (!product.category || !product.productType) return;
    if (!map[product.category]) map[product.category] = new Set();
    map[product.category].add(product.productType);
  });
  return Object.fromEntries(
    Object.entries(map).map(([category, types]) => [category, Array.from(types).sort()])
  );
};

// Brands with active products and their product counts, biggest first,
// excluding the "Other" placeholder used for generic/unbranded accessories.
export const getBrandCounts = (products) => {
  const counts = new Map();
  products.forEach(({ brand }) => {
    if (brand && brand !== "Other") counts.set(brand, (counts.get(brand) || 0) + 1);
  });
  return Array.from(counts, ([brand, count]) => ({ brand, count })).sort(
    (a, b) => b.count - a.count || a.brand.localeCompare(b.brand)
  );
};

export const getNewArrivals = (products, limit = RAIL_LIMIT) =>
  [...products].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, limit);

// "Deals" = cheapest priceRange buckets, cheapest first — there's no discount
// field on Product, so this is the most honest proxy available.
export const getDeals = (products, limit = RAIL_LIMIT) => {
  const cheapBuckets = PRICE_RANGE_ORDER.slice(0, 2);
  const pool = products.filter((product) => cheapBuckets.includes(product.priceRange));
  return [...(pool.length ? pool : products)].sort((a, b) => a.price - b.price).slice(0, limit);
};

// "Best Sellers" = admin-tagged products (tags already editable in the admin
// product forms); falls back to the flagship item per primary category so
// the rail is never empty before anything's been tagged.
export const getBestSellers = (products, limit = RAIL_LIMIT) => {
  const tagged = products.filter((product) =>
    product.tags.some((tag) => ["bestseller", "best-seller"].includes(tag.toLowerCase()))
  );
  if (tagged.length) return tagged.slice(0, limit);

  return PRIMARY_CATEGORIES.map((category) =>
    products
      .filter((product) => product.category === category)
      .sort((a, b) => b.price - a.price)[0]
  )
    .filter(Boolean)
    .slice(0, limit);
};

// One "best seller" per category (admin-tagged first, falling back to the
// highest-priced item in that category) — used to populate the hero
// carousel with real, high-ticket products instead of generic art.
export const getFeaturedByCategory = (products, categories) =>
  categories
    .map((category) => {
      const inCategory = products.filter((product) => product.category === category);
      if (!inCategory.length) return null;
      const tagged = inCategory.filter((product) =>
        product.tags.some((tag) => ["bestseller", "best-seller"].includes(tag.toLowerCase()))
      );
      const pool = tagged.length ? tagged : inCategory;
      const product = [...pool].sort((a, b) => b.price - a.price)[0];
      return { category, product };
    })
    .filter(Boolean);

export const getByCategorySortedByPrice = (products, category, limit = RAIL_LIMIT) =>
  products
    .filter((product) => product.category === category)
    .sort((a, b) => b.price - a.price)
    .slice(0, limit);

export const getByProductType = (products, productType, limit = RAIL_LIMIT) =>
  products.filter((product) => product.productType === productType).slice(0, limit);

// One representative (cheapest) product per productType, for the bottom
// "Browse By Category" image-tile grid. productTypes with fewer than
// minCount products are skipped — a single item isn't really a browsable
// category and just clutters the grid.
export const getCheapestByProductType = (products, minCount = 3) => {
  const byType = new Map();
  const counts = new Map();
  products.forEach((product) => {
    if (!product.productType) return;
    counts.set(product.productType, (counts.get(product.productType) || 0) + 1);
    const current = byType.get(product.productType);
    if (!current || product.price < current.price) byType.set(product.productType, product);
  });
  return Array.from(byType.entries())
    .filter(([productType]) => (counts.get(productType) || 0) >= minCount)
    .map(([productType, product]) => ({ productType, product }))
    .sort((a, b) => a.productType.localeCompare(b.productType));
};

// Default badge shown on a rail's product cards: prefer connectivity when
// it's meaningful, otherwise fall back to the product type.
export const getDefaultBadge = (product, t) => {
  if (product.connectivity && product.connectivity !== "N/A") {
    return t(CONNECTIVITY_LABELS[product.connectivity] || { en: product.connectivity, he: product.connectivity });
  }
  if (product.productType) {
    return t(PRODUCT_TYPE_LABELS[product.productType] || { en: product.productType, he: product.productType });
  }
  return null;
};

// Titles start with "<Hebrew brand> - <Latin brand>" (e.g. "לוג'יטק - Logitech
// מקלדת …") so search matches both spellings. Cards show the brand on its own
// line, so they drop that prefix to keep titles short.
const TITLE_BRAND_PREFIX = /^[֐-׿][֐-׿0-9'"\s-]*? - [^֐-׿]+(?=[֐-׿])/;

export const getShortTitle = (title = "") => {
  const short = title.replace(TITLE_BRAND_PREFIX, "").trim();
  return short || title;
};

// Products can be listed before their price is set; they show "price coming
// soon" and can't be added to the cart until then.
export const hasPrice = (product) => Number(product?.salePrice ?? product?.price) > 0;

export const PRICE_COMING_SOON = { en: "Price coming soon", he: "מחיר בקרוב" };

export const getCategoryLabel = (category, t) =>
  category ? t(CATEGORY_LABELS[category] || { en: category, he: category }) : "";

// Small label above a product title: the brand, or the category for
// unbranded items.
export const getProductLabel = (product, t) =>
  product.brand && product.brand !== "Other" ? product.brand : getCategoryLabel(product.category, t);

// Same productType first, then same category; never the product itself.
export const getSimilarProducts = (products, product, limit = 4) => {
  const others = products.filter((item) => item.id !== product.id);
  const sameType = product.productType ? others.filter((item) => item.productType === product.productType) : [];
  const sameCategory = others.filter(
    (item) => item.category === product.category && !sameType.includes(item)
  );
  return [...sameType, ...sameCategory].slice(0, limit);
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
    subCategory: product?.subCategory || "",
    productType: product?.productType || "",
    brand: product?.brand || "",
    connectivity: product?.connectivity || "N/A",
    priceRange: product?.priceRange || "",
    createdAt: product?.createdAt || null,
    image: pickImage(product?.images),
    images: Array.isArray(product?.images) ? product.images : [],
    videos: Array.isArray(product?.videos) ? product.videos : []
  };
};

// Non-blocking hint for the admin forms: flags descriptions that are empty,
// too short to be useful, or just repeat the product title.
const MIN_DESCRIPTION_LENGTH = 40;
const normalizeText = (value) => (value || "").replace(/\s+/g, " ").trim().toLowerCase();

export const getDescriptionWarning = (title, description) => {
  const desc = normalizeText(description);
  if (!desc) return { ar: "لا يوجد وصف للمنتج.", he: "אין תיאור למוצר." };
  if (desc === normalizeText(title)) return { ar: "الوصف مطابق لاسم المنتج.", he: "התיאור זהה לשם המוצר." };
  if (desc.length < MIN_DESCRIPTION_LENGTH) return { ar: "الوصف قصير جدًا.", he: "התיאור קצר מדי – כדאי להוסיף מפרט." };
  return null;
};
