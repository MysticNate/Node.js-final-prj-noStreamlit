export function errorHandler(err, req, res, next) {
  console.error(err.message);
  
  // Check if response was already sent
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({ error: err.message });
}