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

/** Server-only Cloudinary client. Never import this from browser code. */
export function getAdminCloudinaryClient() {
  assertServerRuntime();

  cloudinary.config({
    cloud_name: getRequiredEnvironmentValue("CLOUDINARY_CLOUD_NAME"),
    api_key: getRequiredEnvironmentValue("CLOUDINARY_API_KEY"),
    api_secret: getRequiredEnvironmentValue("CLOUDINARY_API_SECRET"),
    secure: true,
  });

  return cloudinary;
}

export function getAdminCloudinaryCloudName() {
  assertServerRuntime();
  return getRequiredEnvironmentValue("CLOUDINARY_CLOUD_NAME");
}

export function getAdminCloudinaryApiKey() {
  assertServerRuntime();
  return getRequiredEnvironmentValue("CLOUDINARY_API_KEY");
}
