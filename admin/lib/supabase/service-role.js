import { createClient } from "@supabase/supabase-js";
import { validatePublicEnv } from "@/lib/env/client";

function assertServerRuntime() {
  if (typeof window !== "undefined") {
    throw new Error("The admin service-role client may only be created on the server.");
  }
}

function getRequiredServerValue(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required server configuration: ${name}`);
  return value;
}

/**
 * Privileged client for protected server-side authorization and mutations only.
 * Never import this module from pages rendered in the browser, components,
 * hooks, or client-side services.
 */
export function createAdminServiceRoleClient() {
  assertServerRuntime();
  const { NEXT_PUBLIC_SUPABASE_URL } = validatePublicEnv();

  return createClient(NEXT_PUBLIC_SUPABASE_URL, getRequiredServerValue("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
