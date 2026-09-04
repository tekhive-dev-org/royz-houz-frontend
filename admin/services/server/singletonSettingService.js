import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Reads a singleton site setting by slug, returning its `content` JSON and
 * lifecycle metadata.
 */
export async function readSingletonSetting(slug) {
  const supabase = createAdminServiceRoleClient();
  const { data, error } = await supabase.from("site_settings").select("*").eq("slug", slug).maybeSingle();
  if (error) return { success: false, error: { code: "QUERY_FAILED", message: "Unable to load the record." } };
  if (!data) return { success: true, data: null };
  return { success: true, data };
}

/**
 * Upserts a singleton site setting by slug. The `status` controls draft vs
 * publish lifecycle; published records receive a publication timestamp.
 */
export async function upsertSingletonSetting(slug, title, content, status) {
  const supabase = createAdminServiceRoleClient();
  const payload = {
    slug,
    title,
    content,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
    scheduled_at: null,
  };
  const { data, error } = await supabase
    .from("site_settings")
    .upsert(payload, { onConflict: "slug" })
    .select()
    .single();
  if (error) return { success: false, error: { code: "PERSIST_FAILED", message: "Unable to save the record." } };
  return { success: true, data };
}
