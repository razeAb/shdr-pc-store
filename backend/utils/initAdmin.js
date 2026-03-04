import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../models/User.js";

dotenv.config();
// MVP helper:

export async function initAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) return;

    const existing = await User.findOne({ email });
    if (existing) {
    if (existing.role !== "admin") {
        existing.role = "admin";
        await existing.save();
        console.log("Existing user promoted to admin.", email);
    }
        return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email, passwordHash, role: "admin" });
    console.log("Admin user created.", email);
}
