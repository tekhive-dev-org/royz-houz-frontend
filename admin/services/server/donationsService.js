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
  const base = slugify(title) || "campaign";
  let candidate = base;
  let suffix = 2;
  while (true) {
    let query = supabase.from("donation_campaigns").select("id").eq("slug", candidate);
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

export async function listCampaigns(client, { search, status } = {}) {
  const supabase = getClient(client);
  let query = supabase.from("donation_campaigns").select("*");
  if (search) query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
  if (status) query = query.eq("status", status);
  query = query.order("sort_order", { ascending: true }).limit(500);
  const { data, error } = await query;
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load campaigns.");
  return serviceSuccess(data || []);
}

export async function getCampaign(client, id) {
  const supabase = getClient(client);
  const { data, error } = await supabase.from("donation_campaigns").select("*").eq("id", id).maybeSingle();
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load the campaign.");
  if (!data) return serviceFailure("NOT_FOUND", "Campaign was not found.");
  return serviceSuccess(data);
}

export async function saveCampaign(client, { actorUserId, campaign }) {
  const supabase = getClient(client);
  const slug = campaign.id ? campaign.slug : await uniqueSlug(supabase, campaign.title, campaign.id);

  const body = {
    description: campaign.description,
    targetAmount: campaign.targetAmount,
    currency: campaign.currency,
    image: campaign.image,
  };

  const payload = {
    slug,
    title: campaign.title,
    summary: campaign.summary || campaign.description || null,
    body,
    featured: campaign.featured,
    sort_order: campaign.sortOrder ?? 0,
    ...buildLifecycle(campaign.status, campaign.scheduledAt),
  };

  const result = campaign.id
    ? await supabase.from("donation_campaigns").update(payload).eq("id", campaign.id).select().single()
    : await supabase.from("donation_campaigns").insert(payload).select().single();

  if (result.error) return serviceFailure("PERSIST_FAILED", "Unable to save the campaign.");
  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: campaign.id ? "donation_campaigns.update" : "donation_campaigns.create", entityType: "donation_campaigns", entityId: result.data.id, newValues: { status: campaign.status } },
    { client: supabase }
  );
  return serviceSuccess(result.data);
}

export async function archiveCampaign(client, { actorUserId, id }) {
  const supabase = getClient(client);
  const { error } = await supabase.from("donation_campaigns").update({ status: "archived" }).eq("id", id);
  if (error) return serviceFailure("ARCHIVE_FAILED", "Unable to archive the campaign.");
  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "donation_campaigns.archive", entityType: "donation_campaigns", entityId: id, newValues: { status: "archived" } },
    { client: supabase }
  );
  return serviceSuccess({ id, status: "archived" });
}

export async function listRecords(client, { search, status, campaignId } = {}) {
  const supabase = getClient(client);
  let query = supabase
    .from("donation_records")
    .select("id, reference, donation_campaign_id, donor_name, donor_email, donor_phone, amount, currency, frequency, status, approved_at, created_at, internal_notes, donation_campaigns(title, slug)");

  if (status) query = query.eq("status", status);
  if (campaignId) query = query.eq("donation_campaign_id", campaignId);
  if (search) query = query.or(`donor_name.ilike.%${search}%,reference.ilike.%${search}%,donor_email.ilike.%${search}%`);

  query = query.order("created_at", { ascending: false }).limit(1000);

  const { data, error } = await query;
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load records.");
  return serviceSuccess(data || []);
}

export async function updateRecordNotes(client, { actorUserId, id, notes }) {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from("donation_records")
    .update({ internal_notes: notes || null, updated_by: actorUserId })
    .eq("id", id)
    .select("id, reference, status, internal_notes")
    .single();
  if (error) return serviceFailure("PERSIST_FAILED", "Unable to update the record.");
  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "donation_records.notes", entityType: "donation_records", entityId: id, newValues: { notes: Boolean(notes) } },
    { client: supabase }
  );
  return serviceSuccess(data);
}

/**
 * Safe campaign totals: only approved records contribute. Totals are derived
 * server-side; donor identity is never included.
 */
export async function getCampaignTotals(client, { campaignId } = {}) {
  const supabase = getClient(client);
  let query = supabase
    .from("donation_records")
    .select("donation_campaign_id, currency, amount")
    .eq("status", "approved");

  if (campaignId) query = query.eq("donation_campaign_id", campaignId);
  const { data, error } = await query;
  if (error) return serviceFailure("QUERY_FAILED", "Unable to compute totals.");

  const totals = {};
  for (const row of data || []) {
    const key = `${row.currency}:${row.donation_campaign_id || "all"}`;
    totals[key] = (totals[key] || 0) + Number(row.amount);
  }

  const campaigns = Object.fromEntries(
    Object.entries(totals).map(([key, total]) => {
      const [currency, campaignIdValue] = key.split(":");
      return [campaignIdValue, { currency, total: Math.round(total * 100) / 100 }];
    })
  );

  return serviceSuccess({ campaigns });
}

function csvEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function exportRecordsCsv(client, { actorUserId, filters = {} }) {
  const result = await listRecords(client, filters);
  if (!result.success) return result;

  const rows = result.data;
  const header = [
    "reference",
    "donor_name",
    "donor_email",
    "donor_phone",
    "amount",
    "currency",
    "frequency",
    "status",
    "campaign_title",
    "created_at",
  ];

  const lines = [header.map(csvEscape).join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.reference,
        row.donor_name,
        row.donor_email,
        row.donor_phone || "",
        row.amount,
        row.currency,
        row.frequency,
        row.status,
        row.donation_campaigns?.title || "",
        row.created_at,
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "donation_records.export", entityType: "donation_records", newValues: { rowCount: rows.length, filters } },
    { client: getClient(client) }
  );

  return serviceSuccess(lines.join("\n"));
}
