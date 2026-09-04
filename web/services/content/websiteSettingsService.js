import { listPublicRecords } from "@/repositories/publicContentRepository";
import { toSiteSetting } from "@/adapters/contentAdapter";
import { getContentClient, serviceFailure, serviceSuccess } from "./serviceUtils";

export async function getWebsiteSettings({ client } = {}) {
  const result = await listPublicRecords(getContentClient(client), {
    source: "public_site_settings",
    order: { column: "sort_order" },
  });
  if (!result.success) return serviceFailure(result.error);

  return serviceSuccess(result.data.map(toSiteSetting), "Website settings loaded successfully");
}
