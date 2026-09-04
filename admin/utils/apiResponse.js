export const ApiErrorCode = {
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
  UNAUTHORIZED: "UNAUTHORIZED",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  FORBIDDEN: "FORBIDDEN",
  ADMIN_ACCESS_REQUIRED: "ADMIN_ACCESS_REQUIRED",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
  INTERNAL_ERROR: "INTERNAL_ERROR",
};

export function apiSuccess(data, message = "Request completed successfully") {
  return {
    success: true,
    data,
    message,
  };
}

export function apiError(code, message) {
  return {
    success: false,
    error: { code, message },
  };
}

/**
 * Success envelope used by protected admin API routes:
 *   { success: true, data, meta }
 */
export function sendSuccess(res, data, { status = 200, requestId = null, meta = {} } = {}) {
  return res.status(status).json({
    success: true,
    data,
    meta: {
      requestId: requestId || null,
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}

/**
 * Error envelope used by protected admin API routes:
 *   { success: false, error: { code, message, fields? } }
 */
export function sendError(res, code, message, { status = 400, requestId = null, fields = null } = {}) {
  const error = { code, message };
  if (fields) error.fields = fields;

  return res.status(status).json({
    success: false,
    error,
    meta: { requestId: requestId || null, timestamp: new Date().toISOString() },
  });
}

export function sendMethodNotAllowed(res, allowedMethods, requestId = null) {
  res.setHeader("Allow", allowedMethods.join(", "));
  return sendError(res, ApiErrorCode.METHOD_NOT_ALLOWED, `Only ${allowedMethods.join(", ")} requests are allowed.`, {
    status: 405,
    requestId,
  });
}
