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
export const PRIMARY_CATEGORIES = ["Gaming PCs", "PC Components", "PC Gaming", "PlayStation", "Xbox", "Nintendo"];

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
  "PC Components": { en: "PC Components", he: "רכיבי מחשב" },
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
  "Wearable Accessory": { en: "Wearable Accessory", he: "אביזר לביש" },
  CPU: { en: "Processors (CPU)", he: "מעבדים" },
  Motherboard: { en: "Motherboards", he: "לוחות אם" },
  "Memory (RAM)": { en: "Memory (RAM)", he: "זיכרונות RAM" },
  "Graphics Card": { en: "Graphics Cards", he: "כרטיסי מסך" },
  "Internal Storage": { en: "SSD & Hard Drives", he: "אחסון SSD ודיסקים קשיחים" },
  "PC Case": { en: "PC Cases", he: "מארזים" },
  "Power Supply": { en: "Power Supplies", he: "ספקי כוח" },
  Cooling: { en: "Cooling & Fans", he: "קירור ומאווררים" },
  "PC Building Accessory": { en: "PC Building Accessories", he: "אביזרים לבניית מחשב" }
};

// Types listed in this order in menus (a PC build's natural order);
// anything else follows alphabetically.
const PRODUCT_TYPE_ORDER = [
  "CPU",
  "Motherboard",
  "Memory (RAM)",
  "Graphics Card",
  "Internal Storage",
  "PC Case",
  "Power Supply",
  "Cooling",
  "PC Building Accessory"
];

const byProductTypeOrder = (a, b) => {
  const ia = PRODUCT_TYPE_ORDER.indexOf(a);
  const ib = PRODUCT_TYPE_ORDER.indexOf(b);
  if (ia !== -1 || ib !== -1) return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib);
  return a.localeCompare(b);
};

// Spec filters stored in product.attributes. Keys match the API query params
// (ATTRIBUTE_KEYS in backend/routes/productRoutes.js). `sort`: "number" sorts
// by the leading number (8GB < 16GB, 1TB after 960GB), "natural" by text.
export const ATTRIBUTE_GROUPS = [
  { key: "cpuSeries", title: { en: "Processor series", he: "סדרת מעבד" }, sort: "natural" },
  { key: "gpuChipset", title: { en: "GPU maker", he: "יצרן שבב גרפי" }, sort: "natural" },
  { key: "gpuModel", title: { en: "GPU model", he: "דגם כרטיס מסך" }, sort: "natural" },
  { key: "socket", title: { en: "Socket", he: "תושבת" }, sort: "natural" },
  { key: "chipset", title: { en: "Chipset", he: "ערכת שבבים" }, sort: "natural" },
  { key: "cores", title: { en: "Cores", he: "ליבות" }, sort: "number" },
  { key: "igpu", title: { en: "Integrated graphics", he: "ליבה גרפית מובנית" }, sort: "natural" },
  { key: "formFactor", title: { en: "Form factor", he: "גודל לוח" }, sort: "natural" },
  { key: "memoryType", title: { en: "Memory type", he: "סוג זיכרון" }, sort: "natural" },
  { key: "wifi", title: { en: "Wi-Fi", he: "Wi-Fi" }, sort: "natural" },
  { key: "storageType", title: { en: "Drive type", he: "סוג כונן" }, sort: "natural" },
  { key: "capacity", title: { en: "Capacity", he: "נפח" }, sort: "number" },
  { key: "modules", title: { en: "Modules", he: "תצורת זיכרון" }, sort: "natural" },
  { key: "speed", title: { en: "Speed", he: "מהירות" }, sort: "number" },
  { key: "pcieGen", title: { en: "PCIe generation", he: "דור PCIe" }, sort: "natural" },
  { key: "vram", title: { en: "Video memory", he: "זיכרון גרפי" }, sort: "number" },
  { key: "caseSize", title: { en: "Case size", he: "גודל מארז" }, sort: "natural" },
  { key: "boardSupport", title: { en: "Largest motherboard", he: "תמיכה בלוח עד" }, sort: "natural" },
  { key: "wattage", title: { en: "Wattage", he: "הספק" }, sort: "number" },
  { key: "efficiency", title: { en: "Efficiency", he: "תקן יעילות" }, sort: "natural" },
  { key: "atxVersion", title: { en: "ATX standard", he: "תקן ATX" }, sort: "natural" },
  { key: "coolingType", title: { en: "Cooling type", he: "סוג קירור" }, sort: "natural" },
  { key: "radiatorSize", title: { en: "Radiator size", he: "גודל רדיאטור" }, sort: "number" },
  { key: "accessoryType", title: { en: "Accessory type", he: "סוג אביזר" }, sort: "natural" },
  { key: "screenSize", title: { en: "Screen size", he: "גודל מסך" }, sort: "number" },
  { key: "resolution", title: { en: "Resolution", he: "רזולוציה" }, sort: "natural" },
  { key: "refreshRate", title: { en: "Refresh rate", he: "קצב רענון" }, sort: "number" },
  { key: "panelType", title: { en: "Panel type", he: "סוג פנל" }, sort: "natural" },
  { key: "screenShape", title: { en: "Screen shape", he: "צורת מסך" }, sort: "natural" },
  { key: "os", title: { en: "Operating system", he: "מערכת הפעלה" }, sort: "natural" },
  { key: "color", title: { en: "Color", he: "צבע" }, sort: "natural" }
];

// Translations for attribute values that are words rather than model names.
export const ATTRIBUTE_VALUE_LABELS = {
  Yes: { en: "Yes", he: "כן" },
  No: { en: "No", he: "לא" },
  "No Wi-Fi": { en: "No Wi-Fi", he: "ללא Wi-Fi" },
  Black: { en: "Black", he: "שחור" },
  White: { en: "White", he: "לבן" },
  Other: { en: "Other", he: "אחר" },
  Flat: { en: "Flat", he: "שטוח" },
  Curved: { en: "Curved", he: "קעור" },
  "NVMe SSD": { en: "NVMe SSD", he: "SSD NVMe" },
  "SATA SSD": { en: "SATA SSD", he: "SSD SATA" },
  HDD: { en: "Hard drive (HDD)", he: "דיסק קשיח (HDD)" },
  "Liquid Cooler": { en: "Liquid cooler (AIO)", he: "קירור נוזלי" },
  "CPU Air Cooler": { en: "CPU air cooler", he: "קירור אוויר למעבד" },
  "Case Fan": { en: "Case fans", he: "מאווררים למארז" },
  "Cooling Accessory": { en: "Cooling accessories", he: "אביזרי קירור" },
  "Case Panel": { en: "Case panels & glass", he: "פנלים וזכוכיות למארז" },
  "GPU Support": { en: "GPU supports", he: "תומכים לכרטיס מסך" },
  "Expansion Card": { en: "Expansion cards", he: "כרטיסי הרחבה" },
  "Cables & Adapters": { en: "Cables & adapters", he: "כבלים ומתאמים" },
  "Mid Tower": { en: "Mid Tower", he: "Mid Tower (בינוני)" },
  "Mini Tower": { en: "Mini Tower", he: "Mini Tower (קטן)" },
  "Full Tower": { en: "Full Tower", he: "Full Tower (גדול)" },
  Slim: { en: "Slim", he: "Slim (דק)" },
  "No OS (FreeDOS)": { en: "No OS (FreeDOS)", he: "ללא מערכת הפעלה" },
  Integrated: { en: "Integrated graphics", he: "גרפיקה מובנית" }
};

const leadingNumber = (value) => {
  const match = /(\d+(?:\.\d+)?)\s*(TB)?/i.exec(value);
  if (!match) return Number.POSITIVE_INFINITY;
  return Number(match[1]) * (match[2] ? 1000 : 1);
};

export const compareAttributeValues = (sort) => (a, b) =>
  sort === "number"
    ? leadingNumber(a.value) - leadingNumber(b.value) || a.value.localeCompare(b.value)
    : a.value.localeCompare(b.value, undefined, { numeric: true });

// Imported descriptions end with a "מפרט טכני:" block of "label: value"
// lines. Split it out so the product page can show a proper spec table;
// descriptions without that block come back as plain text.
const SPEC_SHEET_HEADER = "מפרט טכני:";

export const parseSpecSheet = (description = "") => {
  const index = description.indexOf(SPEC_SHEET_HEADER);
  if (index === -1) return { intro: description.trim(), rows: [] };
  const rows = description
    .slice(index + SPEC_SHEET_HEADER.length)
    .split("\n")
    .map((line) => {
      const separator = line.indexOf(":");
      if (separator <= 0) return null;
      const label = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      return label && value ? { label, value } : null;
    })
    .filter(Boolean);
  return { intro: description.slice(0, index).trim(), rows };
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
    Object.entries(map).map(([category, types]) => [category, Array.from(types).sort(byProductTypeOrder)])
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
// Small build parts (cables, screws, splitters) are cheap but aren't deals.
const NOT_DEAL_TYPES = ["PC Building Accessory"];

export const getDeals = (products, limit = RAIL_LIMIT) => {
  const cheapBuckets = PRICE_RANGE_ORDER.slice(0, 2);
  const pool = products.filter(
    (product) => cheapBuckets.includes(product.priceRange) && !NOT_DEAL_TYPES.includes(product.productType)
  );
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
    videos: Array.isArray(product?.videos) ? product.videos : [],
    specs: product?.specs || {},
    attributes: Array.isArray(product?.attributes) ? product.attributes : []
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
