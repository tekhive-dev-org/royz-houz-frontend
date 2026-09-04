import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { writeSuccessfulAdminMutationAudit } from "./adminAuthorizationService";
import { sanitizeArticleContent } from "@/utils/contentSanitizer";

export function serviceSuccess(data, message = "Request completed") {
  return { success: true, data, message };
}

export function serviceFailure(code, message) {
  return { success: false, error: { code, message } };
}

function getClient(client) {
  return client || createAdminServiceRoleClient();
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

async function uniqueSlug(supabase, title, excludeId) {
  const base = slugify(title) || "post";
  let candidate = base;
  let suffix = 2;
  while (true) {
    let query = supabase.from("blog_posts").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

function buildLifecycle(status, scheduledAt) {
  const now = new Date().toISOString();
  if (status === "published") return { status, published_at: now, scheduled_at: null };
  if (status === "scheduled") return { status, scheduled_at: scheduledAt || null };
  if (status === "archived") return { status };
  return { status: "draft", published_at: null, scheduled_at: null };
}

export async function listBlogPosts(client, { search, category, status, featured } = {}) {
  const supabase = getClient(client);
  let query = supabase.from("blog_posts").select("*");

  if (search) query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
  if (status) query = query.eq("status", status);
  if (featured === "true") query = query.eq("featured", true);
  else if (featured === "false") query = query.eq("featured", false);

  if (category) {
    const { data: assigned } = await supabase.from("blog_post_categories").select("blog_post_id").eq("blog_category_id", category);
    const ids = (assigned || []).map((row) => row.blog_post_id);
    if (ids.length) query = query.in("id", ids);
  }

  query = query.order("published_at", { ascending: false, nullsFirst: false }).order("title", { ascending: true }).limit(500);

  const { data, error } = await query;
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load posts.");
  if (!data || data.length === 0) return serviceSuccess([]);

  const postIds = data.map((p) => p.id);
  const { data: assignments } = await supabase
    .from("blog_post_categories")
    .select("blog_post_id, blog_category_id, is_primary")
    .in("blog_post_id", postIds);

  const categoryMap = {};
  const primaryMap = {};
  (assignments || []).forEach((row) => {
    if (!categoryMap[row.blog_post_id]) categoryMap[row.blog_post_id] = [];
    categoryMap[row.blog_post_id].push(row.blog_category_id);
    if (row.is_primary) primaryMap[row.blog_post_id] = row.blog_category_id;
  });

  const enriched = data.map((p) => ({
    ...p,
    categoryIds: categoryMap[p.id] || [],
    primaryCategoryId: primaryMap[p.id] || (categoryMap[p.id]?.[0] ?? null),
  }));

  return serviceSuccess(enriched);
}

export async function getBlogPost(client, id) {
  const supabase = getClient(client);
  const [{ data, error }, { data: assignments }] = await Promise.all([
    supabase.from("blog_posts").select("*").eq("id", id).maybeSingle(),
    supabase.from("blog_post_categories").select("blog_category_id, is_primary").eq("blog_post_id", id),
  ]);
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load the post.");
  if (!data) return serviceFailure("NOT_FOUND", "Post was not found.");

  const primary = (assignments || []).find((row) => row.is_primary);
  return serviceSuccess({
    ...data,
    body: data.body || {},
    categoryIds: (assignments || []).map((row) => row.blog_category_id),
    primaryCategoryId: primary?.blog_category_id || null,
  });
}

export async function listBlogAuthors(client) {
  const supabase = getClient(client);
  const { data, error } = await supabase.from("blog_authors").select("*").order("title", { ascending: true });
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load authors.");
  return serviceSuccess(data || []);
}

export async function listBlogCategories(client) {
  const supabase = getClient(client);
  const { data, error } = await supabase.from("blog_categories").select("*").order("sort_order", { ascending: true });
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load categories.");
  return serviceSuccess(data || []);
}

export async function saveBlogPost(client, { actorUserId, post }) {
  const supabase = getClient(client);
  const rawSlug = typeof post.slug === "string" && post.slug.trim() ? post.slug.trim() : "";
  const slugCandidate = rawSlug || post.title || "post";
  const slug = await uniqueSlug(supabase, slugCandidate, post.id);

  const {
    id,
    categoryIds,
    primaryCategoryId,
    relatedPostIds,
    seo,
    status,
    scheduledAt,
    content,
    ...bodyFields
  } = post;

  const body = {
    badge: bodyFields.badge,
    format: bodyFields.format,
    readTime: bodyFields.readTime,
    displayDate: bodyFields.displayDate,
    image: bodyFields.image,
    excerpt: bodyFields.excerpt,
    author: typeof bodyFields.author === "string" && bodyFields.author.trim() ? bodyFields.author.trim() : null,
    content: sanitizeArticleContent(content || []),
    relatedPostIds: relatedPostIds || [],
  };

  const payload = {
    slug,
    title: post.title,
    summary: post.summary || post.excerpt || null,
    blog_author_id: post.authorId || null,
    body,
    featured: post.featured,
    ...buildLifecycle(status, scheduledAt),
  };

  const result = id
    ? await supabase.from("blog_posts").update(payload).eq("id", id).select().single()
    : await supabase.from("blog_posts").insert(payload).select().single();

  if (result.error) return serviceFailure("PERSIST_FAILED", "Unable to save the post.");

  const postId = result.data.id;
  await replaceCategoryAssignments(supabase, postId, categoryIds || [], primaryCategoryId || null, actorUserId);
  await upsertSeo(supabase, postId, seo, actorUserId);
  await recordRevision(supabase, { table: "blog_posts", contentId: postId, actorUserId, snapshot: payload, action: id ? "updated" : "created" });

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: id ? "blog_posts.update" : "blog_posts.create", entityType: "blog_posts", entityId: postId, newValues: { status } },
    { client: supabase }
  );

  return serviceSuccess({ ...result.data, categoryIds, primaryCategoryId });
}

async function replaceCategoryAssignments(supabase, postId, categoryIds, primaryCategoryId, actorUserId) {
  await supabase.from("blog_post_categories").delete().eq("blog_post_id", postId);
  const rows = categoryIds.map((categoryId) => ({
    blog_post_id: postId,
    blog_category_id: categoryId,
    is_primary: categoryId === primaryCategoryId,
    created_by: actorUserId,
  }));
  if (rows.length) await supabase.from("blog_post_categories").insert(rows);
}

async function upsertSeo(supabase, postId, seo, actorUserId) {
  if (!seo) return;
  const existing = await supabase.from("seo_metadata").select("id").eq("blog_post_id", postId).maybeSingle();
  const row = {
    blog_post_id: postId,
    title: seo.title || null,
    summary: seo.description || null,
    og_title: seo.ogTitle || null,
    og_description: seo.ogDescription || null,
    og_image_url: seo.ogImageUrl || null,
    no_index: Boolean(seo.noIndex),
    created_by: actorUserId,
    updated_by: actorUserId,
  };
  if (existing.data) await supabase.from("seo_metadata").update(row).eq("id", existing.data.id);
  else await supabase.from("seo_metadata").insert(row);
}

async function recordRevision(supabase, { table, contentId, actorUserId, snapshot, action }) {
  const { data: latest } = await supabase
    .from("content_revisions")
    .select("revision_number")
    .eq("content_type", table)
    .eq("content_id", contentId)
    .order("revision_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextNumber = (latest?.revision_number || 0) + 1;
  await supabase.from("content_revisions").insert({
    content_type: table,
    content_id: contentId,
    revision_number: nextNumber,
    action,
    snapshot,
    created_by: actorUserId,
  });
}

export async function archiveBlogPost(client, { actorUserId, id }) {
  const supabase = getClient(client);
  const { error } = await supabase.from("blog_posts").update({ status: "archived" }).eq("id", id);
  if (error) return serviceFailure("ARCHIVE_FAILED", "Unable to archive the post.");
  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "blog_posts.archive", entityType: "blog_posts", entityId: id, newValues: { status: "archived" } },
    { client: supabase }
  );
  return serviceSuccess({ id, status: "archived" });
}

export async function listPostRevisions(client, id) {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from("content_revisions")
    .select("*")
    .eq("content_type", "blog_posts")
    .eq("content_id", id)
    .order("revision_number", { ascending: false });
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load revisions.");
  return serviceSuccess(data || []);
}

export async function saveBlogAuthor(client, { actorUserId, author }) {
  const supabase = getClient(client);
  const body = { bio: author.bio, avatar: author.avatar };
  const payload = {
    slug: author.slug || slugify(author.name),
    title: author.name,
    summary: author.bio || null,
    body,
    status: author.status,
    published_at: author.status === "published" ? new Date().toISOString() : null,
  };
  const result = author.id
    ? await supabase.from("blog_authors").update(payload).eq("id", author.id).select().single()
    : await supabase.from("blog_authors").insert(payload).select().single();
  if (result.error) return serviceFailure("PERSIST_FAILED", "Unable to save the author.");
  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: author.id ? "blog_authors.update" : "blog_authors.create", entityType: "blog_authors", entityId: result.data.id },
    { client: supabase }
  );
  return serviceSuccess(result.data);
}

export async function saveBlogCategory(client, { actorUserId, category }) {
  const supabase = getClient(client);
  const payload = {
    slug: category.slug || slugify(category.title),
    title: category.title,
    summary: category.summary || null,
    status: category.status,
    published_at: category.status === "published" ? new Date().toISOString() : null,
  };
  const result = category.id
    ? await supabase.from("blog_categories").update(payload).eq("id", category.id).select().single()
    : await supabase.from("blog_categories").insert(payload).select().single();
  if (result.error) return serviceFailure("PERSIST_FAILED", "Unable to save the category.");
  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: category.id ? "blog_categories.update" : "blog_categories.create", entityType: "blog_categories", entityId: result.data.id },
    { client: supabase }
  );
  return serviceSuccess(result.data);
}

export async function deleteBlogCategory(client, { actorUserId, id }) {
  const supabase = getClient(client);

  const { count, error: countError } = await supabase
    .from("blog_post_categories")
    .select("blog_post_id", { count: "exact", head: true })
    .eq("blog_category_id", id);

  if (countError) return serviceFailure("QUERY_FAILED", "Unable to verify category usage.");
  if (count && count > 0) {
    return serviceFailure("CATEGORY_IN_USE", `Cannot delete category: it is assigned to ${count} post(s).`);
  }

  const { error } = await supabase.from("blog_categories").delete().eq("id", id);
  if (error) return serviceFailure("DELETE_FAILED", "Unable to delete category.");

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "blog_categories.delete", entityType: "blog_categories", entityId: id },
    { client: supabase }
  );
  return serviceSuccess({ id });
}

export async function reorderBlogCategories(client, { actorUserId, ids }) {
  const supabase = getClient(client);
  const updates = ids.map((id, index) =>
    supabase.from("blog_categories").update({ sort_order: (index + 1) * 10 }).eq("id", id)
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed) return serviceFailure("REORDER_FAILED", "Unable to update category ordering.");

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "blog_categories.reorder", entityType: "blog_categories", entityId: "all", newValues: { ids } },
    { client: supabase }
  );
  return serviceSuccess({ ids });
}

export async function deleteBlogAuthor(client, { actorUserId, id }) {
  const supabase = getClient(client);

  const { count, error: countError } = await supabase
    .from("blog_posts")
    .select("id", { count: "exact", head: true })
    .eq("blog_author_id", id);

  if (countError) return serviceFailure("QUERY_FAILED", "Unable to verify author usage.");
  if (count && count > 0) {
    return serviceFailure("AUTHOR_IN_USE", `Cannot delete author: assigned to ${count} article(s). Reassign articles first.`);
  }

  const { error } = await supabase.from("blog_authors").delete().eq("id", id);
  if (error) return serviceFailure("DELETE_FAILED", "Unable to delete author.");

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "blog_authors.delete", entityType: "blog_authors", entityId: id },
    { client: supabase }
  );
  return serviceSuccess({ id });
}

export async function reorderFeaturedBlogPosts(client, { actorUserId, ids }) {
  const supabase = getClient(client);
  const updates = ids.map((id, index) =>
    supabase.from("blog_posts").update({ sort_order: (index + 1) * 10, featured: true }).eq("id", id)
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed) return serviceFailure("REORDER_FAILED", "Unable to update featured order.");

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "blog_posts.reorder_featured", entityType: "blog_posts", entityId: "featured", newValues: { ids } },
    { client: supabase }
  );
  return serviceSuccess({ ids });
}

export async function deleteBlogComment(client, { actorUserId, id }) {
  const supabase = getClient(client);
  const { error } = await supabase.from("blog_comments").delete().eq("id", id);
  if (error) return serviceFailure("DELETE_FAILED", "Unable to delete comment.");

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "blog_comments.delete", entityType: "blog_comments", entityId: id },
    { client: supabase }
  );
  return serviceSuccess({ id });
}

/** Mirrors the public blog adapter shape for the admin preview. */
export function buildBlogPostPreview(post) {
  const body = post.body || {};
  return {
    ...body,
    id: body.id || post.id,
    slug: post.slug,
    title: post.title,
    badge: body.badge || "",
    format: body.format || "",
    readTime: body.readTime || "",
    date: body.displayDate || post.published_at || "",
    author: body.author || "",
    image: body.image || "",
    excerpt: post.summary || "",
    content: body.content || [],
  };
}
