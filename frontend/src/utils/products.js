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

export const HOMEPAGE_CATEGORIES = [
  "Gaming Gear",
  "PlayStation",
  "Xbox",
  "Nintendo",
  "PC & Office",
  "Networking",
  "Mobile & Tablets",
  "Kids Tech"
];

export const CATEGORY_SUBCATEGORIES = {
  "Gaming Gear": [
    "Gaming Headsets",
    "Gaming Keyboards",
    "Gaming Mice",
    "Mouse Pads",
    "Gaming Bundles",
    "Racing / Flight Controllers"
  ],
  PlayStation: ["Consoles", "Controllers", "Charging Docks", "VR", "Remote Play / Portal", "Accessories"],
  Xbox: ["Consoles", "Controllers", "Charging Kits", "Accessories"],
  Nintendo: ["Consoles", "Controllers", "Cases", "Accessories"],
  "PC & Office": ["Keyboards", "Mice", "Keyboard + Mouse Combos", "Monitors", "Desk Setup Accessories", "Laptops"],
  Networking: ["Routers", "Modem Routers", "Switches", "Access Points / Range Extenders", "Network Cards"],
  "Mobile & Tablets": ["Smartphones", "Tablets", "Tablet Accessories", "Earbuds", "AirPods Cases", "Smartwatches", "Watch Bands"],
  "Kids Tech": ["Kids Tablets", "Educational Game Consoles"]
};

export const CATEGORY_LABELS = {
  "Gaming Gear": { en: "Gaming Gear", he: "ציוד גיימינג" },
  PlayStation: { en: "PlayStation", he: "פלייסטיישן" },
  Xbox: { en: "Xbox", he: "אקסבוקס" },
  Nintendo: { en: "Nintendo", he: "נינטנדו" },
  "PC & Office": { en: "PC & Office", he: "מחשב ומשרד" },
  Networking: { en: "Networking", he: "רשתות" },
  "Mobile & Tablets": { en: "Mobile & Tablets", he: "מובייל וטאבלטים" },
  "Kids Tech": { en: "Kids Tech", he: "טכנולוגיה לילדים" }
};

export const SUBCATEGORY_LABELS = {
  "Gaming Headsets": { en: "Gaming Headsets", he: "אוזניות גיימינג" },
  "Gaming Keyboards": { en: "Gaming Keyboards", he: "מקלדות גיימינג" },
  "Gaming Mice": { en: "Gaming Mice", he: "עכברי גיימינג" },
  "Mouse Pads": { en: "Mouse Pads", he: "משטחי עכבר" },
  "Gaming Bundles": { en: "Gaming Bundles", he: "חבילות גיימינג" },
  "Racing / Flight Controllers": { en: "Racing / Flight Controllers", he: "בקרי מירוץ/טיסה" },
  Consoles: { en: "Consoles", he: "קונסולות" },
  Controllers: { en: "Controllers", he: "שלטים" },
  "Charging Docks": { en: "Charging Docks", he: "תחנות טעינה" },
  VR: { en: "VR", he: "מציאות מדומה" },
  "Remote Play / Portal": { en: "Remote Play / Portal", he: "Remote Play / Portal" },
  Accessories: { en: "Accessories", he: "אביזרים" },
  "Charging Kits": { en: "Charging Kits", he: "ערכות טעינה" },
  Cases: { en: "Cases", he: "כיסויים" },
  Keyboards: { en: "Keyboards", he: "מקלדות" },
  Mice: { en: "Mice", he: "עכברים" },
  "Keyboard + Mouse Combos": { en: "Keyboard + Mouse Combos", he: "סט מקלדת ועכבר" },
  Monitors: { en: "Monitors", he: "מסכים" },
  "Desk Setup Accessories": { en: "Desk Setup Accessories", he: "אביזרי שולחן עבודה" },
  Laptops: { en: "Laptops", he: "מחשבים ניידים" },
  Routers: { en: "Routers", he: "ראוטרים" },
  "Modem Routers": { en: "Modem Routers", he: "מודם-ראוטר" },
  Switches: { en: "Switches", he: "מתגים" },
  "Access Points / Range Extenders": { en: "Access Points / Range Extenders", he: "נקודות גישה/מאריכי טווח" },
  "Network Cards": { en: "Network Cards", he: "כרטיסי רשת" },
  Smartphones: { en: "Smartphones", he: "סמארטפונים" },
  Tablets: { en: "Tablets", he: "טאבלטים" },
  "Tablet Accessories": { en: "Tablet Accessories", he: "אביזרי טאבלט" },
  Earbuds: { en: "Earbuds", he: "אוזניות אלחוטיות" },
  "AirPods Cases": { en: "AirPods Cases", he: "כיסויים ל-AirPods" },
  Smartwatches: { en: "Smartwatches", he: "שעונים חכמים" },
  "Watch Bands": { en: "Watch Bands", he: "רצועות לשעונים" },
  "Kids Tablets": { en: "Kids Tablets", he: "טאבלטים לילדים" },
  "Educational Game Consoles": { en: "Educational Game Consoles", he: "קונסולות חינוכיות" }
};

export const SPEC_LABELS = {
  Wireless: { en: "Wireless", he: "אלחוטי" },
  Wired: { en: "Wired", he: "חוטי" },
  RGB: { en: "RGB", he: "RGB" },
  Mechanical: { en: "Mechanical", he: "מכני" },
  Membrane: { en: "Membrane", he: "ממברנה" },
  "1440p": { en: "1440p", he: "1440p" },
  "4K": { en: "4K", he: "4K" },
  "1080p": { en: "1080p", he: "1080p" },
  OLED: { en: "OLED", he: "OLED" },
  IPS: { en: "IPS", he: "IPS" },
  VA: { en: "VA", he: "VA" },
  "Wi-Fi 7": { en: "Wi-Fi 7", he: "Wi-Fi 7" },
  "Wi-Fi 6E": { en: "Wi-Fi 6E", he: "Wi-Fi 6E" },
  "Wi-Fi 6": { en: "Wi-Fi 6", he: "Wi-Fi 6" }
};

const KNOWN_BRANDS = [
  "Sony",
  "Microsoft",
  "Nintendo",
  "Corsair",
  "Logitech",
  "Razer",
  "SteelSeries",
  "HyperX",
  "TP-Link",
  "ASUS",
  "MSI",
  "Gigabyte",
  "Samsung",
  "Apple",
  "Lenovo",
  "Dell",
  "HP",
  "Acer",
  "ASRock",
  "BenQ",
  "LG"
];

const toSearchText = (product) =>
  `${product?.title || ""} ${product?.description || ""} ${(product?.tags || []).join(" ")}`.toLowerCase();

const matchAny = (text, keywords) => keywords.some((keyword) => text.includes(keyword));

const isPlayStation = (text) => matchAny(text, ["ps5", "playstation", "dualsense", "vr2", "portal", "psvr", "ps vr"]);
const isXbox = (text) => matchAny(text, ["xbox", "series x", "series s", "elite", "xbox controller"]);
const isNintendo = (text) => matchAny(text, ["nintendo", "switch", "mario", "donkey kong", "joy-con", "joycon"]);
const isMobile = (text) =>
  matchAny(text, ["galaxy", "ipad", "tablet", "smartphone", "phone", "airpods", "buds", "earbuds", "watch", "smartwatch"]);
const isNetworking = (text) =>
  matchAny(text, ["tp-link", "tplink", "router", "modem", "switch", "access point", "extender", "network card", "mesh"]);
const isGamingGear = (text) =>
  matchAny(text, [
    "gaming",
    "headset",
    "keyboard",
    "mouse",
    "mouse pad",
    "mousepad",
    "bundle",
    "hotas",
    "racing wheel",
    "flight",
    "joystick"
  ]);
const isPcOffice = (text) =>
  matchAny(text, ["keyboard", "mouse", "combo", "monitor", "monitor arm", "arm", "usb hub", "hub", "laptop", "dock", "docking"]);
const isKidsTech = (text) => matchAny(text, ["kids", "child", "children", "educational", "learning", "toddler"]);

const resolveSubcategory = (text, mainCategory) => {
  if (mainCategory === "PlayStation") {
    if (matchAny(text, ["console", "ps5"])) return "Consoles";
    if (matchAny(text, ["controller", "dualsense"])) return "Controllers";
    if (matchAny(text, ["charging", "dock", "station"])) return "Charging Docks";
    if (matchAny(text, ["vr", "vr2", "psvr"])) return "VR";
    if (matchAny(text, ["portal", "remote play"])) return "Remote Play / Portal";
    return "Accessories";
  }
  if (mainCategory === "Xbox") {
    if (matchAny(text, ["console", "series x", "series s"])) return "Consoles";
    if (matchAny(text, ["controller", "elite"])) return "Controllers";
    if (matchAny(text, ["charging", "dock", "kit", "battery"])) return "Charging Kits";
    return "Accessories";
  }
  if (mainCategory === "Nintendo") {
    if (matchAny(text, ["console", "switch"])) return "Consoles";
    if (matchAny(text, ["controller", "joy-con", "joycon"])) return "Controllers";
    if (matchAny(text, ["case", "carry"])) return "Cases";
    return "Accessories";
  }
  if (mainCategory === "Gaming Gear") {
    if (matchAny(text, ["headset", "headphones"])) return "Gaming Headsets";
    if (matchAny(text, ["keyboard"])) return "Gaming Keyboards";
    if (matchAny(text, ["mouse"])) return "Gaming Mice";
    if (matchAny(text, ["mouse pad", "mousepad"])) return "Mouse Pads";
    if (matchAny(text, ["hotas", "racing wheel", "flight", "joystick"])) return "Racing / Flight Controllers";
    if (matchAny(text, ["bundle", "combo"])) return "Gaming Bundles";
    return "Gaming Bundles";
  }
  if (mainCategory === "PC & Office") {
    if (matchAny(text, ["keyboard"])) return "Keyboards";
    if (matchAny(text, ["mouse"])) return "Mice";
    if (matchAny(text, ["combo", "keyboard + mouse", "keyboard and mouse"])) return "Keyboard + Mouse Combos";
    if (matchAny(text, ["monitor"])) return "Monitors";
    if (matchAny(text, ["laptop", "notebook"])) return "Laptops";
    return "Desk Setup Accessories";
  }
  if (mainCategory === "Networking") {
    if (matchAny(text, ["modem router", "modem"])) return "Modem Routers";
    if (matchAny(text, ["router", "mesh"])) return "Routers";
    if (matchAny(text, ["switch"])) return "Switches";
    if (matchAny(text, ["access point", "extender", "range extender"])) return "Access Points / Range Extenders";
    if (matchAny(text, ["network card", "pcie", "adapter"])) return "Network Cards";
    return "Routers";
  }
  if (mainCategory === "Mobile & Tablets") {
    if (matchAny(text, ["smartphone", "phone", "galaxy", "iphone"])) return "Smartphones";
    if (matchAny(text, ["tablet", "ipad"])) return "Tablets";
    if (matchAny(text, ["earbuds", "buds", "airpods"])) return "Earbuds";
    if (matchAny(text, ["airpods case", "case for airpods"])) return "AirPods Cases";
    if (matchAny(text, ["watch", "smartwatch"])) return "Smartwatches";
    if (matchAny(text, ["band", "strap"])) return "Watch Bands";
    return "Tablet Accessories";
  }
  if (mainCategory === "Kids Tech") {
    if (matchAny(text, ["tablet"])) return "Kids Tablets";
    return "Educational Game Consoles";
  }
  return "";
};

export const categorizeProduct = (product) => {
  const text = toSearchText(product);

  let mainCategory = "";
  if (isPlayStation(text)) mainCategory = "PlayStation";
  else if (isXbox(text)) mainCategory = "Xbox";
  else if (isNintendo(text)) mainCategory = "Nintendo";
  else if (isMobile(text)) mainCategory = "Mobile & Tablets";
  else if (isNetworking(text)) mainCategory = "Networking";
  else if (isGamingGear(text)) mainCategory = "Gaming Gear";
  else if (isPcOffice(text)) mainCategory = "PC & Office";
  else if (isKidsTech(text)) mainCategory = "Kids Tech";

  const subCategory = mainCategory ? resolveSubcategory(text, mainCategory) : "";
  return { mainCategory, subCategory };
};

export const extractBrand = (product) => {
  const text = toSearchText(product);
  const match = KNOWN_BRANDS.find((brand) => text.includes(brand.toLowerCase()));
  return match || "Other";
};

export const extractSpecs = (product) => {
  const text = toSearchText(product);
  const specs = [];

  if (matchAny(text, ["wireless", "bluetooth"])) specs.push("Wireless");
  if (matchAny(text, ["wired", "usb-a", "usb c", "usb-c"])) specs.push("Wired");
  if (matchAny(text, ["rgb", "backlit"])) specs.push("RGB");
  if (matchAny(text, ["mechanical"])) specs.push("Mechanical");
  if (matchAny(text, ["membrane"])) specs.push("Membrane");
  if (matchAny(text, ["1440p", "qhd"])) specs.push("1440p");
  if (matchAny(text, ["4k", "uhd"])) specs.push("4K");
  if (matchAny(text, ["1080p", "full hd", "fhd"])) specs.push("1080p");
  if (matchAny(text, ["oled"])) specs.push("OLED");
  if (matchAny(text, ["ips"])) specs.push("IPS");
  if (matchAny(text, ["va panel", "va"])) specs.push("VA");
  if (matchAny(text, ["wifi 7", "wi-fi 7"])) specs.push("Wi-Fi 7");
  if (matchAny(text, ["wifi 6e", "wi-fi 6e"])) specs.push("Wi-Fi 6E");
  if (matchAny(text, ["wifi 6", "wi-fi 6"])) specs.push("Wi-Fi 6");

  return Array.from(new Set(specs));
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
