import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db.js";
import { initAdmin } from "./utils/initAdmin.js";

import { authRouter } from "./routes/authRoutes.js";
import { productRouter } from "./routes/productRoutes.js";
import { checkoutRouter } from "./routes/checkoutRoutes.js";
import { orderRouter } from "./routes/orderRoutes.js";
import { uploadRouter } from "./routes/uploadRoutes.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { categoryRouter } from "./routes/categoryRoutes.js";
import { dealRouter } from "./routes/dealRoutes.js";
import { notFound, errorHandler } from "./middleware/error.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Security headers
app.use(helmet());

// Basic request logs
app.use(morgan("dev"));

// CORS
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: false,
  }),
);

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);

// JSON parser for normal routes
app.use(express.json({ limit: "1mb" }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/orders", orderRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/admin", adminRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/deals", dealRouter);

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Errors
app.use(notFound);
app.use(errorHandler);

// Boot
async function start() {
  const mongoUriRaw = process.env.MONGO_URI ?? "";

  const mongoUri = mongoUriRaw.trim().replace(/^['"]|['"]$/g, ""); // removes wrapping "..." or '...'

  const safe = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, "//<user>:<pass>@");
  console.log("MONGO_URI (safe):", safe);

  await connectDB(mongoUri);
  await initAdmin();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`✅ Allowed CORS origin: ${CLIENT_URL}`);
  });
}

start().catch((err) => {
  console.log("Loaded env from:", path.join(__dirname, ".env"));
  console.log("Has MONGO_URI?", Boolean(process.env.MONGO_URI));

  console.error("❌ Failed to start:", err);
  process.exit(1);
});
