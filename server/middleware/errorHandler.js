function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === 11000) {
    return res.status(409).json({ message: "A record with that unique value already exists" });
  }
  const status = err.status || 400;
  res.status(status).json({ message: err.message || "Server error" });
}

module.exports = { notFound, errorHandler };
