function serialize(entry) {
  return JSON.stringify({ timestamp: new Date().toISOString(), service: "royzhouse-web-api", ...entry });
}

/** Logs request metadata only. Never pass request bodies, secrets, or raw database errors. */
export function logApiEvent({ requestId, route, method, status, errorCode }) {
  // eslint-disable-next-line no-console
  console.info(serialize({ requestId, route, method, status, errorCode: errorCode || null }));
}

export function createRequestId() {
  return crypto.randomUUID();
}
