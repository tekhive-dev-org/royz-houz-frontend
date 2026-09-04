import { v2 as cloudinary } from "cloudinary";

function assertServerRuntime() {
  if (typeof window !== "undefined") {
    throw new Error("Cloudinary configuration is available only on the server.");
  }
}

function getRequiredEnvironmentValue(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required server configuration: ${name}`);
  return value;
}

/**
 * Returns the Cloudinary SDK configured with server-only credentials. This
 * module must never be imported by components, hooks, browser services, or
 * browser API clients.
 */
export function getCloudinaryServerClient() {
  assertServerRuntime();

  cloudinary.config({
    cloud_name: getRequiredEnvironmentValue("CLOUDINARY_CLOUD_NAME"),
    api_key: getRequiredEnvironmentValue("CLOUDINARY_API_KEY"),
    api_secret: getRequiredEnvironmentValue("CLOUDINARY_API_SECRET"),
    secure: true,
  });

  return cloudinary;
}

export function getCloudinaryCloudName() {
  assertServerRuntime();
  return getRequiredEnvironmentValue("CLOUDINARY_CLOUD_NAME");
}
