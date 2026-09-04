const buckets = new Map();

function getTrustedForwardedAddress(req) {
  if (process.env.TRUST_PROXY !== "true") return null;

  const forwarded = req.headers["x-forwarded-for"];
  const forwardedValue = Array.isArray(forwarded) ? forwarded.at(-1) : forwarded;
  const addresses = forwardedValue?.split(",").map((address) => address.trim()).filter(Boolean);

  // Trusted proxies append the connecting client address to the right of the
  // X-Forwarded-For chain. Never trust this client-controlled header unless the
  // deployment explicitly enables TRUST_PROXY for its own reverse proxy.
  return addresses?.at(-1) || null;
}

function getClientIdentifier(req) {
  return getTrustedForwardedAddress(req) || req.socket?.remoteAddress || "unknown";
}

/**
 * In-memory rate-limit adapter for public write endpoints.
 * Replace this implementation with a shared store (for example Redis) when the
 * deployment scales beyond a single process.
 */
export function enforceRateLimit(req, { namespace, limit = 5, windowMs = 60_000 }) {
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
