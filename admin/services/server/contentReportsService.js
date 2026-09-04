import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { createPaginationMeta, normalizePagination } from "@/utils/pagination";

function serviceSuccess(data, message = "Request completed", pagination = null) {
  return { success: true, data, message, pagination };
}

function serviceFailure(code, message) {
  return { success: false, error: { code, message } };
}

function getClient(client) {
  return client || createAdminServiceRoleClient();
}

function getTargetOwnerId(report) {
  const target = report.target_type === "talent_media" ? report.talents : report.media_assets;
  return target?.created_by || null;
}

function attachLinkedTalent(report, owner, talent = null) {
  const linkedTalent = report.talents || talent;
  return {
    ...report,
    talent: linkedTalent
      ? { id: report.talent_id || linkedTalent.id, title: linkedTalent.title, slug: linkedTalent.slug }
      : null,
    owner,
  };
}

async function findReferencedTalents(supabase, reports) {
  const assetReports = reports.filter((report) => report.target_type === "media_asset" && !report.talent_id);
  if (!assetReports.length) return new Map();

  const references = await Promise.all(assetReports.map(async (report) => {
    const { data } = await supabase
      .from("media_asset_references")
      .select("media_asset_id, content_id")
      .eq("media_asset_id", report.media_asset_id)
      .eq("content_type", "talent_gallery")
      .limit(1);
    return [report.id, data?.[0]?.content_id || null];
  }));
  const talentIds = [...new Set(references.map(([, id]) => id).filter(Boolean))];
  if (!talentIds.length) return new Map();

  const { data } = await supabase.from("talents").select("id, title, slug").in("id", talentIds);
  const talentsById = new Map((data || []).map((talent) => [talent.id, talent]));
  return new Map(references.map(([reportId, talentId]) => [reportId, talentsById.get(talentId) || null]));
}

async function attachContentOwners(supabase, reports) {
  const referencedTalents = await findReferencedTalents(supabase, reports);
  const ownerIds = [...new Set(reports.map(getTargetOwnerId).filter(Boolean))];
  if (!ownerIds.length) return reports.map((report) => attachLinkedTalent(report, null, referencedTalents.get(report.id)));

  const owners = await Promise.all(
    ownerIds.map(async (id) => {
      const { data, error } = await supabase.auth.admin.getUserById(id);
      if (error || !data?.user) return [id, null];
      const user = data.user;
      const metadata = user.user_metadata || {};
      return [id, {
        id: user.id,
        name: metadata.full_name || metadata.display_name || metadata.name || user.email || "Content owner",
        email: user.email || null,
        phone: user.phone || null,
      }];
    })
  );
  const ownerById = new Map(owners);

  return reports.map((report) => attachLinkedTalent(
    report,
    ownerById.get(getTargetOwnerId(report)) || null,
    referencedTalents.get(report.id)
  ));
}

const REPORT_SELECT = [
  "id",
  "target_type",
  "talent_id",
  "media_asset_id",
  "target_key",
  "target_title_snapshot",
  "reason_code",
  "details",
  "reporter_email",
  "workflow_status",
  "assigned_to",
  "internal_notes",
  "resolution",
  "resolved_at",
  "resolved_by",
  "created_at",
  "updated_at",
  "talents(title,slug,created_by)",
  "media_assets(title,slug,created_by)",
].join(",");

export async function listContentReports(client, filters = {}) {
  const supabase = getClient(client);
  const pagination = normalizePagination(filters);
  let query = supabase.from("content_reports").select(REPORT_SELECT, { count: "exact" });

  if (filters.status) query = query.eq("workflow_status", filters.status);
  if (filters.reason) query = query.eq("reason_code", filters.reason);
  if (filters.search) query = query.ilike("target_title_snapshot", `%${filters.search}%`);

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(pagination.from, pagination.to);
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load content reports.");

  return serviceSuccess(
    await attachContentOwners(supabase, data || []),
    "Content reports loaded.",
    createPaginationMeta({ page: pagination.page, limit: pagination.limit, total: count || 0 })
  );
}

export async function getContentReport(client, id) {
  const supabase = getClient(client);
  const { data, error } = supabase
    .from("content_reports")
    .select(REPORT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load the content report.");
  if (!data) return serviceFailure("NOT_FOUND", "Content report was not found.");
  const [report] = await attachContentOwners(supabase, [data]);
  return serviceSuccess(report);
}

export async function listReportAssignees(client) {
  const { data, error } = await getClient(client)
    .from("admin_profiles")
    .select("user_id, display_name")
    .eq("status", "active")
    .order("display_name", { ascending: true });
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load report assignees.");
  return serviceSuccess(
    (data || []).map((profile) => ({ id: profile.user_id, displayName: profile.display_name }))
  );
}

export async function moderateContentReport(client, { actorUserId, report }) {
  const { data, error } = await getClient(client).rpc("admin_moderate_content_report", {
    p_actor_user_id: actorUserId,
    p_report_id: report.id,
    p_workflow_status: report.status ?? null,
    p_assigned_to: report.assignedTo ?? null,
    p_set_assignment: report.assignedTo !== undefined,
    p_internal_notes: report.internalNotes ?? null,
    p_set_internal_notes: report.internalNotes !== undefined,
    p_resolution: report.resolution ?? null,
  });
  if (error) return serviceFailure("PERSIST_FAILED", "Unable to update the content report.");
  const updated = Array.isArray(data) ? data[0] : data;
  if (!updated) return serviceFailure("NOT_FOUND", "Content report was not found.");
  return serviceSuccess(updated, "Content report updated.");
}
