import { ApiErrorCode, sendFailure, sendMethodNotAllowed } from "./apiResponse";
import { createRequestId, logApiEvent } from "./serverLogger";

const STATUS_BY_ERROR_CODE = {
  VALIDATION_ERROR: 400,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  RATE_LIMITED: 429,
};

export function statusForServiceError(error) {
  return STATUS_BY_ERROR_CODE[error?.code] || 500;
}

export function withApiHandler(route, handlers) {
  const allowedMethods = Object.keys(handlers);

  return async function apiHandler(req, res) {
    const requestId = createRequestId();
    const handler = handlers[req.method];

    if (!handler) {
      sendMethodNotAllowed(res, allowedMethods);
      logApiEvent({ requestId, route, method: req.method, status: 405, errorCode: "METHOD_NOT_ALLOWED" });
      return;
    }

    try {
      await handler(req, res, { requestId });
    } catch {
      sendFailure(
        res,
        ApiErrorCode.INTERNAL_ERROR,
        "An unexpected error occurred. Please try again.",
        500
      );
      logApiEvent({ requestId, route, method: req.method, status: 500, errorCode: "INTERNAL_ERROR" });
    }
  };
}

export function sendServiceResult(res, result, requestContext) {
  if (result.success) {
    const successStatus = requestContext.successStatus || 200;
    const response = res.status(successStatus).json({
      success: true,
      data: result.data,
      message: result.message,
      ...(result.pagination ? { pagination: result.pagination } : {}),
    });
    logApiEvent({ ...requestContext, status: successStatus });
    return response;
  }

  const status = statusForServiceError(result.error);
  const response = sendFailure(
    res,
    result.error?.code || ApiErrorCode.INTERNAL_ERROR,
    result.message || "Unable to process the request.",
    status,
    result.error?.details
  );
  logApiEvent({ ...requestContext, status, errorCode: result.error?.code || "INTERNAL_ERROR" });
  return response;
}
