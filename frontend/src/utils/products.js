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
  "Apple",
  "Samsung",
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
  "Kids Tech": ["Kids Tablets", "Educational Game Consoles"],
  Apple: ["iPhone", "iPad", "MacBook", "Apple Watch", "AirPods", "Accessories"],
  Samsung: ["Galaxy Phones", "Galaxy Tablets", "Galaxy Watch", "Galaxy Buds", "Accessories"]
};

export const CATEGORY_LABELS = {
  "Gaming Gear": { en: "Gaming Gear", he: "ציוד גיימינג" },
  PlayStation: { en: "PlayStation", he: "פלייסטיישן" },
  Xbox: { en: "Xbox", he: "אקסבוקס" },
  Nintendo: { en: "Nintendo", he: "נינטנדו" },
  "PC & Office": { en: "PC & Office", he: "מחשב ומשרד" },
  Networking: { en: "Networking", he: "רשתות" },
  Apple: { en: "Apple", he: "אפל" },
  Samsung: { en: "Samsung", he: "סמסונג" },
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
  "Educational Game Consoles": { en: "Educational Game Consoles", he: "קונסולות חינוכיות" },
  "iPhone": { en: "iPhone", he: "אייפון" },
  "iPad": { en: "iPad", he: "אייפד" },
  "MacBook": { en: "MacBook", he: "מקבוק" },
  "Apple Watch": { en: "Apple Watch", he: "אפל ווטש" },
  "AirPods": { en: "AirPods", he: "איירפודס" },
  "Galaxy Phones": { en: "Galaxy Phones", he: "טלפוני גלקסי" },
  "Galaxy Tablets": { en: "Galaxy Tablets", he: "טאבלטים גלקסי" },
  "Galaxy Watch": { en: "Galaxy Watch", he: "שעון גלקסי" },
  "Galaxy Buds": { en: "Galaxy Buds", he: "גלקסי באדס" }
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
  const includesAny = (value, keywords) => keywords.some((keyword) => value.includes(keyword));

  const gamingBrands = ["razer", "corsair", "logitech", "steelseries", "hyperx", "scorpius"];
  const sonyBrands = ["sony", "playstation", "ps5"];
  const xboxBrands = ["xbox", "microsoft"];
  const networkBrands = ["tp-link", "tplink"];
  const appleBrands = ["apple", "iphone", "ipad", "macbook", "airpods", "imac"];
  const samsungBrands = ["samsung", "galaxy"];

  const categories = new Set();
  const subCategories = new Set();
  let mainCategory = "";
  let subCategory = "";

  const addMatch = (category, sub) => {
    categories.add(category);
    if (sub) subCategories.add(sub);
    if (!mainCategory) {
      mainCategory = category;
      subCategory = sub || "";
    }
  };
  const addMobileMatch = (sub) => addMatch("Mobile & Tablets", sub);

  if (includesAny(text, appleBrands)) {
    if (includesAny(text, ["iphone", "אייפון"])) {
      addMatch("Apple", "iPhone");
      addMobileMatch("Smartphones");
    } else if (includesAny(text, ["ipad", "אייפד"])) {
      addMatch("Apple", "iPad");
      addMobileMatch("Tablets");
    } else if (includesAny(text, ["macbook", "מקבוק"])) {
      addMatch("Apple", "MacBook");
    } else if (includesAny(text, ["watch"])) {
      addMatch("Apple", "Apple Watch");
      addMobileMatch("Smartwatches");
    } else if (includesAny(text, ["airpods"])) {
      addMatch("Apple", "AirPods");
      addMobileMatch("Earbuds");
    }
    else addMatch("Apple", "Accessories");
  }

  if (includesAny(text, samsungBrands)) {
    if (includesAny(text, ["tablet", "tab", "טאבלט"])) {
      addMatch("Samsung", "Galaxy Tablets");
      addMobileMatch("Tablets");
    } else if (includesAny(text, ["watch", "gear", "שעון"])) {
      addMatch("Samsung", "Galaxy Watch");
      addMobileMatch("Smartwatches");
    } else if (includesAny(text, ["buds"])) {
      addMatch("Samsung", "Galaxy Buds");
      addMobileMatch("Earbuds");
    } else if (includesAny(text, ["phone", "galaxy", "טלפון", "סמארטפון"])) {
      addMatch("Samsung", "Galaxy Phones");
      addMobileMatch("Smartphones");
    }
    else addMatch("Samsung", "Accessories");
  }

  if (includesAny(text, sonyBrands)) {
    if (includesAny(text, ["קונסולה"])) addMatch("PlayStation", "Consoles");
    else if (includesAny(text, ["בקר", "controller", "dualsense"])) addMatch("PlayStation", "Controllers");
    else if (includesAny(text, ["מטען", "charging"])) addMatch("PlayStation", "Charging Docks");
    else if (includesAny(text, ["vr", "מציאות"])) addMatch("PlayStation", "VR");
    else if (includesAny(text, ["portal", "remote"])) addMatch("PlayStation", "Remote Play / Portal");
    else addMatch("PlayStation", "Accessories");
  }

  if (includesAny(text, xboxBrands)) {
    if (includesAny(text, ["קונסולה"])) addMatch("Xbox", "Consoles");
    else if (includesAny(text, ["בקר", "controller"])) addMatch("Xbox", "Controllers");
    else addMatch("Xbox", "Accessories");
  }

  if (includesAny(text, networkBrands) || includesAny(text, ["נתב", "router", "archer"])) {
    if (includesAny(text, ["מודם"])) addMatch("Networking", "Modem Routers");
    else if (includesAny(text, ["מתג", "רכזת", "switch"])) addMatch("Networking", "Switches");
    else if (includesAny(text, ["מגדיל", "access", "re"])) {
      addMatch("Networking", "Access Points / Range Extenders");
    } else if (includesAny(text, ["כרטיס רשת"])) addMatch("Networking", "Network Cards");
    else addMatch("Networking", "Routers");
  }

  if (includesAny(text, ["smartphone", "phone", "טלפון", "סמארטפון", "redmi", "xiaomi", "poco"])) {
    addMobileMatch("Smartphones");
  }

  if (includesAny(text, ["tablet", "ipad", "טאבלט"])) {
    addMobileMatch("Tablets");
  }

  if (includesAny(text, ["airpods", "earbuds", "buds"])) {
    addMobileMatch("Earbuds");
  }

  if (includesAny(text, ["watch", "smartwatch", "שעון"])) {
    addMobileMatch("Smartwatches");
  }

  if (
    includesAny(text, ["אוזניות", "headset"]) ||
    (includesAny(text, gamingBrands) && includesAny(text, ["hs", "blackshark", "stealth"]))
  ) {
    addMatch("Gaming Gear", "Gaming Headsets");
  }

  if (
    includesAny(text, ["עכבר", "mouse"]) ||
    (includesAny(text, gamingBrands) && includesAny(text, ["m55", "cobra", "katar"]))
  ) {
    addMatch("Gaming Gear", "Gaming Mice");
  }

  if (
    includesAny(text, ["מקלדת", "keyboard"]) ||
    (includesAny(text, gamingBrands) && includesAny(text, ["k55", "mx", "keys"]))
  ) {
    addMatch("Gaming Gear", "Gaming Keyboards");
  }

  if (includesAny(text, ["משטח", "pad", "gigantus", "g740", "mm100"])) {
    addMatch("Gaming Gear", "Mouse Pads");
  }

  if (includesAny(text, ["bundle", "kit", "ערכת"])) {
    addMatch("Gaming Gear", "Gaming Bundles");
  }

  if (includesAny(text, ["thrustmaster", "הגה"])) {
    addMatch("Gaming Gear", "Racing / Flight Controllers");
  }

  if (includesAny(text, ["זרוע", "usb", "hub"])) {
    addMatch("PC & Office", "Desk Setup Accessories");
  }

  if (!mainCategory) {
    addMatch("PC & Office", "Accessories");
  }

  return {
    mainCategory,
    subCategory,
    categories: Array.from(categories),
    subCategories: Array.from(subCategories)
  };
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
    subCategory: product?.subCategory || "",
    image: pickImage(product?.images),
    images: Array.isArray(product?.images) ? product.images : [],
    videos: Array.isArray(product?.videos) ? product.videos : []
  };
};
