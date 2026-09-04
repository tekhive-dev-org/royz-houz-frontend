import { sendSuccess, sendMethodNotAllowed } from "@/utils/apiResponse";
import { logApiEvent } from "@/utils/serverLogger";

export default function handler(req, res) {
  if (req.method !== "GET") {
    const response = sendMethodNotAllowed(res, ["GET"]);
    logApiEvent({
      requestId: "health-check",
      route: "/api/health",
      method: req.method,
      status: 405,
      errorCode: "METHOD_NOT_ALLOWED",
    });
    return response;
  }

  const response = sendSuccess(
    res,
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "RoyzHouse Web API",
    },
    "Service is healthy"
  );
  logApiEvent({ requestId: "health-check", route: "/api/health", method: req.method, status: 200 });
  return response;
}
