import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";

export async function listSelectableMedia({ type, search } = {}) {
  const supabase = createAdminServiceRoleClient();
  let query = supabase
    .from("media_assets")
    .select("id, slug, title, media_source, media_type, secure_url, youtube_thumbnail_url, youtube_embed_url, alt_text, duration_seconds, width, height, format")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .limit(200);

  if (type) query = query.eq("media_type", type);
  if (search) query = query.ilike("title", `%${search}%`);

  const { data, error } = await query;
  if (error) return { success: false, error: { code: "QUERY_FAILED", message: "Unable to load media." } };

  return {
    success: true,
    data: (data || []).map((item) => ({
      id: item.id,
      title: item.title,
      source: item.media_source,
      type: item.media_type,
      imageUrl: item.media_source === "youtube" ? item.youtube_thumbnail_url : item.media_type === "image" ? item.secure_url : null,
      videoUrl: item.media_source === "youtube" ? item.youtube_embed_url : item.media_type === "video" ? item.secure_url : null,
      audioUrl: item.media_type === "audio" ? item.secure_url : null,
      altText: item.alt_text || item.title,
      durationSeconds: item.duration_seconds ?? null,
      width: item.width ?? null,
      height: item.height ?? null,
      format: item.format || null,
    })),
  };
}
