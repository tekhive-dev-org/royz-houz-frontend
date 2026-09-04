import { z } from "zod";

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

function formatPublicEnvironmentIssues(issues) {
  return issues.map((issue) => issue.path.join(".")).join(", ");
}

function getPublicEnvironment() {
  return {
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  };
}

/**
 * Validates only browser-safe environment variables.
 *
 * This module deliberately never reads server-only values, so importing it
 * from browser code cannot fail because a privileged variable is unavailable.
 * Call it from browser code only when the corresponding public integration is
 * being used.
 */
export function validatePublicEnv(environment = getPublicEnvironment()) {
  const result = publicEnvironmentSchema.safeParse(environment);

  if (!result.success) {
    throw new Error(
      `Invalid public environment configuration. Set valid values for: ${formatPublicEnvironmentIssues(
        result.error.issues
      )}.`
    );
  }

  return result.data;
}
