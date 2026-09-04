import { getContentClient, serviceFailure, serviceSuccess } from "./serviceUtils";

const MEDIA_PAGE_SLUG = "media-page";

export async function getMediaPageSettings({ client } = {}) {
  try {
    const { data, error } = await getContentClient(client)
      .from("site_settings")
      .select("slug, title, summary, content, status, published_at")
      .eq("slug", MEDIA_PAGE_SLUG)
      .eq("status", "published")
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    if (error) return serviceFailure({ code: "CONTENT_QUERY_FAILED", message: "Unable to load Media page settings." });
    return serviceSuccess(data?.content || {}, "Media page settings loaded successfully");
  } catch {
    return serviceFailure({ code: "CONTENT_SERVICE_UNAVAILABLE", message: "Media page settings are currently unavailable." });
  }
}
