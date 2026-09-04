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

const CONTENT_ENTITIES = [
  { key: "talent", table: "talents", select: "id, slug, title, status, featured" },
  { key: "event", table: "events", select: "id, slug, title, status, featured" },
  { key: "blog", table: "blog_posts", select: "id, slug, title, status, featured" },
  { key: "media", table: "media_collections", select: "id, slug, title, status, featured" },
  { key: "campaign", table: "donation_campaigns", select: "id, slug, title, status, featured" },
];

const STATIC_ROUTES = [
  { key: "home", path: "/", label: "Home" },
  { key: "about", path: "/about", label: "About" },
  { key: "talents", path: "/talents", label: "Talents" },
  { key: "events", path: "/events", label: "Events" },
  { key: "blog", path: "/blog", label: "Blog" },
  { key: "media", path: "/media", label: "Media" },
  { key: "contact", path: "/contact", label: "Contact" },
  { key: "join", path: "/join", label: "Join" },
  { key: "donate", path: "/donate", label: "Donate" },
];

function columnForType(key) {
  const map = {
    talent: "talent_id",
    event: "event_id",
    blog: "blog_post_id",
    media: "media_collection_id",
    campaign: "donation_campaign_id",
  };
  return map[key];
}

export async function listSeoRecords(client, { type, search } = {}) {
  const supabase = getClient(client);

  if (type && type !== "static") {
    const entity = CONTENT_ENTITIES.find((entry) => entry.key === type);
    if (!entity) return serviceFailure("VALIDATION_ERROR", "Unsupported content type.");
    const { data, error } = await supabase
      .from(entity.table)
      .select(`${entity.select}, seo_metadata(id, title, summary, canonical_path, og_title, og_description, og_image_url, no_index, no_follow, structured_data)`)
      .ilike("title", `%${search || ""}%`)
      .limit(200);
    if (error) return serviceFailure("QUERY_FAILED", "Unable to load records.");
    return serviceSuccess(
      (data || []).map((row) => ({
        id: row.id,
        key: row.slug,
        title: row.title,
        type: entity.key,
        path: `/${entity.key}/${row.slug}`,
        status: row.status,
        seo: row.seo_metadata || null,
      }))
    );
  }

  if (type === "static") {
    return serviceSuccess(
      STATIC_ROUTES.map((route) => ({
        id: route.path,
        key: route.path,
        title: route.label,
        type: "static",
        path: route.path,
        status: "published",
        seo: null,
      }))
    );
  }

  // All content entities.
  const results = await Promise.all(
    CONTENT_ENTITIES.map(async (entity) => {
      const { data, error } = await supabase
        .from(entity.table)
        .select(`${entity.select}, seo_metadata(id, title, summary, canonical_path, og_title, og_description, og_image_url, no_index, no_follow, structured_data)`)
        .limit(200);
      if (error) return [];
      return (data || []).map((row) => ({
        id: row.id,
        key: row.slug,
        title: row.title,
        type: entity.key,
        path: `/${entity.key}/${row.slug}`,
        status: row.status,
        seo: row.seo_metadata || null,
      }));
    })
  );

  const all = results.flat().concat(
    STATIC_ROUTES.map((route) => ({ id: route.path, key: route.path, title: route.label, type: "static", path: route.path, status: "published", seo: null }))
  );

  if (search) {
    return serviceSuccess(all.filter((row) => row.title.toLowerCase().includes(search.toLowerCase())));
  }
  return serviceSuccess(all);
}

export async function getSeoRecord(client, { type, id }) {
  const supabase = getClient(client);
  const column = columnForType(type);
  if (!column) return serviceFailure("VALIDATION_ERROR", "Unsupported content type.");

  const { data, error } = await supabase
    .from("seo_metadata")
    .select("*")
    .eq(column, id)
    .maybeSingle();
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load SEO record.");
  return serviceSuccess(data || null);
}

export async function saveSeoRecord(client, { type, id, actorUserId, seo }) {
  const supabase = getClient(client);
  const column = columnForType(type);
  if (!column) return serviceFailure("VALIDATION_ERROR", "Unsupported content type.");

  const existing = await supabase.from("seo_metadata").select("id").eq(column, id).maybeSingle();

  const row = {
    [column]: id,
    title: seo.title || null,
    summary: seo.summary || null,
    canonical_path: seo.canonical || null,
    og_title: seo.ogTitle || null,
    og_description: seo.ogDescription || null,
    og_image_url: seo.ogImageUrl || null,
    no_index: Boolean(seo.noIndex),
    no_follow: Boolean(seo.noFollow),
    structured_data: seo.structuredData || null,
    updated_by: actorUserId,
  };

  const result = existing.data
    ? await supabase.from("seo_metadata").update(row).eq("id", existing.data.id).select().single()
    : await supabase.from("seo_metadata").insert({ ...row, created_by: actorUserId }).select().single();

  if (result.error) return serviceFailure("PERSIST_FAILED", "Unable to save SEO record.");

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: existing.data ? "seo_metadata.update" : "seo_metadata.create", entityType: "seo_metadata", entityId: result.data.id, newValues: { type, contentId: id } },
    { client: supabase }
  );

  return serviceSuccess(result.data);
}

export async function getDefaultSeo(client) {
  const supabase = getClient(client);
  const { data: setting, error: settingError } = await supabase
    .from("site_settings")
    .select("id")
    .eq("slug", "default-seo")
    .maybeSingle();

  if (settingError) return serviceFailure("QUERY_FAILED", "Unable to load default SEO.");
  if (!setting) return serviceSuccess(null);

  const { data, error } = await supabase
    .from("seo_metadata")
    .select("*")
    .eq("site_settings_id", setting.id)
    .maybeSingle();

  if (error) return serviceFailure("QUERY_FAILED", "Unable to load default SEO.");
  return serviceSuccess(data || null);
}

export async function saveDefaultSeo(client, { actorUserId, seo }) {
  const supabase = getClient(client);

  const { data: setting, error: settingError } = await supabase
    .from("site_settings")
    .upsert({ slug: "default-seo", title: "Default SEO", status: "published", published_at: new Date().toISOString() }, { onConflict: "slug" })
    .select()
    .single();
  if (settingError || !setting) return serviceFailure("PERSIST_FAILED", "Unable to prepare default SEO.");

  const existing = await supabase.from("seo_metadata").select("id").eq("site_settings_id", setting.id).maybeSingle();
  const row = {
    site_settings_id: setting.id,
    title: seo.title || null,
    summary: seo.summary || null,
    canonical_path: seo.canonical || null,
    og_title: seo.ogTitle || null,
    og_description: seo.ogDescription || null,
    og_image_url: seo.ogImageUrl || null,
    no_index: Boolean(seo.noIndex),
    no_follow: Boolean(seo.noFollow),
    structured_data: seo.structuredData || null,
    updated_by: actorUserId,
  };

  const result = existing.data
    ? await supabase.from("seo_metadata").update(row).eq("id", existing.data.id).select().single()
    : await supabase.from("seo_metadata").insert({ ...row, created_by: actorUserId }).select().single();

  if (result.error) return serviceFailure("PERSIST_FAILED", "Unable to save default SEO.");

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: existing.data ? "seo_metadata.update_default" : "seo_metadata.create_default", entityType: "seo_metadata", entityId: result.data.id },
    { client: supabase }
  );

  return serviceSuccess(result.data);
}

export function buildSeoPreview({ title, description, canonical, siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "" }) {
  const absoluteCanonical = canonical ? (canonical.startsWith("/") ? `${siteUrl.replace(/\/$/, "")}${canonical}` : canonical) : "";
  return {
    title,
    description,
    canonical,
    absoluteCanonical,
    searchResult: {
      title,
      description,
      url: absoluteCanonical || siteUrl,
    },
  };
}
