import { recordMediaView } from "@/services/content/mediaService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { enforceWriteRateLimit, validateRequest } from "@/utils/apiRequest";
import { slugParamSchema } from "@/validators/api";

function extractClientIp(req) {
  if (process.env.TRUST_PROXY === "true" && req.headers["x-forwarded-for"]) {
    const header = Array.isArray(req.headers["x-forwarded-for"])
      ? req.headers["x-forwarded-for"][0]
      : req.headers["x-forwarded-for"];
    const first = header.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown";
}

export default withApiHandler("/api/media/[slug]/view", {
  POST: async (req, res, context) => {
    const rateLimitPassed = enforceWriteRateLimit(
      req,
      res,
      { ...context, route: "/api/media/[slug]/view", method: "POST" },
      { namespace: "media_view", limit: 30, windowMs: 60_000 }
    );
    if (!rateLimitPassed) return null;

    const params = validateRequest(res, slugParamSchema, req.query, {
      ...context,
      route: "/api/media/[slug]/view",
      method: "POST",
    });
    if (!params) return null;

    const clientIp = extractClientIp(req);
    const userAgent = req.headers["user-agent"] || "unknown";

    const result = await recordMediaView(params.slug, { clientIp, userAgent });
    return sendServiceResult(res, result, {
      ...context,
      route: "/api/media/[slug]/view",
      method: "POST",
    });
  },
});
