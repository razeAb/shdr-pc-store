import express from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

import { User } from "../models/User.js";
import { registerSchema, loginSchema, googleLoginSchema, firebaseLoginSchema } from "../utils/validators.js";
import { signToken } from "../utils/jwt.js";
import { getFirebaseAdmin } from "../utils/firebaseAdmin.js";

export const authRouter = express.Router();

function requireGoogleClientId() {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) throw new Error("Missing GOOGLE_CLIENT_ID in env");
  return id;
}

const googleClient = new OAuth2Client();

/**
 * OPTIONAL: local register (you can remove later if you want Google-only)
 */
authRouter.post("/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const { email, password } = parsed.data;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      role: "user",
      provider: "local"
    });

    const token = signToken({ userId: user._id.toString(), role: user.role, email: user.email });

    return res.json({ token, user: { email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

/**
 * OPTIONAL: local login (you can remove later if you want Google-only)
 */
authRouter.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const { email, password } = parsed.data;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken({ userId: user._id.toString(), role: user.role, email: user.email });

    return res.json({ token, user: { email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

/**
 * Google login (Gmail)
 * Client sends: { credential: "<google_id_token>" }
 */
authRouter.post("/google", async (req, res, next) => {
  try {
    const parsed = googleLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const { credential } = parsed.data;

    const clientId = requireGoogleClientId();
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ message: "Invalid Google token" });

    const email = (payload.email || "").toLowerCase();
    const emailVerified = !!payload.email_verified;
    const sub = payload.sub || "";

    if (!email || !emailVerified) {
      return res.status(401).json({ message: "Google email not verified" });
    }

    // Upsert user (admin if whitelisted, otherwise normal user)
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        role: "user",
        provider: "google",
        googleSub: sub,
        passwordHash: ""
      });
    } else {
      user.provider = "google";
      user.googleSub = user.googleSub || sub;
      await user.save();
    }

    const token = signToken({ userId: user._id.toString(), role: user.role, email: user.email });

    return res.json({ token, user: { email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

/**
 * Firebase Google login
 * Client sends: { idToken: "<firebase_id_token>" }
 */
authRouter.post("/firebase-google", async (req, res, next) => {
  try {
    const parsed = firebaseLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    }

    const { idToken } = parsed.data;
    const adminApp = getFirebaseAdmin();
    const decoded = await adminApp.auth().verifyIdToken(idToken);

    const email = (decoded.email || "").toLowerCase();
    const emailVerified = !!decoded.email_verified;
    const uid = decoded.uid || "";

    if (!email || !emailVerified) {
      return res.status(401).json({ message: "Firebase email not verified" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        role: "user",
        provider: "firebase",
        firebaseUid: uid,
        passwordHash: ""
      });
    } else {
      user.provider = "firebase";
      user.firebaseUid = user.firebaseUid || uid;
      await user.save();
    }

    const token = signToken({ userId: user._id.toString(), role: user.role, email: user.email });

    return res.json({ token, user: { email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});
