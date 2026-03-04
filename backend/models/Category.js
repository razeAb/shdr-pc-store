import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nameLower: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

categorySchema.pre("validate", function normalize(next) {
  if (this.name) {
    this.name = this.name.trim();
    this.nameLower = this.name.toLowerCase();
  }
  next();
});

export const Category = mongoose.model("Category", categorySchema);
