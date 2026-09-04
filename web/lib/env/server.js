import { z } from "zod";

const serverEnvironmentSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_DATABASE_URL: z.string().url(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});

function assertServerRuntime() {
  if (typeof window !== "undefined") {
    throw new Error("Server environment validation may only run on the server.");
  }
}

function formatServerEnvironmentIssues(issues) {
  return issues.map((issue) => issue.path.join(".")).join(", ");
}

/**
 * Validates privileged configuration for API routes and server-side services.
 * It never logs or returns secret values. Do not import this module into React
 * components or other browser code.
 */
export function validateServerEnv(environment = process.env) {
  assertServerRuntime();

  const result = serverEnvironmentSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: environment.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_DATABASE_URL: environment.SUPABASE_DATABASE_URL,
    CLOUDINARY_CLOUD_NAME: environment.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: environment.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: environment.CLOUDINARY_API_SECRET,
  });

  if (!result.success) {
    throw new Error(
      `Invalid server environment configuration. Set valid values for: ${formatServerEnvironmentIssues(
        result.error.issues
      )}.`
    );
  }

  return result.data;
}
