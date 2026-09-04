import { createClient } from "@supabase/supabase-js";
import { validatePublicEnv } from "@/lib/env/client";

function assertServerRuntime() {
  if (typeof window !== "undefined") {
    throw new Error("The server Supabase client may only be created on the server.");
  }
}

/**
 * Server-side anonymous-key Supabase client.
 *
 * Use this client in API routes and server data functions for public reads and
 * RLS-protected RPCs. It is not a privileged client and respects RLS.
 */
export function createSupabaseServerClient() {
  assertServerRuntime();
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = validatePublicEnv();

  return createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
