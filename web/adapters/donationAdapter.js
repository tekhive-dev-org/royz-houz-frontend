import { getBody } from "./contentAdapter.js";

export function toDonationCampaign(row) {
  const body = getBody(row) || {};
  return {
    ...body,
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary || "",
    description: row.summary || body.description || "",
    targetAmount: Number(body.targetAmount || row.target_amount || 0),
    raisedAmount: Number(row.raised_amount || row.raisedAmount || 0),
    currency: body.currency || "NGN",
    featured: Boolean(row.featured),
    sortOrder: row.sort_order ?? 0,
  };
}
