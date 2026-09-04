import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { writeSuccessfulAdminMutationAudit } from "./adminAuthorizationService";

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
  const base = slugify(title) || "event";
  let candidate = base;
  let suffix = 2;
  while (true) {
    let query = supabase.from("events").select("id").eq("slug", candidate);
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

function normalizeTicketTiers(tiers) {
  return (Array.isArray(tiers) ? tiers : []).map((tier, index) => {
    const price = Number(String(tier?.price ?? "").replace(/[,₦$\s]/g, ""));
    const rawAvailable = tier?.available;
    const available = rawAvailable === "" || rawAvailable === null || rawAvailable === undefined
      ? null
      : Math.max(0, Math.floor(Number(rawAvailable) || 0));
    return {
      ...tier,
      id: tier?.id || `tier-${index + 1}`,
      price,
      available,
      priceFormatted: `₦${price.toLocaleString("en-NG")}`,
      features: Array.isArray(tier?.features) ? tier.features : [],
    };
  });
}

function splitEvent(input) {
  const { id, slug, categoryIds, primaryCategoryId, status, scheduledAt, startsAt, endsAt, ...rest } = input;
  const body = {
    ...(rest.body || {}),
    description: rest.description,
    category: rest.category,
    categoryTag: rest.categoryTag,
    location: rest.location,
    isOnline: rest.isOnline,
    onlineUrl: rest.onlineUrl,
    time: rest.time,
    image: rest.image,
    heroImage: rest.heroImage,
    startingPrice: rest.startingPrice,
    ticketLink: rest.ticketLink,
    gallery: rest.gallery,
    youtubeUrl: rest.youtubeUrl,
    isPopular: rest.isPopular,
    aboutParagraphs: rest.aboutParagraphs,
    speakers: rest.speakers,
    performingArtists: rest.performingArtists,
    partners: rest.partners,
    schedule: rest.schedule,
    faqs: rest.faqs,
    ticketTiers: normalizeTicketTiers(rest.ticketTiers),
    attendees: rest.attendees,
    recapLink: rest.recapLink,
    venue: rest.venue,
    dateString: rest.dateString,
  };
  return {
    id,
    slug,
    body,
    startsAt,
    endsAt,
    timezone: rest.timezone,
    venueName: rest.venueName,
    venueAddress: rest.venueAddress,
    featured: rest.featured,
    sortOrder: rest.sortOrder,
    status,
    scheduledAt,
    categoryIds: categoryIds || [],
    primaryCategoryId: primaryCategoryId || null,
  };
}

export async function listEvents(client, { search, category, status, featured } = {}) {
  const supabase = getClient(client);
  let query = supabase.from("events").select("*");

  if (search) query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,venue_name.ilike.%${search}%,venue_address.ilike.%${search}%`);
  if (status) query = query.eq("status", status);
  if (featured === "true") query = query.eq("featured", true);
  else if (featured === "false") query = query.eq("featured", false);

  if (category) {
    const { data: assigned } = await supabase.from("event_category_assignments").select("event_id").eq("event_category_id", category);
    const ids = (assigned || []).map((row) => row.event_id);
    if (ids.length) query = query.in("id", ids);
  }

  query = query.order("starts_at", { ascending: true, nullsFirst: false }).order("title", { ascending: true }).limit(500);

  const { data, error } = await query;
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load events.");
  if (!data || data.length === 0) return serviceSuccess([]);

  const eventIds = data.map((e) => e.id);
  const { data: assignments } = await supabase
    .from("event_category_assignments")
    .select("event_id, event_category_id, is_primary")
    .in("event_id", eventIds);

  const categoryMap = {};
  const primaryMap = {};
  (assignments || []).forEach((row) => {
    if (!categoryMap[row.event_id]) categoryMap[row.event_id] = [];
    categoryMap[row.event_id].push(row.event_category_id);
    if (row.is_primary) primaryMap[row.event_id] = row.event_category_id;
  });

  const enriched = data.map((e) => ({
    ...e,
    categoryIds: categoryMap[e.id] || [],
    primaryCategoryId: primaryMap[e.id] || (categoryMap[e.id]?.[0] ?? null),
  }));

  return serviceSuccess(enriched);
}

export async function getEvent(client, id) {
  const supabase = getClient(client);
  const [{ data, error }, { data: assignments }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).maybeSingle(),
    supabase.from("event_category_assignments").select("event_category_id, is_primary").eq("event_id", id),
  ]);
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load the event.");
  if (!data) return serviceFailure("NOT_FOUND", "Event was not found.");

  const primary = (assignments || []).find((row) => row.is_primary);
  return serviceSuccess({
    ...data,
    body: data.body || {},
    categoryIds: (assignments || []).map((row) => row.event_category_id),
    primaryCategoryId: primary?.event_category_id || null,
  });
}

export async function listEventCategories(client) {
  const supabase = getClient(client);
  const { data, error } = await supabase.from("event_categories").select("*").order("sort_order", { ascending: true });
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load categories.");
  return serviceSuccess(data || []);
}

export async function saveEvent(client, { actorUserId, event }) {
  const supabase = getClient(client);
  const split = splitEvent(event);
  const rawSlug = typeof event.slug === "string" && event.slug.trim() ? event.slug.trim() : "";
  const slugCandidate = rawSlug || event.title || "event";
  const slug = split.id && rawSlug ? rawSlug : await uniqueSlug(supabase, slugCandidate, split.id);

  const payload = {
    slug,
    title: event.title,
    summary: event.summary || event.description || null,
    body: split.body,
    starts_at: split.startsAt || null,
    ends_at: split.endsAt || null,
    timezone: split.timezone || null,
    venue_name: split.venueName || null,
    venue_address: split.venueAddress || null,
    featured: split.featured,
    sort_order: split.sortOrder ?? 0,
    ...buildLifecycle(split.status, split.scheduledAt),
  };

  const result = split.id
    ? await supabase.from("events").update(payload).eq("id", split.id).select().single()
    : await supabase.from("events").insert(payload).select().single();

  if (result.error) return serviceFailure("PERSIST_FAILED", "Unable to save the event.");

  const eventId = result.data.id;
  await replaceCategoryAssignments(supabase, eventId, split.categoryIds, split.primaryCategoryId, actorUserId);
  await recordRevision(supabase, { table: "events", contentId: eventId, actorUserId, snapshot: payload, action: split.id ? "updated" : "created" });

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: split.id ? "events.update" : "events.create", entityType: "events", entityId: eventId, newValues: { status: split.status } },
    { client: supabase }
  );

  return serviceSuccess({ ...result.data, categoryIds: split.categoryIds, primaryCategoryId: split.primaryCategoryId });
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

async function replaceCategoryAssignments(supabase, eventId, categoryIds, primaryCategoryId, actorUserId) {
  await supabase.from("event_category_assignments").delete().eq("event_id", eventId);
  const rows = categoryIds.map((categoryId) => ({
    event_id: eventId,
    event_category_id: categoryId,
    is_primary: categoryId === primaryCategoryId,
    created_by: actorUserId,
  }));
  if (rows.length) await supabase.from("event_category_assignments").insert(rows);
}

export async function archiveEvent(client, { actorUserId, id }) {
  const supabase = getClient(client);
  const { error } = await supabase.from("events").update({ status: "archived" }).eq("id", id);
  if (error) return serviceFailure("ARCHIVE_FAILED", "Unable to archive the event.");
  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "events.archive", entityType: "events", entityId: id, newValues: { status: "archived" } },
    { client: supabase }
  );
  return serviceSuccess({ id, status: "archived" });
}

export async function reorderEvents(client, { ids, actorUserId }) {
  const supabase = getClient(client);
  if (!ids || ids.length === 0) return serviceSuccess({ ordered: [] });

  const tempOffset = 10000;
  await Promise.all(ids.map((id, index) => supabase.from("events").update({ sort_order: tempOffset + index }).eq("id", id)));
  await Promise.all(ids.map((id, index) => supabase.from("events").update({ featured: true, sort_order: index }).eq("id", id)));

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "events.reorder_featured", entityType: "events", newValues: { order: ids } },
    { client: supabase }
  );
  return serviceSuccess({ ordered: ids });
}

export async function reorderEventCategories(client, { actorUserId, ids }) {
  const supabase = getClient(client);
  await Promise.all(ids.map((id, index) => supabase.from("event_categories").update({ sort_order: 10000 + index }).eq("id", id)));
  await Promise.all(ids.map((id, index) => supabase.from("event_categories").update({ sort_order: index }).eq("id", id)));
  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "event_categories.reorder", entityType: "event_categories", newValues: { order: ids } },
    { client: supabase }
  );
  return serviceSuccess({ ordered: ids });
}

export async function deleteEventCategory(client, { actorUserId, id }) {
  const supabase = getClient(client);
  const { data: category, error: lookupError } = await supabase.from("event_categories").select("id, title").eq("id", id).maybeSingle();
  if (lookupError) return serviceFailure("QUERY_FAILED", "Unable to find the event category.");
  if (!category) return serviceFailure("CATEGORY_NOT_FOUND", "Event category was not found.");

  const { count, error: assignmentError } = await supabase
    .from("event_category_assignments")
    .select("event_id", { count: "exact", head: true })
    .eq("event_category_id", id);
  if (assignmentError) return serviceFailure("QUERY_FAILED", "Unable to check category usage.");
  if (count) return serviceFailure("CATEGORY_IN_USE", "Remove this category from its events before deleting it.");

  const { error } = await supabase.from("event_categories").delete().eq("id", id);
  if (error) return serviceFailure("PERSIST_FAILED", "Unable to delete the event category.");
  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "event_categories.delete", entityType: "event_categories", entityId: id, oldValues: category },
    { client: supabase }
  );
  return serviceSuccess({ id });
}

export async function saveEventCategory(client, { actorUserId, category }) {
  const supabase = getClient(client);
  const now = new Date().toISOString();
  const lifecycle = category.status === "published"
    ? { status: "published", published_at: now, scheduled_at: null }
    : category.status === "scheduled"
      ? { status: "scheduled", published_at: null, scheduled_at: category.scheduledAt || null }
      : { status: category.status || "draft", published_at: null, scheduled_at: null };
  const values = {
    slug: category.slug,
    title: category.title,
    summary: category.summary || null,
    ...lifecycle,
  };
  const result = category.id
    ? await supabase.from("event_categories").update(values).eq("id", category.id).select().single()
    : await supabase.from("event_categories").insert(values).select().single();

  if (result.error) return serviceFailure("PERSIST_FAILED", "Unable to save the category.");
  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: category.id ? "event_categories.update" : "event_categories.create", entityType: "event_categories", entityId: result.data.id },
    { client: supabase }
  );
  return serviceSuccess(result.data);
}

/** Mirrors the public event adapter shape for the admin preview. */
export function buildEventPreview(event) {
  const body = event.body || {};
  const date = event.starts_at ? new Date(event.starts_at) : null;
  return {
    ...body,
    id: body.id || event.id,
    slug: event.slug,
    title: event.title,
    description: body.description || event.summary || "",
    location: body.location || event.venue_address || event.venue_name || "",
    image: body.image || "",
    isPopular: Boolean(body.isPopular || event.featured),
    day: body.day || (date ? String(date.getUTCDate()).padStart(2, "0") : ""),
    month: body.month || (date ? date.toLocaleString("en", { month: "short", timeZone: "UTC" }) : ""),
    year: body.year || (date ? String(date.getUTCFullYear()) : ""),
    heroImage: body.heroImage || body.image || "",
    venue: body.venue || event.venue_address || event.venue_name || body.location || "",
    time: body.time || "",
    countdownTarget: body.countdownTarget || event.starts_at || null,
  };
}
