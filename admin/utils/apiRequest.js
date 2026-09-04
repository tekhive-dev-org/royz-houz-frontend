import { ApiErrorCode, sendError } from "./apiResponse";
import { logApiEvent } from "./serverLogger";
import { enforceRateLimit } from "./rateLimit";
import { parseWithSchema } from "@/validators/common";

/**
 * Parses a JSON request body that the Pages Router body parser already
 * deserialized. `next` disables the body parser and sets `req.body` to a raw
 * stream, so protected routes that need large payloads must handle that
 * separately rather than pass a stream here.
 */
export function getJsonBody(req) {
  if (req.body === undefined || req.body === null) return null;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return req.body;
}

export function validateRequest({ res, schema, input, requestId, logContext }) {
  const result = parseWithSchema(schema, input);
  if (result.success) return result.data;

  sendError(res, ApiErrorCode.VALIDATION_ERROR, result.error.message, {
    status: 400,
    requestId,
    fields: result.error.fields,
  });
  logApiEvent({
    ...logContext,
    status: 400,
    errorCode: ApiErrorCode.VALIDATION_ERROR,
    validationFields: result.error.fields,
  });
  return null;
}

export function enforceWriteRateLimit({ req, res, requestId, logContext, options }) {
  const result = enforceRateLimit(req, options);
  res.setHeader("X-RateLimit-Remaining", result.remaining);

  if (result.allowed) return true;

  res.setHeader("Retry-After", result.retryAfterSeconds);
  sendError(res, ApiErrorCode.RATE_LIMITED, "Too many requests. Please try again shortly.", {
    status: 429,
    requestId,
  });
  logApiEvent({ ...logContext, status: 429, errorCode: ApiErrorCode.RATE_LIMITED });
  return false;
}

/** Attaches request and route metadata shared by all admin handlers. */
export function createRequestContext({ req, route, requestId }) {
  return {
    route,
    requestId,
    method: req.method,
  };
}
