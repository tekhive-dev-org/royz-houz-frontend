import { getPublicRecordBySlug, listPublicRecords } from "@/repositories/publicContentRepository";
import { toBlogArticle, toBlogCategory } from "@/adapters/blogAdapter";
import { getContentClient, normalizeSearch, serviceFailure, serviceSuccess } from "./serviceUtils";

function publishedFilters(filters = []) {
  return [
    ...filters,
    { column: "status", value: "published" },
    { column: "published_at", operator: "not.is", value: null },
    { column: "published_at", operator: "lte", value: new Date().toISOString() },
  ];
}

export async function listBlogPosts({ page, limit, search, featured, client } = {}) {
  const supabase = getContentClient(client);
  const result = await listPublicRecords(supabase, {
    source: "blog_posts",
    pagination: page && limit ? { page, limit, from: (page - 1) * limit, to: page * limit - 1 } : null,
    order: { column: "published_at", ascending: false },
    filters: publishedFilters(featured === true ? [{ column: "featured", value: true }] : []),
    search: { value: normalizeSearch(search), columns: ["title", "summary"] },
  });
  if (!result.success) return serviceFailure(result.error);

  const authorIds = Array.from(
    new Set((result.data || []).map((row) => row.blog_author_id).filter(Boolean))
  );
  const authorMap = new Map();
  if (authorIds.length > 0) {
    const { data: authors } = await supabase
      .from("blog_authors")
      .select("*")
      .in("id", authorIds);
    (authors || []).forEach((author) => {
      authorMap.set(author.id, author);
    });
  }

  return serviceSuccess(
    result.data.map((row) => toBlogArticle(row, authorMap.get(row.blog_author_id) || null)),
    "Blog posts loaded successfully",
    result.pagination
  );
}

export async function listBlogCategories({ client } = {}) {
  const result = await listPublicRecords(getContentClient(client), {
    source: "blog_categories",
    order: { column: "sort_order" },
    filters: publishedFilters(),
  });
  if (!result.success) return serviceFailure(result.error);
  return serviceSuccess(result.data.map(toBlogCategory), "Blog categories loaded successfully");
}

export async function getBlogPostBySlug(slug, { client } = {}) {
  const supabase = getContentClient(client);
  const result = await getPublicRecordBySlug(supabase, {
    source: "blog_posts",
    slug,
    select: "*",
  });
  if (
    result.success &&
    (result.data.status !== "published" ||
      !result.data.published_at ||
      new Date(result.data.published_at) > new Date())
  ) {
    return serviceFailure({ code: "NOT_FOUND", message: "Content was not found." });
  }
  if (!result.success) return serviceFailure(result.error);

  let authorRecord = null;
  if (result.data.blog_author_id) {
    const { data: authorData } = await supabase
      .from("blog_authors")
      .select("*")
      .eq("id", result.data.blog_author_id)
      .maybeSingle();
    authorRecord = authorData || null;
  }

  return serviceSuccess(toBlogArticle(result.data, authorRecord), "Blog post loaded successfully");
}
