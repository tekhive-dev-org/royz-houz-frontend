import { z } from "zod";

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_ADMIN_URL: z.string().url(),
  NEXT_PUBLIC_WEB_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

function getPublicEnvironment() {
  // Next.js replaces direct NEXT_PUBLIC_* references at build time. Reading
  // them through an indirect process.env object leaves them undefined in the
  // browser bundle and prevents the Supabase client from being created.
  return {
    NEXT_PUBLIC_ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL,
    NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

function formatPublicEnvironmentIssues(issues) {
  return issues.map((issue) => issue.path.join(".")).join(", ");
}

/**
 * Validates only browser-safe environment variables.
 *
 * This module does not read server-only variables. Browser bundles can use it
 * without evaluating privileged configuration that is intentionally absent.
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
