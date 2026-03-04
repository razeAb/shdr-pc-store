import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { getImageKit } from "../utils/imageKit.js";
import multer from "multer";

export const uploadRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

uploadRouter.get("/imagekit-auth", requireAuth, requireAdmin, (req, res, next) => {
  try {
    const imageKit = getImageKit();
    const authParams = imageKit.getAuthenticationParameters();
    res.json(authParams);
  } catch (error) {
    next(error);
  }
});

uploadRouter.post("/", requireAuth, requireAdmin, upload.any(), async (req, res, next) => {
  try {
    const file = req.files?.[0];
    if (!file) {
      return res.status(400).json({ message: "Missing file" });
    }

    const imageKit = getImageKit();
    const result = await imageKit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder: "/shdr",
    });

    return res.json({
      url: result.url,
      fileId: result.fileId,
      name: result.name,
    });
  } catch (error) {
    next(error);
  }
});
