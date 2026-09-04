-- Royz Houz admin extension: server-authoritative authorization and audit.
--
-- Ownership: admin/supabase/migrations
-- Depends on 20260825120600_admin_create_access_control_and_audit_tables.sql
-- and all web-owned migrations. Browser clients have no direct table mutation
-- rights; protected server routes must validate the authenticated actor and use
-- the helpers below for exact permission checks.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, pg_temp
as $$
  select exists (
    select 1
    from public.admin_profiles profile
    join public.admin_role_assignments assignment on assignment.admin_user_id = profile.user_id
    where profile.user_id = auth.uid()
      and profile.status = 'active'
      and assignment.revoked_at is null
      and (assignment.expires_at is null or assignment.expires_at > timezone('utc', now()))
  );
$$;

create or replace function public.has_admin_permission(p_permission_key text)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, pg_temp
as $$
  select case
    when p_permission_key is null or p_permission_key !~ '^[a-z][a-z0-9_]{1,79}\.[a-z][a-z0-9_]{1,79}$' then false
    else exists (
      select 1
      from public.admin_profiles profile
      join public.admin_role_assignments assignment on assignment.admin_user_id = profile.user_id
      join public.role_permissions role_permission on role_permission.role_id = assignment.role_id
      join public.permissions permission on permission.id = role_permission.permission_id
      where profile.user_id = auth.uid()
        and profile.status = 'active'
        and assignment.revoked_at is null
        and (assignment.expires_at is null or assignment.expires_at > timezone('utc', now()))
        and permission.permission_key = p_permission_key
    )
  end;
$$;

-- Server-only exact check for a user whose identity was already validated by a
-- protected API route. It intentionally receives no browser execute grant.
create or replace function public.has_admin_permission_for_user(
  p_user_id uuid,
  p_permission_key text
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, pg_temp
as $$
  select case
    when p_user_id is null or p_permission_key is null
      or p_permission_key !~ '^[a-z][a-z0-9_]{1,79}\.[a-z][a-z0-9_]{1,79}$' then false
    else exists (
      select 1
      from public.admin_profiles profile
      join public.admin_role_assignments assignment on assignment.admin_user_id = profile.user_id
      join public.role_permissions role_permission on role_permission.role_id = assignment.role_id
      join public.permissions permission on permission.id = role_permission.permission_id
      where profile.user_id = p_user_id
        and profile.status = 'active'
        and assignment.revoked_at is null
        and (assignment.expires_at is null or assignment.expires_at > timezone('utc', now()))
        and permission.permission_key = p_permission_key
    )
  end;
$$;

-- Server-only helper for application events beyond trigger-covered role and
-- permission changes. Metadata is constrained to an object and must never
-- contain credentials, raw invite tokens, payment data, or private form bodies.
create or replace function public.write_audit_log(
  p_actor_user_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_old_values jsonb default null,
  p_new_values jsonb default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  audit_id uuid;
begin
  if p_action !~ '^[a-z][a-z0-9_.]{2,150}$'
    or p_entity_type !~ '^[a-z][a-z0-9_]{1,80}$'
    or jsonb_typeof(coalesce(p_metadata, '{}'::jsonb)) <> 'object' then
    raise exception 'invalid audit log input';
  end if;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, old_values, new_values, metadata
  ) values (
    p_actor_user_id, p_action, p_entity_type, p_entity_id, p_old_values, p_new_values,
    coalesce(p_metadata, '{}'::jsonb)
  ) returning id into audit_id;

  return audit_id;
end;
$$;

-- A browser caller has no table write grants, and this trigger also blocks any
-- authenticated session from assigning or changing its own role if a grant is
-- accidentally introduced later. Service-role routes must perform their own
-- actor authorization before writing because auth.uid() is absent for service
-- role database calls.
create or replace function public.prevent_self_admin_role_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
begin
  if auth.uid() is not null and new.admin_user_id = auth.uid() then
    raise exception 'users cannot assign or modify their own administrative roles';
  end if;
  return new;
end;
$$;

create or replace function public.audit_access_control_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  old_record jsonb;
  new_record jsonb;
  target_id uuid;
begin
  old_record := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end;
  new_record := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end;

  begin
    target_id := nullif(coalesce(new_record ->> 'id', old_record ->> 'id'), '')::uuid;
  exception when invalid_text_representation then
    target_id := null;
  end;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, old_values, new_values
  ) values (
    auth.uid(),
    'access.' || tg_table_name || '.' || lower(tg_op),
    tg_table_name,
    target_id,
    old_record,
    new_record
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger admin_role_assignments_prevent_self_change
  before insert or update on public.admin_role_assignments
  for each row execute function public.prevent_self_admin_role_change();

create trigger roles_audit_changes
  after insert or update or delete on public.roles
  for each row execute function public.audit_access_control_change();
create trigger permissions_audit_changes
  after insert or update or delete on public.permissions
  for each row execute function public.audit_access_control_change();
create trigger role_permissions_audit_changes
  after insert or update or delete on public.role_permissions
  for each row execute function public.audit_access_control_change();
create trigger admin_role_assignments_audit_changes
  after insert or update or delete on public.admin_role_assignments
  for each row execute function public.audit_access_control_change();

-- Administrative tables have no browser-readable private role, invitation,
-- audit, revision, or publishing data. Protected admin server routes use the
-- service role after checking public.has_admin_permission_for_user(...).
alter table public.admin_profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.admin_role_assignments enable row level security;
alter table public.admin_invitations enable row level security;
alter table public.audit_logs enable row level security;
alter table public.content_revisions enable row level security;
alter table public.publishing_activity enable row level security;

-- Browser clients can see only their own non-sensitive profile state. Audit,
-- revision, and publishing activity reads are available only to an actor with
-- the exact audit.read permission; no browser write policy exists for any
-- administrative table.
create policy admin_profiles_read_own
  on public.admin_profiles for select to authenticated
  using (user_id = auth.uid());
create policy audit_logs_read_with_permission
  on public.audit_logs for select to authenticated
  using (public.has_admin_permission('audit.read'));
create policy content_revisions_read_with_permission
  on public.content_revisions for select to authenticated
  using (public.has_admin_permission('audit.read'));
create policy publishing_activity_read_with_permission
  on public.publishing_activity for select to authenticated
  using (public.has_admin_permission('audit.read'));

revoke all on table
  public.admin_profiles,
  public.roles,
  public.permissions,
  public.role_permissions,
  public.admin_role_assignments,
  public.admin_invitations,
  public.audit_logs,
  public.content_revisions,
  public.publishing_activity
from anon, authenticated;

grant select on public.admin_profiles, public.audit_logs, public.content_revisions, public.publishing_activity to authenticated;

revoke all on function
  public.is_admin(),
  public.has_admin_permission(text),
  public.has_admin_permission_for_user(uuid, text),
  public.write_audit_log(uuid, text, text, uuid, jsonb, jsonb, jsonb),
  public.prevent_self_admin_role_change(),
  public.audit_access_control_change()
from public, anon, authenticated;

grant execute on function public.is_admin(), public.has_admin_permission(text) to authenticated;
grant execute on function public.has_admin_permission_for_user(uuid, text),
  public.write_audit_log(uuid, text, text, uuid, jsonb, jsonb, jsonb)
to service_role;

comment on function public.has_admin_permission(text) is
  'RLS-safe exact permission check for the currently authenticated user; browser clients cannot choose a target user.';
comment on function public.has_admin_permission_for_user(uuid, text) is
  'Server-only exact permission check for an identity already verified by a protected admin API route.';
