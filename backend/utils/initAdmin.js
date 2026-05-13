import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../models/User.js";

dotenv.config();
// MVP helper:

export async function initAdmin() {
    const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) return;

    const existing = await User.findOne({ email });
    if (existing) {
        let changed = false;

        if (existing.role !== "admin") {
            existing.role = "admin";
            console.log("Existing user promoted to admin.", email);
            changed = true;
        }

        const passwordMatches = existing.passwordHash
            ? await bcrypt.compare(password, existing.passwordHash)
            : false;

        if (!passwordMatches) {
            existing.passwordHash = await bcrypt.hash(password, 10);
            console.log("Existing admin password updated.", email);
            changed = true;
        }

        if (changed) {
            await existing.save();
        }
        return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email, passwordHash, role: "admin" });
    console.log("Admin user created.", email);
}
