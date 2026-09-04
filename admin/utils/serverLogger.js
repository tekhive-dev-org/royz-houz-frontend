function serialize(entry) {
  return JSON.stringify({ timestamp: new Date().toISOString(), service: "royzhouse-admin-api", ...entry });
}

/**
 * Logs request metadata only. Never pass request bodies, secrets, tokens, or
 * raw database error objects.
 */
export function logApiEvent({ requestId, route, method, status, errorCode, validationFields }) {
  // eslint-disable-next-line no-console
  console.info(serialize({
    requestId,
    route,
    method,
    status,
    errorCode: errorCode || null,
    ...(validationFields ? { validationFields } : {}),
  }));
}

export function createRequestId() {
  return crypto.randomUUID();
}
