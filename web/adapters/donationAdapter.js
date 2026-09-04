import { getBody } from "./contentAdapter.js";

export function toDonationCampaign(row) {
  return {
    ...getBody(row),
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.summary || "",
    featured: row.featured,
    sortOrder: row.sort_order,
  };
}
