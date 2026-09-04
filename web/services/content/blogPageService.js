import { getContentClient, serviceFailure, serviceSuccess } from "./serviceUtils";
import { DEFAULT_BLOG_PAGE_CONTENT } from "@/constants/blogPage";

const BLOG_PAGE_SLUG = "blog-page";

export async function getBlogPageSettings({ client } = {}) {
  try {
    const { data, error } = await getContentClient(client)
      .from("site_settings")
      .select("slug, title, summary, content, status, published_at")
      .eq("slug", BLOG_PAGE_SLUG)
      .eq("status", "published")
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .maybeSingle();

    if (error) {
      return serviceFailure({ code: "CONTENT_QUERY_FAILED", message: "Unable to load Blog page settings." });
    }

    const mergedContent = Object.keys(DEFAULT_BLOG_PAGE_CONTENT).reduce((result, section) => ({
      ...result,
      [section]: typeof DEFAULT_BLOG_PAGE_CONTENT[section] === "object" && !Array.isArray(DEFAULT_BLOG_PAGE_CONTENT[section])
        ? { ...DEFAULT_BLOG_PAGE_CONTENT[section], ...(data?.content?.[section] || {}) }
        : data?.content?.[section] ?? DEFAULT_BLOG_PAGE_CONTENT[section],
    }), {});

    return serviceSuccess(mergedContent, "Blog page settings loaded successfully");
  } catch {
    return serviceFailure({ code: "CONTENT_SERVICE_UNAVAILABLE", message: "Blog page settings are currently unavailable." });
  }
}
