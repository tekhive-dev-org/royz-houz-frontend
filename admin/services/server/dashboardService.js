import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { getAdminPermissionKeys } from "./adminAuthorizationService";

const CONTENT_TABLES = ["talents", "events", "blog_posts", "media_assets"];

function countQuery(supabase, table, filter) {
  return supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(filter.column, filter.value);
}

function dateGatedCountQuery(supabase, table, filter, range) {
  return supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(filter.column, filter.value)
    .gte("created_at", range.from);
}

async function countManyContentTables(supabase, status) {
  const results = await Promise.all(
    CONTENT_TABLES.map((table) => countQuery(supabase, table, { column: "status", value: status }))
  );

  const total = results.reduce((sum, result) => (result.error ? sum : sum + (result.count || 0)), 0);
  const failed = results.some((result) => result.error);
  return { total, failed };
}

async function fetchRecentActivity(supabase, range, limit = 10) {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, actor_user_id, created_at")
    .gte("created_at", range.from)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { activities: [], failed: true };

  return {
    activities: data.map((entry) => ({
      id: entry.id,
      action: entry.action,
      entityType: entry.entity_type,
      entityId: entry.entity_id || null,
      // Never expose the full user ID; a truncated token is enough for the UI.
      actor: entry.actor_user_id ? entry.actor_user_id.slice(0, 8) : null,
      createdAt: entry.created_at,
    })),
    failed: false,
  };
}

const CARD_DEFINITIONS = [
  { key: "publishedContent", permission: null, label: "Published content" },
  { key: "draftContent", permission: null, label: "Draft content" },
  { key: "scheduledContent", permission: null, label: "Scheduled content" },
  { key: "upcomingEvents", permission: "events.create", label: "Upcoming events" },
  { key: "publishedBlogPosts", permission: "blog.create", label: "Published blog posts" },
  { key: "pendingComments", permission: "comments.moderate", label: "Pending comments" },
  { key: "activeTalents", permission: "talents.create", label: "Active talents" },
  { key: "mediaAssets", permission: "media.upload", label: "Media assets" },
  { key: "newContactSubmissions", permission: "contacts.read", label: "New contact submissions" },
  { key: "newJoinApplications", permission: "applications.read", label: "New join applications" },
  { key: "donationRecords", permission: "donations.read", label: "Donation records" },
];

export async function getDashboardSummary(userId, range, { client } = {}) {
  const supabase = client || createAdminServiceRoleClient();
  const permissionKeys = new Set(await getAdminPermissionKeys(userId, { client }));
  const now = new Date();
  const from = range.from ? new Date(range.from) : new Date(now.getTime() - range.days * 86_400_000);

  const cardVisibility = CARD_DEFINITIONS.map((card) => ({
    key: card.key,
    label: card.label,
    visible: !card.permission || permissionKeys.has(card.permission),
  }));

  const cardTasks = cardVisibility.map(async (card) => {
    if (!card.visible) return { key: card.key, value: null };

    switch (card.key) {
      case "publishedContent": {
        const result = await countManyContentTables(supabase, "published");
        return { key: card.key, value: result.failed ? null : result.total };
      }
      case "draftContent": {
        const result = await countManyContentTables(supabase, "draft");
        return { key: card.key, value: result.failed ? null : result.total };
      }
      case "scheduledContent": {
        const result = await countManyContentTables(supabase, "scheduled");
        return { key: card.key, value: result.failed ? null : result.total };
      }
      case "upcomingEvents": {
        const { count, error } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("status", "published")
          .gte("starts_at", now.toISOString());
        return { key: card.key, value: error ? null : count || 0 };
      }
      case "publishedBlogPosts": {
        const { count, error } = await countQuery(supabase, "blog_posts", { column: "status", value: "published" });
        return { key: card.key, value: error ? null : count || 0 };
      }
      case "pendingComments": {
        const { count, error } = await countQuery(supabase, "blog_comments", { column: "status", value: "pending" });
        return { key: card.key, value: error ? null : count || 0 };
      }
      case "activeTalents": {
        const { count, error } = await countQuery(supabase, "talents", { column: "status", value: "published" });
        return { key: card.key, value: error ? null : count || 0 };
      }
      case "mediaAssets": {
        const { count, error } = await supabase
          .from("media_assets")
          .select("*", { count: "exact", head: true })
          .in("status", ["published", "draft"]);
        return { key: card.key, value: error ? null : count || 0 };
      }
      case "newContactSubmissions": {
        const { count, error } = await dateGatedCountQuery(
          supabase,
          "contact_submissions",
          { column: "status", value: "pending" },
          { from: from.toISOString() }
        );
        return { key: card.key, value: error ? null : count || 0 };
      }
      case "newJoinApplications": {
        const { count, error } = await dateGatedCountQuery(
          supabase,
          "join_applications",
          { column: "status", value: "pending" },
          { from: from.toISOString() }
        );
        return { key: card.key, value: error ? null : count || 0 };
      }
      case "donationRecords": {
        const { count, error } = await countQuery(supabase, "donation_records", { column: "status", value: "pending" });
        return { key: card.key, value: error ? null : count || 0 };
      }
      default:
        return { key: card.key, value: null };
    }
  });

  const recentActivity = permissionKeys.has("audit.read")
    ? await fetchRecentActivity(supabase, { from: from.toISOString() })
    : { activities: [], failed: false, hidden: true };

  const cardValues = await Promise.all(cardTasks);
  const cards = cardValues.map((result) => ({
    key: result.key,
    label: CARD_DEFINITIONS.find((card) => card.key === result.key)?.label || result.key,
    value: result.value,
    visible: cardVisibility.find((card) => card.key === result.key)?.visible ?? false,
  }));

  // Fetch real operational admin widgets data safely
  const [
    pendingAppsRes,
    pendingCommentsRes,
    pendingContactsRes,
    upcomingEventsRes,
    spotlightTalentsRes,
    recentArticlesRes,
  ] = await Promise.allSettled([
    supabase
      .from("join_applications")
      .select("id, full_name, email, role, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("blog_comments")
      .select("id, author_name, post_id, content, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("contact_submissions")
      .select("id, name, email, subject, message, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("events")
      .select("id, title, slug, starts_at, venue_name, location, status, image, featured, body")
      .eq("status", "published")
      .order("starts_at", { ascending: true })
      .limit(4),
    supabase
      .from("talents")
      .select("id, title, slug, body, status, featured, sort_order")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .limit(4),
    supabase
      .from("blog_posts")
      .select("id, title, slug, status, published_at, created_at, body")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const attentionItems = [];
  if (pendingAppsRes.status === "fulfilled" && Array.isArray(pendingAppsRes.value?.data)) {
    pendingAppsRes.value.data.forEach((app) => {
      attentionItems.push({
        id: `app-${app.id}`,
        type: "application",
        typeLabel: "Creative Application",
        title: app.full_name || "Creative Candidate",
        subtitle: app.role || "Talent Roster Applicant",
        email: app.email,
        createdAt: app.created_at,
        href: "/join-applications",
        actionLabel: "Review Applicant",
      });
    });
  }

  if (pendingCommentsRes.status === "fulfilled" && Array.isArray(pendingCommentsRes.value?.data)) {
    pendingCommentsRes.value.data.forEach((c) => {
      attentionItems.push({
        id: `comment-${c.id}`,
        type: "comment",
        typeLabel: "Reader Comment",
        title: c.author_name || "Community Reader",
        subtitle: c.content ? (c.content.length > 75 ? c.content.slice(0, 75) + "…" : c.content) : "New article comment",
        createdAt: c.created_at,
        href: "/blog",
        actionLabel: "Moderate Comment",
      });
    });
  }

  if (pendingContactsRes.status === "fulfilled" && Array.isArray(pendingContactsRes.value?.data)) {
    pendingContactsRes.value.data.forEach((msg) => {
      attentionItems.push({
        id: `contact-${msg.id}`,
        type: "contact",
        typeLabel: "Public Inquiry",
        title: msg.name || "Inquirer",
        subtitle: msg.subject || (msg.message ? msg.message.slice(0, 75) + "…" : "Partnership or general request"),
        email: msg.email,
        createdAt: msg.created_at,
        href: "/contacts",
        actionLabel: "View Message",
      });
    });
  }

  attentionItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const upcomingEventsList =
    upcomingEventsRes.status === "fulfilled" && Array.isArray(upcomingEventsRes.value?.data)
      ? upcomingEventsRes.value.data
      : [];

  const spotlightTalents =
    spotlightTalentsRes.status === "fulfilled" && Array.isArray(spotlightTalentsRes.value?.data)
      ? spotlightTalentsRes.value.data
      : [];

  const recentArticles =
    recentArticlesRes.status === "fulfilled" && Array.isArray(recentArticlesRes.value?.data)
      ? recentArticlesRes.value.data
      : [];

  return {
    cards,
    recentActivity: recentActivity.hidden
      ? { activities: [], hidden: true }
      : { activities: recentActivity.activities, hidden: false },
    attentionItems,
    upcomingEventsList,
    spotlightTalents,
    recentArticles,
    range: { from: from.toISOString(), days: range.days },
  };
}
