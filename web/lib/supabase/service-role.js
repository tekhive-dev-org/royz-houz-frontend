import { createClient } from "@supabase/supabase-js";

function assertServerRuntime() {
  if (typeof window !== "undefined") {
    throw new Error("The service-role Supabase client may only be created on the server.");
  }
}

function getRequiredServerValue(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required server configuration: ${name}`);
  }
  return value;
}

/**
 * Privileged Supabase client for protected server-side operations only.
 *
 * Never import this module from pages, components, hooks, or any code included
 * in a browser bundle. The service role bypasses RLS and must only be used by
 * authorized server/API code.
 */
export function createSupabaseServiceRoleClient() {
  assertServerRuntime();

  return createClient(
    getRequiredServerValue("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredServerValue("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
