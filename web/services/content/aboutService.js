import { listPublicRecords, getPublicRecordBySlug } from "@/repositories/publicContentRepository";
import { toAboutContent } from "@/adapters/aboutAdapter";
import { getContentClient, serviceFailure, serviceSuccess } from "./serviceUtils";

export async function getAboutContent({ client } = {}) {
  const contentClient = getContentClient(client);
  const [result, testimonialsResult] = await Promise.all([
    listPublicRecords(contentClient, {
      source: "about_sections",
      order: { column: "sort_order" },
    }),
    getPublicRecordBySlug(contentClient, {
      source: "site_settings",
      slug: "testimonials",
    }).catch(() => ({ success: false, data: null })),
  ]);

  if (!result.success) return serviceFailure(result.error);
  return serviceSuccess(
    toAboutContent(result.data, testimonialsResult?.data?.content || null),
    "About content loaded successfully"
  );
}
