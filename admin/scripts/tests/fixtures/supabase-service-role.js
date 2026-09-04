import { createMockSupabase, getScenario } from "./supabase-state.js";

/**
 * Test fixture standing in for admin/lib/supabase/service-role.js. It never
 * reads real credentials; the scenario controls the mocked responses.
 */
export function createAdminServiceRoleClient() {
  return createMockSupabase(getScenario());
}
