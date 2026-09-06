import { listPublicRecords } from "@/repositories/publicContentRepository";
import { toFeaturedTalent, toTalentCategory, toTalentDirectoryItem, toTrendingTalent } from "@/adapters/talentAdapter";
import { getContentClient, normalizeSearch, serviceFailure, serviceSuccess } from "./serviceUtils";

const TALENT_WITH_CATEGORIES_SELECT = `
  *,
  talent_category_assignments(
    talent_category_id,
    is_primary,
    sort_order,
    talent_categories!inner(id, title, slug)
  )
`;

function publicTalentFilters(featured) {
  const filters = [
    { column: "status", value: "published" },
    { column: "published_at", operator: "not.is", value: null },
    { column: "published_at", operator: "lte", value: new Date().toISOString() },
  ];

  if (featured === true) filters.push({ column: "featured", value: true });
  return filters;
}

export async function listTalents({ page, limit, search, featured, client } = {}) {
  const result = await listPublicRecords(getContentClient(client), {
    source: "talents",
    select: TALENT_WITH_CATEGORIES_SELECT,
    pagination: page && limit ? { page, limit, from: (page - 1) * limit, to: page * limit - 1 } : null,
    order: { column: "sort_order" },
    filters: publicTalentFilters(featured),
    search: { value: normalizeSearch(search), columns: ["title", "summary", "location"] },
  });
  if (!result.success) return serviceFailure(result.error);
  return serviceSuccess(result.data.map(toTalentDirectoryItem), "Talents loaded successfully", result.pagination);
}

export async function getTalentBySlug(slug, { client } = {}) {
  const normalizedSlug = typeof slug === "string" ? slug.trim().toLowerCase() : "";
  if (!normalizedSlug) return serviceFailure({ code: "NOT_FOUND", message: "Talent was not found." });

  const supabase = getContentClient(client);
  const { data, error } = await supabase
    .from("talents")
    .select(TALENT_WITH_CATEGORIES_SELECT)
    .eq("slug", normalizedSlug)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  const result = error
    ? { success: false, error: { code: "CONTENT_QUERY_FAILED", message: "Unable to load talent." } }
    : data
      ? { success: true, data }
      : { success: false, error: { code: "NOT_FOUND", message: "Talent was not found." } };
  if (!result.success) return serviceFailure(result.error);
  return serviceSuccess(toTalentDirectoryItem(result.data), "Talent loaded successfully");
}

export async function getFeaturedTalents(options = {}) {
  const result = await listTalents({ ...options, featured: true });
  if (!result.success) return result;
  return serviceSuccess(result.data.map(toFeaturedTalent), "Featured talents loaded successfully", result.pagination);
}

export async function getTrendingTalents(options = {}) {
  const result = await listTalents(options);
  if (!result.success) return result;
  const trending = result.data.filter((talent) => talent.isHot);
  return serviceSuccess(trending.map(toTrendingTalent), "Trending talents loaded successfully", result.pagination);
}

export async function listTalentCategories({ client } = {}) {
  const result = await listPublicRecords(getContentClient(client), {
    source: "talent_categories",
    order: { column: "sort_order" },
    filters: [
      { column: "status", value: "published" },
      { column: "published_at", operator: "not.is", value: null },
      { column: "published_at", operator: "lte", value: new Date().toISOString() },
    ],
  });
  if (!result.success) return serviceFailure(result.error);
  return serviceSuccess(result.data.map(toTalentCategory), "Categories loaded successfully");
}
