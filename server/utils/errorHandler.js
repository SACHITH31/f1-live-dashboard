export const sendFallback = (res, label, err, fallback) => {
  console.log(`${label}:`, err.message);
  return res.json(fallback);
};

export const notFoundHandler = (req, res) =>
  res.status(404).json({ message: "Route not found." });

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.log("Unhandled API error:", err.message);
  return res.status(500).json({ message: "Internal server error." });
};
