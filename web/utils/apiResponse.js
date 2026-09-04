export const ApiErrorCode = {
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
};

export function apiSuccess(data, message = "Request completed successfully") {
  return { success: true, data, message };
}

export function apiFailure(code, message, details = undefined) {
  const error = { code, message };
  if (details !== undefined) error.details = details;
  return { success: false, error };
}

export function sendSuccess(res, data, message, status = 200) {
  return res.status(status).json(apiSuccess(data, message));
}

export function sendFailure(res, code, message, status = 400, details) {
  return res.status(status).json(apiFailure(code, message, details));
}

export function sendMethodNotAllowed(res, allowed) {
  res.setHeader("Allow", allowed.join(", "));
  return sendFailure(
    res,
    ApiErrorCode.METHOD_NOT_ALLOWED,
    `Only ${allowed.join(", ")} requests are allowed.`,
    405
  );
}

export function sendUnexpectedError(res, context) {
  // Do not log request payloads, tokens, or environment values.
  // eslint-disable-next-line no-console
  console.error(`Unexpected API error${context ? `: ${context}` : ""}`);
  return sendFailure(
    res,
    ApiErrorCode.INTERNAL_ERROR,
    "An unexpected error occurred. Please try again.",
    500
  );
}
