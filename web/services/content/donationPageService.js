import { getContentClient, serviceFailure, serviceSuccess } from "./serviceUtils";
import { DEFAULT_DONATION_PAGE_CONTENT } from "@/constants/donationPage";

const DONATION_PAGE_SLUG = "donation-page";

export async function getDonationPageSettings({ client } = {}) {
  try {
    const { data, error } = await getContentClient(client)
      .from("site_settings")
      .select("slug, title, summary, content, status, published_at")
      .eq("slug", DONATION_PAGE_SLUG)
      .eq("status", "published")
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .maybeSingle();

    if (error) {
      return serviceFailure({ code: "CONTENT_QUERY_FAILED", message: "Unable to load Donation page settings." });
    }

    const mergedContent = Object.keys(DEFAULT_DONATION_PAGE_CONTENT).reduce((result, section) => ({
      ...result,
      [section]:
        typeof DEFAULT_DONATION_PAGE_CONTENT[section] === "object" &&
        !Array.isArray(DEFAULT_DONATION_PAGE_CONTENT[section])
          ? { ...DEFAULT_DONATION_PAGE_CONTENT[section], ...(data?.content?.[section] || {}) }
          : data?.content?.[section] ?? DEFAULT_DONATION_PAGE_CONTENT[section],
    }), {});

    return serviceSuccess(mergedContent, "Donation page settings loaded successfully");
  } catch {
    return serviceFailure({ code: "CONTENT_SERVICE_UNAVAILABLE", message: "Donation page settings are currently unavailable." });
  }
}
