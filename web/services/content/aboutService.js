import { listPublicRecords } from "@/repositories/publicContentRepository";
import { toAboutContent } from "@/adapters/aboutAdapter";
import { getContentClient, serviceFailure, serviceSuccess } from "./serviceUtils";

export async function getAboutContent({ client } = {}) {
  const result = await listPublicRecords(getContentClient(client), {
    source: "about_sections",
    order: { column: "sort_order" },
  });
  if (!result.success) return serviceFailure(result.error);
  return serviceSuccess(toAboutContent(result.data), "About content loaded successfully");
}
