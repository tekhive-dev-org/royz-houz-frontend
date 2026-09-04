/** Redacts common sensitive keys before any response or log serialization. */
const SENSITIVE_KEYS = new Set([
  "password",
  "secret",
  "token",
  "authorization",
  "api_key",
  "apikey",
  "service_role_key",
  "serviceRoleKey",
  "donor_email",
  "email",
  "author_email",
  "authorEmail",
  "phone",
  "phone_number",
  "phoneNumber",
  "ip_address",
  "ipAddress",
]);

function isSensitiveKey(key) {
  if (SENSITIVE_KEYS.has(key)) return true;
  const lower = key.toLowerCase();
  return (
    lower.includes("password") ||
    lower.includes("secret") ||
    lower.includes("token") ||
    lower.includes("credential") ||
    lower.includes("authorization") ||
    lower.includes("api_key")
  );
}

/** Deep-copies a value and replaces sensitive leaves with a redaction marker. */
export function redactSensitiveData(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(redactSensitiveData);

  const output = {};
  for (const [key, entry] of Object.entries(value)) {
    if (isSensitiveKey(key)) {
      output[key] = "[REDACTED]";
    } else {
      output[key] = redactSensitiveData(entry);
    }
  }
  return output;
}

export function sanitizeString(value, maxLength = 2000) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, maxLength);
}
