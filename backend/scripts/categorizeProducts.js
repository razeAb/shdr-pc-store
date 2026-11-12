import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { connectDB } from "../config/db.js";
import { Product } from "../models/Product.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const toSearchText = (product) =>
  `${product?.title || ""} ${product?.description || ""} ${(product?.tags || []).join(" ")}`.toLowerCase();

const categorizeProduct = (product) => {
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
    } else {
      addMatch("Apple", "Accessories");
    }
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
    } else {
      addMatch("Samsung", "Accessories");
    }
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

const run = async () => {
  await connectDB(process.env.MONGO_URI);
  const products = await Product.find({ automationLocked: { $ne: true } });
  const ops = [];

  products.forEach((product) => {
    const { mainCategory, subCategory } = categorizeProduct(product);
    const updates = {};
    if (mainCategory && product.category !== mainCategory) {
      updates.category = mainCategory;
    }
    if (subCategory && product.subCategory !== subCategory) {
      updates.subCategory = subCategory;
    }
    if (Object.keys(updates).length === 0) return;
      ops.push({
        updateOne: {
          filter: { _id: product._id, automationLocked: { $ne: true } },
          update: { $set: updates }
        }
      });
  });

  if (ops.length === 0) {
    console.log("No products needed category updates.");
    process.exit(0);
  }

  const result = await Product.bulkWrite(ops);
  console.log("Updated categories:", result);
  process.exit(0);
};

run().catch((err) => {
  console.error("Categorize failed:", err);
  process.exit(1);
});
