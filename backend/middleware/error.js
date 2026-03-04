export function notFound(req, res) {
  res.status(404).json({ message: "Resource not found" });
}

export function errorHandler(err, req, res, next) {
  console.error("❌ Error:", err);
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || "Server error" });
}
