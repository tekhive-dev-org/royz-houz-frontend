import { createBrowserClient } from "@supabase/ssr";
import { validatePublicEnv } from "@/lib/env/client";

let browserClient;

/**
 * Browser-safe Supabase client.
 *
 * This module validates and uses only NEXT_PUBLIC_* values. It never imports
 * service-role/server configuration, so privileged variables cannot enter the
 * browser bundle through this client.
 */
export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = validatePublicEnv();
    browserClient = createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }

  return browserClient;
}
