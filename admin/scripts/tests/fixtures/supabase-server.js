import { createMockSupabase, getScenario } from "./supabase-state.js";

/**
 * Test fixture standing in for admin/lib/supabase/server.js. The real module
 * is only loaded inside server routes; these exports keep the authorization
 * tests network-free while preserving the production import contract.
 */
export function createAdminServerClient() {
  return createMockSupabase(getScenario());
}

export function createAdminTokenClient() {
  return createMockSupabase(getScenario());
}
