-- Royz Houz admin extension: content-report permissions and atomic moderation.
--
-- Ownership: admin/supabase/migrations
-- Depends on 20260825121400_web_add_content_reporting.sql and the existing
-- admin access-control/audit functions. It does not recreate the web-owned table.

insert into public.permissions (permission_key, description)
values
  ('reports.read', 'View private public-content reports.'),
  ('reports.moderate', 'Assign, resolve, dismiss, deduplicate, or archive content reports.')
on conflict (permission_key) do update
  set description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select role.id, permission.id
from public.roles role
cross join public.permissions permission
where role.role_key = 'super_admin'
  and permission.permission_key in ('reports.read', 'reports.moderate')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select role.id, permission.id
from public.roles role
join public.permissions permission on permission.permission_key = any (
  case role.role_key
    when 'administrator' then array['reports.read', 'reports.moderate']
    when 'moderator' then array['reports.read', 'reports.moderate']
    when 'editor' then array['reports.read']
    else array[]::text[]
  end
)
where role.role_key in ('administrator', 'moderator', 'editor')
on conflict do nothing;

-- The API checks the exact permission before invoking this function. The
-- function repeats that authorization using the verified actor UUID, performs
-- the update, and writes a redacted audit event in one database transaction.
create or replace function public.admin_moderate_content_report(
  p_actor_user_id uuid,
  p_report_id uuid,
  p_workflow_status text default null,
  p_assigned_to uuid default null,
  p_set_assignment boolean default false,
  p_internal_notes text default null,
  p_set_internal_notes boolean default false,
  p_resolution text default null
)
returns public.content_reports
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  previous_report public.content_reports;
  updated_report public.content_reports;
  next_status text;
begin
  if not public.has_admin_permission_for_user(p_actor_user_id, 'reports.moderate') then
    raise exception 'permission denied';
  end if;

  select * into previous_report
  from public.content_reports
  where id = p_report_id
  for update;

  if not found then
    raise exception 'content report not found';
  end if;

  next_status := coalesce(p_workflow_status, previous_report.workflow_status);
  if next_status not in ('new', 'reviewing', 'actioned', 'dismissed', 'duplicate', 'archived') then
    raise exception 'invalid report status';
  end if;
  if p_set_internal_notes and char_length(coalesce(p_internal_notes, '')) > 5000 then
    raise exception 'internal notes too long';
  end if;
  if char_length(coalesce(p_resolution, '')) > 2000 then
    raise exception 'resolution too long';
  end if;
  if next_status in ('actioned', 'dismissed', 'duplicate')
    and nullif(trim(coalesce(p_resolution, previous_report.resolution, '')), '') is null then
    raise exception 'resolution required';
  end if;
  if p_set_assignment and p_assigned_to is not null and not exists (
    select 1 from public.admin_profiles profile
    where profile.user_id = p_assigned_to and profile.status = 'active'
  ) then
    raise exception 'assignee is not an active administrator';
  end if;

  update public.content_reports
  set workflow_status = next_status,
      assigned_to = case when p_set_assignment then p_assigned_to else assigned_to end,
      internal_notes = case when p_set_internal_notes then nullif(trim(coalesce(p_internal_notes, '')), '') else internal_notes end,
      resolution = case
        when next_status in ('actioned', 'dismissed', 'duplicate', 'archived') then nullif(trim(coalesce(p_resolution, previous_report.resolution, '')), '')
        else null
      end,
      resolved_at = case
        when next_status in ('actioned', 'dismissed', 'duplicate', 'archived') then coalesce(resolved_at, timezone('utc', now()))
        else null
      end,
      resolved_by = case
        when next_status in ('actioned', 'dismissed', 'duplicate', 'archived') then p_actor_user_id
        else null
      end,
      updated_by = p_actor_user_id
  where id = p_report_id
  returning * into updated_report;

  perform public.write_audit_log(
    p_actor_user_id,
    'content_reports.moderate',
    'content_reports',
    p_report_id,
    jsonb_build_object(
      'workflow_status', previous_report.workflow_status,
      'assigned_to', previous_report.assigned_to,
      'has_internal_notes', previous_report.internal_notes is not null
    ),
    jsonb_build_object(
      'workflow_status', updated_report.workflow_status,
      'assigned_to', updated_report.assigned_to,
      'has_internal_notes', updated_report.internal_notes is not null,
      'has_resolution', updated_report.resolution is not null
    ),
    jsonb_build_object('target_type', updated_report.target_type)
  );

  return updated_report;
end;
$$;

revoke all on function public.admin_moderate_content_report(uuid, uuid, text, uuid, boolean, text, boolean, text)
  from public, anon, authenticated;
grant execute on function public.admin_moderate_content_report(uuid, uuid, text, uuid, boolean, text, boolean, text)
  to service_role;
