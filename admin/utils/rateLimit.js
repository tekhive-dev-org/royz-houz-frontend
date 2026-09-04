const buckets = new Map();

function getClientIdentifier(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const forwardedAddress = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return forwardedAddress?.trim() || req.socket?.remoteAddress || "unknown";
}

/**
 * In-memory rate-limit abstraction. Replace with a shared store (for example
 * Redis) when the deployment scales beyond a single process.
 */
export function enforceRateLimit(req, { namespace, limit = 30, windowMs = 60_000 }) {
  const now = Date.now();
  const key = `${namespace}:${getClientIdentifier(req)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, remaining: limit - current.count, retryAfterSeconds: 0 };
}
