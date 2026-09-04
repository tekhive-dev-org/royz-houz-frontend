import { ApiErrorCode, sendFailure } from "./apiResponse";
import { parseWithSchema } from "@/validators/common";
import { enforceRateLimit } from "./rateLimit";
import { logApiEvent } from "./serverLogger";

export function validateRequest(res, schema, input, requestContext) {
  const result = parseWithSchema(schema, input);
  if (result.success) return result.data;

  sendFailure(
    res,
    ApiErrorCode.VALIDATION_ERROR,
    result.error.message,
    400,
    result.error.details
  );
  logApiEvent({ ...requestContext, status: 400, errorCode: ApiErrorCode.VALIDATION_ERROR });
  return null;
}

export function enforceWriteRateLimit(req, res, requestContext, options) {
  const result = enforceRateLimit(req, options);
  res.setHeader("X-RateLimit-Remaining", result.remaining);

  if (result.allowed) return true;

  res.setHeader("Retry-After", result.retryAfterSeconds);
  sendFailure(
    res,
    ApiErrorCode.RATE_LIMITED,
    "Too many requests. Please try again shortly.",
    429
  );
  logApiEvent({ ...requestContext, status: 429, errorCode: ApiErrorCode.RATE_LIMITED });
  return false;
}
