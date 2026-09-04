import { listPublicRecords } from "@/repositories/publicContentRepository";
import { toEventCard, toEventDetails } from "@/adapters/eventAdapter";
import { getContentClient, normalizeSearch, serviceFailure, serviceSuccess } from "./serviceUtils";

function publicEventFilters(featured) {
  const filters = [
    { column: "status", value: "published" },
    { column: "published_at", operator: "not.is", value: null },
    { column: "published_at", operator: "lte", value: new Date().toISOString() },
  ];

  if (featured === true) filters.push({ column: "featured", value: true });
  return filters;
}

export async function listEventCategories({ client } = {}) {
  const { data, error } = await getContentClient(client)
    .from("event_categories")
    .select("id, slug, title, summary, sort_order")
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("sort_order", { ascending: true });
  if (error) return serviceFailure({ code: "CONTENT_QUERY_FAILED", message: "Unable to load event categories." });
  return serviceSuccess(data || [], "Event categories loaded successfully");
}

async function attachEventCategories(client, events) {
  if (!events.length) return events;
  const ids = events.map((event) => event.id);
  const { data: assignments } = await client
    .from("event_category_assignments")
    .select("event_id, event_category_id, is_primary")
    .in("event_id", ids);
  const categoryIds = [...new Set((assignments || []).map((assignment) => assignment.event_category_id))];
  if (!categoryIds.length) return events;
  const { data: categories } = await client
    .from("event_categories")
    .select("id, slug, title")
    .in("id", categoryIds)
    .eq("status", "published");
  const categoriesById = new Map((categories || []).map((category) => [category.id, category]));
  const assignmentsByEvent = new Map();
  (assignments || []).forEach((assignment) => {
    const category = categoriesById.get(assignment.event_category_id);
    if (!category) return;
    const current = assignmentsByEvent.get(assignment.event_id) || [];
    current.push({ ...category, isPrimary: assignment.is_primary });
    assignmentsByEvent.set(assignment.event_id, current);
  });
  return events.map((event) => {
    const categories = assignmentsByEvent.get(event.id) || [];
    const primary = categories.find((category) => category.isPrimary) || categories[0];
    return {
      ...event,
      categories,
      category: primary?.title || event.category,
      categoryTag: primary?.title || event.categoryTag,
    };
  });
}

export async function listEvents({ page, limit, search, featured, client } = {}) {
  const contentClient = getContentClient(client);
  const result = await listPublicRecords(contentClient, {
    source: "events",
    pagination: page && limit ? { page, limit, from: (page - 1) * limit, to: page * limit - 1 } : null,
    order: { column: "starts_at" },
    filters: publicEventFilters(featured),
    search: { value: normalizeSearch(search), columns: ["title", "summary", "venue_name", "venue_address"] },
  });
  if (!result.success) return serviceFailure(result.error);
  return serviceSuccess(
    (await attachEventCategories(contentClient, result.data)).map(toEventCard),
    "Events loaded successfully",
    result.pagination
  );
}

export async function getEventBySlug(slug, { client } = {}) {
  const normalizedSlug = typeof slug === "string" ? slug.trim().toLowerCase() : "";
  if (!normalizedSlug) return serviceFailure({ code: "NOT_FOUND", message: "Event was not found." });

  const { data, error } = await getContentClient(client)
    .from("events")
    .select("*")
    .eq("slug", normalizedSlug)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error) return serviceFailure({ code: "CONTENT_QUERY_FAILED", message: "Unable to load event." });
  if (!data) return serviceFailure({ code: "NOT_FOUND", message: "Event was not found." });

  const [eventWithCategories] = await attachEventCategories(getContentClient(client), [data]);
  return serviceSuccess(toEventDetails(eventWithCategories), "Event loaded successfully");
}
