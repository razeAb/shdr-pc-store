import dns from "node:dns";
import mongoose from "mongoose";

export async function connectDB(mongoURI) {
  if (!mongoURI) throw new Error("MONGO_URI is not set");

  // mongodb+srv:// needs an SRV lookup, which Node's resolver often can't do
  // on Windows (querySrv ECONNREFUSED). Use public resolvers for it; this
  // only affects dns.resolve*, not normal hostname lookups.
  if (mongoURI.startsWith("mongodb+srv://")) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }

  try {
    await mongoose.connect(mongoURI); // ✅ no deprecated options
    console.log("MongoDB connected successfully.");
    console.log(`MongoDB readyState: ${mongoose.connection.readyState}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
