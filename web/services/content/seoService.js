import { listPublicRecords } from "@/repositories/publicContentRepository";
import { toSeoMetadata } from "@/adapters/seoAdapter";
import { getContentClient, serviceFailure, serviceSuccess } from "./serviceUtils";

export async function getSeoMetadata({ client } = {}) {
  const result = await listPublicRecords(getContentClient(client), {
    source: "seo_metadata",
  });
  if (!result.success) return serviceFailure(result.error);
  return serviceSuccess(result.data.map(toSeoMetadata), "SEO metadata loaded successfully");
}

export async function getDefaultSeoMetadata({ client } = {}) {
  const supabase = getContentClient(client);

  const { data: setting, error: settingError } = await supabase
    .from("site_settings")
    .select("id")
    .eq("slug", "default-seo")
    .eq("status", "published")
    .maybeSingle();

  const fallback = {
    title: "Royz House | Building Africa's Next Generation",
    description: "Building Africa's next generation of creatives, leaders & innovators through talent management, media production, and live entertainment.",
    canonicalPath: "/",
    ogTitle: "Royz House | Building Africa's Next Generation",
    ogDescription: "Building Africa's next generation of creatives, leaders & innovators through talent management, media production, and live entertainment.",
    ogImageUrl: "/logo.png",
    noIndex: false,
    noFollow: false,
  };

  if (settingError || !setting) {
    return serviceSuccess(fallback, "Default SEO loaded (fallback)");
  }

  const { data, error } = await supabase
    .from("seo_metadata")
    .select("*")
    .eq("site_settings_id", setting.id)
    .maybeSingle();

  if (error || !data) {
    return serviceSuccess(fallback, "Default SEO loaded (fallback)");
  }

  return serviceSuccess(
    {
      title: data.title || fallback.title,
      description: data.summary || fallback.description,
      canonicalPath: data.canonical_path || fallback.canonicalPath,
      ogTitle: data.og_title || data.title || fallback.ogTitle,
      ogDescription: data.og_description || data.summary || fallback.ogDescription,
      ogImageUrl: data.og_image_url || fallback.ogImageUrl,
      noIndex: Boolean(data.no_index),
      noFollow: Boolean(data.no_follow),
    },
    "Default SEO loaded successfully"
  );
}

