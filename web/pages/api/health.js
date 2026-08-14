export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(455).json({
      success: false,
      error: { code: "METHOD_NOT_ALLOWED", message: "Only GET requests are allowed" },
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "RoyzHouse Web API",
    },
    message: "Service is healthy",
  });
}
