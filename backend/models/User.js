import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: {
            type: String,
            required: function () {
                return this.provider === "local";
            },
            default: "",
        },
        role: { type: String, enum: ["user", "admin"], default: "user" },

        // Auth provider info.
        provider: { type: String, enum: ["local", "google", "firebase"], default: "local" },
        googleSub: { type: String, default: "" }, // Google unique identifier
        firebaseUid: { type: String, default: "" },
    },
    { timestamps: true }
);
export const User = mongoose.model("User", UserSchema);
