import { randomUUID } from "node:crypto";
import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { writeSuccessfulAdminMutationAudit } from "./adminAuthorizationService";
import { reorderRows } from "./contentService";

export function serviceSuccess(data, message = "Request completed") {
  return { success: true, data, message };
}

export function serviceFailure(code, message) {
  return { success: false, error: { code, message } };
}

function getClient(client) {
  return client || createAdminServiceRoleClient();
}

export function normalizeTalentSlug(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

async function findTalentBySlug(supabase, slug, excludeId) {
  let query = supabase.from("talents").select("id").eq("slug", slug);
  if (excludeId) query = query.neq("id", excludeId);
  return query.maybeSingle();
}

async function uniqueSlug(supabase, name, excludeId) {
  const base = normalizeTalentSlug(name) || "talent";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const { data, error } = await findTalentBySlug(supabase, candidate, excludeId);
    if (error) return serviceFailure("SLUG_CHECK_FAILED", "Unable to verify the talent URL slug.");
    if (!data) return serviceSuccess(candidate);
    const suffixText = `-${suffix}`;
    candidate = `${base.slice(0, 160 - suffixText.length)}${suffixText}`;
    suffix += 1;
  }
}

async function resolveTalentSlug(supabase, talent, excludeId, existingTalent) {
  if (!talent.slug && excludeId) {
    if (!existingTalent?.slug) return serviceFailure("NOT_FOUND", "Talent was not found.");
    return serviceSuccess(existingTalent.slug);
  }
  if (!talent.slug) return uniqueSlug(supabase, talent.name, excludeId);

  const slug = normalizeTalentSlug(talent.slug);
  const { data, error } = await findTalentBySlug(supabase, slug, excludeId);
  if (error) return serviceFailure("SLUG_CHECK_FAILED", "Unable to verify the talent URL slug.");
  if (data) {
    if (!excludeId) {
      return uniqueSlug(supabase, slug, excludeId);
    }
    return serviceFailure("SLUG_CONFLICT", "A talent with this URL slug already exists.");
  }
  return serviceSuccess(slug);
}

export function normalizeTalentVideos(videos, existingVideos = []) {
  const usedSlugs = new Set();
  const existingSlugById = new Map(
    (Array.isArray(existingVideos) ? existingVideos : [])
      .filter((video) => video?.id && video?.slug)
      .map((video) => [String(video.id), normalizeTalentSlug(video.slug)])
  );

  return (Array.isArray(videos) ? videos : []).map((video, index) => {
    const id = String(video?.id || randomUUID());
    const baseSlug =
      existingSlugById.get(id) ||
      normalizeTalentSlug(video?.title) ||
      normalizeTalentSlug(id) ||
      `video-${index + 1}`;
    let slug = baseSlug;
    let suffix = 2;

    while (usedSlugs.has(slug)) {
      const suffixText = `-${suffix}`;
      slug = `${baseSlug.slice(0, 160 - suffixText.length)}${suffixText}`;
      suffix += 1;
    }
    usedSlugs.add(slug);

    return { ...video, id, slug };
  });
}

export function normalizeTalentMusicTracks(musicTracks, existingMusicTracks = []) {
  const usedSlugs = new Set();
  const existingSlugById = new Map(
    (Array.isArray(existingMusicTracks) ? existingMusicTracks : [])
      .filter((track) => track?.id && track?.slug)
      .map((track) => [String(track.id), normalizeTalentSlug(track.slug)])
  );

  return (Array.isArray(musicTracks) ? musicTracks : []).map((track, index) => {
    const id = String(track?.id || randomUUID());
    const baseSlug =
      existingSlugById.get(id) ||
      normalizeTalentSlug(track?.title) ||
      normalizeTalentSlug(id) ||
      `track-${index + 1}`;
    let slug = baseSlug;
    let suffix = 2;

    while (usedSlugs.has(slug)) {
      const suffixText = `-${suffix}`;
      slug = `${baseSlug.slice(0, 160 - suffixText.length)}${suffixText}`;
      suffix += 1;
    }
    usedSlugs.add(slug);

    return { ...track, id, slug };
  });
}

function splitTalent(input, persistedId) {
  const {
    id,
    slug,
    name,
    categoryIds,
    primaryCategoryId,
    status,
    scheduledAt,
    featured,
    sortOrder,
    ...body
  } = input;

  return {
    id,
    slug,
    body: {
      ...body,
      name,
      id: persistedId,
    },
    status,
    scheduledAt,
    featured,
    sortOrder,
    categoryIds: categoryIds || [],
    primaryCategoryId: primaryCategoryId || null,
  };
}

export async function listTalents(client, { search, category, status, featured } = {}) {
  const supabase = getClient(client);
  let query = supabase.from("talents").select("*");

  if (search) query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,location.ilike.%${search}%`);
  if (status) query = query.eq("status", status);
  if (featured === "true") query = query.eq("featured", true);
  else if (featured === "false") query = query.eq("featured", false);

  if (category) {
    const { data: assigned, error: assignmentFilterError } = await supabase
      .from("talent_category_assignments")
      .select("talent_id")
      .eq("talent_category_id", category);
    if (assignmentFilterError) return serviceFailure("QUERY_FAILED", "Unable to filter talents by category.");
    const ids = (assigned || []).map((row) => row.talent_id);
    if (ids.length === 0) return serviceSuccess([]);
    query = query.in("id", ids);
  }

  query = query.order("sort_order", { ascending: true }).order("title", { ascending: true }).limit(500);

  const { data, error } = await query;
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load talents.");
  if (!data || data.length === 0) return serviceSuccess([]);

  const talentIds = data.map((t) => t.id);
  const { data: assignments, error: assignmentError } = await supabase
    .from("talent_category_assignments")
    .select("talent_id, talent_category_id, is_primary")
    .in("talent_id", talentIds);
  if (assignmentError) return serviceFailure("QUERY_FAILED", "Unable to load talent category assignments.");

  const categoryMap = {};
  const primaryMap = {};
  (assignments || []).forEach((row) => {
    if (!categoryMap[row.talent_id]) categoryMap[row.talent_id] = [];
    categoryMap[row.talent_id].push(row.talent_category_id);
    if (row.is_primary) primaryMap[row.talent_id] = row.talent_category_id;
  });

  const enriched = data.map((t) => ({
    ...t,
    categoryIds: categoryMap[t.id] || [],
    primaryCategoryId: primaryMap[t.id] || (categoryMap[t.id]?.[0] ?? null),
  }));

  return serviceSuccess(enriched);
}

export async function getTalent(client, id) {
  const supabase = getClient(client);
  const [{ data, error }, { data: assignments, error: assignmentError }] = await Promise.all([
    supabase.from("talents").select("*").eq("id", id).maybeSingle(),
    supabase.from("talent_category_assignments").select("talent_category_id, is_primary").eq("talent_id", id),
  ]);

  if (error || assignmentError) return serviceFailure("QUERY_FAILED", "Unable to load the talent.");
  if (!data) return serviceFailure("NOT_FOUND", "Talent was not found.");

  const primary = (assignments || []).find((row) => row.is_primary);
  return serviceSuccess({
    ...data,
    body: data.body || {},
    categoryIds: (assignments || []).map((row) => row.talent_category_id),
    primaryCategoryId: primary?.talent_category_id || null,
  });
}

export async function listTalentCategories(client) {
  const supabase = getClient(client);
  const { data, error } = await supabase.from("talent_categories").select("*").order("sort_order", { ascending: true });
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load categories.");
  return serviceSuccess(data || []);
}

export async function saveTalent(client, { actorUserId, talent }) {
  const supabase = getClient(client);
  const persistedId = talent.id || randomUUID();
  const split = splitTalent(talent, persistedId);
  let existingTalent = null;

  if (split.id) {
    const existingResult = await supabase.from("talents").select("slug, body").eq("id", split.id).maybeSingle();
    if (existingResult.error) return serviceFailure("QUERY_FAILED", "Unable to load the existing talent.");
    if (!existingResult.data) return serviceFailure("NOT_FOUND", "Talent was not found.");
    existingTalent = existingResult.data;
  }

  if (!split.primaryCategoryId || !split.categoryIds.includes(split.primaryCategoryId)) {
    return serviceFailure("CATEGORY_REQUIRED", "Select a valid primary specialty/category.");
  }
  if (split.status === "scheduled" && !split.scheduledAt) {
    return serviceFailure("SCHEDULE_REQUIRED", "Choose a scheduled publication date and time.");
  }

  const uniqueCategoryIds = [...new Set(split.categoryIds)];
  const { data: validCategories, error: categoryError } = await supabase
    .from("talent_categories")
    .select("id, status, title, slug")
    .in("id", uniqueCategoryIds);
  if (categoryError) return serviceFailure("CATEGORY_VALIDATION_FAILED", "Unable to validate the selected category.");
  if ((validCategories || []).length !== uniqueCategoryIds.length || validCategories.some((category) => category.status === "archived")) {
    return serviceFailure("CATEGORY_INVALID", "One or more selected categories are unavailable or archived.");
  }

  const primaryCategory = validCategories.find((category) => category.id === split.primaryCategoryId);
  if (!primaryCategory) return serviceFailure("CATEGORY_INVALID", "The selected primary category is unavailable.");

  split.body.category = primaryCategory.title;
  split.body.categoryKey = primaryCategory.slug;
  split.body.bookingPrice = talent.bookingPrice || talent.startingRate || "";
  split.body.videos = normalizeTalentVideos(split.body.videos, existingTalent?.body?.videos);
  split.body.musicTracks = normalizeTalentMusicTracks(split.body.musicTracks, existingTalent?.body?.musicTracks);
  delete split.body.startingRate;

  const slugResult = await resolveTalentSlug(supabase, talent, split.id, existingTalent);
  if (!slugResult.success) return slugResult;

  const slug = slugResult.data;
  const status = split.status;
  const now = new Date().toISOString();
  const lifecycle =
    status === "published"
      ? { status, published_at: now, scheduled_at: null }
      : status === "scheduled"
      ? { status, published_at: null, scheduled_at: split.scheduledAt }
      : status === "archived"
      ? { status, published_at: null, scheduled_at: null }
      : { status: "draft", published_at: null, scheduled_at: null };

  const payload = {
    ...(split.id ? {} : { id: persistedId }),
    slug,
    title: talent.name,
    summary: talent.subtitle || talent.bio || null,
    body: split.body,
    location: talent.location || null,
    featured: split.featured,
    sort_order: split.sortOrder ?? 0,
    ...lifecycle,
    updated_by: actorUserId,
    ...(split.id ? {} : { created_by: actorUserId }),
  };

  const result = split.id
    ? await supabase.from("talents").update(payload).eq("id", split.id).select().single()
    : await supabase.from("talents").insert(payload).select().single();

  if (result.error?.code === "23505") {
    return serviceFailure("SLUG_CONFLICT", "A talent with this URL slug already exists.");
  }
  if (result.error) return serviceFailure("PERSIST_FAILED", "Unable to save the talent.");

  const talentId = result.data.id;
  const mediaReferenceResult = await syncTalentGalleryMediaReferences(
    supabase,
    talentId,
    split.body.galleryMediaRefs,
    actorUserId
  );
  if (!mediaReferenceResult.success) return mediaReferenceResult;

  const assignmentResult = await replaceCategoryAssignments(
    supabase,
    talentId,
    uniqueCategoryIds,
    split.primaryCategoryId,
    actorUserId
  );
  if (!assignmentResult.success) return assignmentResult;

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: split.id ? "talents.update" : "talents.create", entityType: "talents", entityId: talentId, newValues: { status } },
    { client: supabase }
  );

  return serviceSuccess({ ...result.data, categoryIds: split.categoryIds, primaryCategoryId: split.primaryCategoryId });
}

export async function syncTalentGalleryMediaReferences(supabase, talentId, galleryMediaRefs, actorUserId) {
  const refs = Array.isArray(galleryMediaRefs)
    ? galleryMediaRefs
        .map((ref, index) => ({
          mediaAssetId: ref?.mediaAssetId,
          index,
        }))
        .filter((ref) => ref.mediaAssetId)
    : [];

  const { error: clearError } = await supabase
    .from("media_asset_references")
    .delete()
    .eq("content_type", "talent_gallery")
    .eq("content_id", talentId);
  if (clearError) {
    return serviceFailure("MEDIA_REFERENCE_FAILED", "Unable to update the talent media references.");
  }

  if (!refs.length) return serviceSuccess({ registered: 0 });

  const assetIds = [...new Set(refs.map((ref) => ref.mediaAssetId))];
  const { data: assets, error: assetError } = await supabase
    .from("media_assets")
    .select("id")
    .in("id", assetIds);
  if (assetError || (assets || []).length !== assetIds.length) {
    return serviceFailure("MEDIA_REFERENCE_FAILED", "One or more gallery media assets are unavailable.");
  }

  const { error: insertError } = await supabase.from("media_asset_references").insert(
    refs.map((ref) => ({
      media_asset_id: ref.mediaAssetId,
      content_type: "talent_gallery",
      content_id: talentId,
      field_path: `body.galleryImages[${ref.index}]`,
      created_by: actorUserId,
    }))
  );
  if (insertError) {
    return serviceFailure("MEDIA_REFERENCE_FAILED", "Unable to register the talent gallery media.");
  }

  return serviceSuccess({ registered: refs.length });
}

async function replaceCategoryAssignments(supabase, talentId, categoryIds, primaryCategoryId, actorUserId) {
  const { error: deleteError } = await supabase.from("talent_category_assignments").delete().eq("talent_id", talentId);
  if (deleteError) {
    return serviceFailure("CATEGORY_ASSIGNMENT_FAILED", "Unable to update the talent's category assignment.");
  }

  const rows = categoryIds.map((categoryId) => ({
    talent_id: talentId,
    talent_category_id: categoryId,
    is_primary: categoryId === primaryCategoryId,
    created_by: actorUserId,
  }));
  if (rows.length) {
    const { error: insertError } = await supabase.from("talent_category_assignments").insert(rows);
    if (insertError) {
      return serviceFailure("CATEGORY_ASSIGNMENT_FAILED", "Unable to update the talent's category assignment.");
    }
  }
  return serviceSuccess({ assigned: categoryIds });
}

export async function archiveTalent(client, { actorUserId, id }) {
  const supabase = getClient(client);
  const { error } = await supabase.from("talents").update({ status: "archived" }).eq("id", id);
  if (error) return serviceFailure("ARCHIVE_FAILED", "Unable to archive the talent.");

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "talents.archive", entityType: "talents", entityId: id, newValues: { status: "archived" } },
    { client: supabase }
  );
  return serviceSuccess({ id, status: "archived" });
}

export async function reorderFeaturedTalents(client, { ids, actorUserId }) {
  const supabase = getClient(client);
  if (!ids || ids.length === 0) return serviceSuccess({ ordered: [] });

  const tempOffset = 10000;
  await Promise.all(ids.map((id, index) => supabase.from("talents").update({ sort_order: tempOffset + index }).eq("id", id)));
  await Promise.all(ids.map((id, index) => supabase.from("talents").update({ featured: true, sort_order: index }).eq("id", id)));

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "talents.reorder_featured", entityType: "talents", newValues: { order: ids } },
    { client: supabase }
  );
  return serviceSuccess({ ordered: ids });
}

export async function reorderTalentCategories(client, { ids, actorUserId }) {
  return reorderRows(client, {
    table: "talent_categories",
    ids,
    actorUserId,
    auditAction: "talent_categories.reorder",
  });
}

export async function saveTalentCategory(client, { actorUserId, category }) {
  const supabase = getClient(client);
  const now = new Date().toISOString();
  const lifecycle =
    category.status === "published"
      ? { status: "published", published_at: now, scheduled_at: null }
      : category.status === "archived"
      ? { status: "archived", published_at: null, scheduled_at: null }
      : { status: "draft", published_at: null, scheduled_at: null };
  const values = {
    slug: category.slug,
    title: category.title,
    summary: category.summary || null,
    ...lifecycle,
    updated_by: actorUserId,
  };
  const result = category.id
    ? await supabase.from("talent_categories").update(values).eq("id", category.id).select().single()
    : await supabase.from("talent_categories").insert({ ...values, created_by: actorUserId }).select().single();

  if (result.error) {
    if (result.error.code === "23505") {
      return serviceFailure("SLUG_CONFLICT", "A talent category with this slug already exists.");
    }
    return serviceFailure("PERSIST_FAILED", "Unable to save the category.");
  }
  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: category.id ? "talent_categories.update" : "talent_categories.create", entityType: "talent_categories", entityId: result.data.id },
    { client: supabase }
  );
  return serviceSuccess(result.data);
}

export async function deleteTalentCategory(client, { actorUserId, id }) {
  const supabase = getClient(client);
  const { count, error: usageError } = await supabase
    .from("talent_category_assignments")
    .select("talent_id", { count: "exact", head: true })
    .eq("talent_category_id", id);

  if (usageError) {
    return serviceFailure("CATEGORY_USAGE_CHECK_FAILED", "Unable to verify whether this category is in use.");
  }
  if ((count || 0) > 0) {
    return serviceFailure(
      "CATEGORY_IN_USE",
      `This category is assigned to ${count} talent${count === 1 ? "" : "s"}. Archive it instead of deleting it.`
    );
  }

  const { data, error } = await supabase
    .from("talent_categories")
    .delete()
    .eq("id", id)
    .select("id, slug, title")
    .maybeSingle();

  if (error?.code === "23503") {
    return serviceFailure("CATEGORY_IN_USE", "This category is assigned to a talent. Archive it instead of deleting it.");
  }
  if (error) return serviceFailure("DELETE_FAILED", "Unable to delete the category.");
  if (!data) return serviceFailure("CATEGORY_NOT_FOUND", "The category no longer exists.");

  await writeSuccessfulAdminMutationAudit(
    {
      actorUserId,
      action: "talent_categories.delete",
      entityType: "talent_categories",
      entityId: id,
      oldValues: { slug: data.slug, title: data.title },
    },
    { client: supabase }
  );
  return serviceSuccess({ id, deleted: true });
}

export function buildTalentPreview(talent) {
  const body = talent.body || {};
  return {
    ...body,
    id: body.id || talent.id,
    slug: talent.slug,
    name: body.name || talent.title,
    subtitle: body.subtitle || talent.summary || "",
    bio: body.bio || talent.summary || "",
    location: talent.location || body.location || "",
    isHot: Boolean(body.isHot),
  };
}

export { reorderRows };
