import { createBrowserClient } from "@supabase/ssr";
import { validatePublicEnv } from "@/lib/env/client";

let browserClient;

/** Browser-safe authenticated client. It uses only the public URL and anon key. */
export function getAdminBrowserClient() {
  if (!browserClient) {
    const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = validatePublicEnv();
    browserClient = createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }

  return browserClient;
}
