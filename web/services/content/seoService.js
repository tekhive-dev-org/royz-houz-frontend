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
