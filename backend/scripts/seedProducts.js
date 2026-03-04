import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { connectDB } from "../config/db.js";
import { Product } from "../models/Product.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, "../data/products.json");

const loadProducts = async () => {
  const raw = await fs.readFile(dataPath, "utf-8");
  return JSON.parse(raw);
};

const toDbProduct = (item) => ({
  title: item.name,
  description: item.longDescription,
  images: item.images,
  price: item.price,
  category: item.category,
  isActive: item.isActive,
  tags: item.tags
});

const seed = async () => {
  await connectDB(process.env.MONGO_URI);
  const products = await loadProducts();

  if (process.env.RESET_PRODUCTS === "true") {
    await Product.deleteMany({});
  }

  const ops = products.map((item) => ({
    updateOne: {
      filter: { title: item.name },
      update: toDbProduct(item),
      upsert: true
    }
  }));

  const result = await Product.bulkWrite(ops);
  console.log("Seeded products:", result);
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
