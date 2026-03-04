import mongoose from "mongoose";

export async function connectDB(mongoURI) {
  if (!mongoURI) throw new Error("MONGO_URI is not set");

  try {
    await mongoose.connect(mongoURI); // ✅ no deprecated options
    console.log("MongoDB connected successfully.");
    console.log(`MongoDB readyState: ${mongoose.connection.readyState}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
