import { getContentClient, serviceFailure, serviceSuccess } from "./serviceUtils";
import { DEFAULT_CONTACT_PAGE_CONTENT } from "@/constants/contactPage";

const CONTACT_PAGE_SLUG = "contact-page";

export async function getContactPageSettings({ client } = {}) {
  try {
    const { data, error } = await getContentClient(client)
      .from("site_settings")
      .select("slug, title, summary, content, status, published_at")
      .eq("slug", CONTACT_PAGE_SLUG)
      .eq("status", "published")
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .maybeSingle();

    if (error) {
      return serviceFailure({
        code: "CONTENT_QUERY_FAILED",
        message: "Unable to load Contact page settings.",
      });
    }

    const mergedContent = Object.keys(DEFAULT_CONTACT_PAGE_CONTENT).reduce((result, section) => {
      const defaultSec = DEFAULT_CONTACT_PAGE_CONTENT[section];
      const dbSec = data?.content?.[section];

      if (Array.isArray(defaultSec)) {
        result[section] = Array.isArray(dbSec) ? dbSec : defaultSec;
      } else if (typeof defaultSec === "object" && defaultSec !== null) {
        result[section] = { ...defaultSec, ...(dbSec || {}) };
      } else {
        result[section] = dbSec ?? defaultSec;
      }
      return result;
    }, {});

    return serviceSuccess(mergedContent, "Contact page settings loaded successfully");
  } catch {
    return serviceFailure({
      code: "CONTENT_SERVICE_UNAVAILABLE",
      message: "Contact page settings are currently unavailable.",
    });
  }
}
