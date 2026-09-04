import { ApiErrorCode, sendError, sendMethodNotAllowed } from "./apiResponse";
import { createRequestId, logApiEvent } from "./serverLogger";

/**
 * Wraps a protected admin API handler to provide a request ID, method
 * allowlisting, and centralized error/log handling. The handler receives
 * `context`. Response helpers may return `res` for route-level early exits, but
 * this wrapper intentionally resolves with `undefined` as required by Next.js.
 *
 * Authorization is intentionally NOT applied here: each endpoint calls
 * `requireAdminPermission` independently for its own exact permission.
 */
export function withAdminApiHandler(route, handlers) {
  const allowedMethods = Object.keys(handlers);

  return async function adminApiHandler(req, res) {
    const requestId = createRequestId();
    const handler = handlers[req.method];

    if (!handler) {
      sendMethodNotAllowed(res, allowedMethods, requestId);
      logApiEvent({ requestId, route, method: req.method, status: 405, errorCode: ApiErrorCode.METHOD_NOT_ALLOWED });
      return;
    }

    try {
      await handler(req, res, { route, requestId });
    } catch (error) {
      console.error("Admin API handler failed", {
        requestId,
        route,
        method: req.method,
        error: error instanceof Error ? error.message : String(error),
      });
      sendError(res, ApiErrorCode.INTERNAL_ERROR, "An unexpected error occurred. Please try again.", {
        status: 500,
        requestId,
      });
      logApiEvent({ requestId, route, method: req.method, status: 500, errorCode: ApiErrorCode.INTERNAL_ERROR });
    }
  };
}
