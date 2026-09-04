-- Royz Houz admin extension: protected Talent booking management.
-- Depends on web booking_requests and existing admin authorization/audit objects.

insert into public.permissions (permission_key, description)
values
  ('bookings.read', 'View private Talent booking requests.'),
  ('bookings.update', 'Assign and update Talent booking request workflow.')
on conflict (permission_key) do update set description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select role.id, permission.id
from public.roles role
cross join public.permissions permission
where role.role_key in ('super_admin', 'administrator', 'moderator')
  and permission.permission_key in ('bookings.read', 'bookings.update')
on conflict do nothing;

create or replace function public.admin_update_booking_request(
  p_actor_user_id uuid,
  p_booking_id uuid,
  p_workflow_status text default null,
  p_assigned_to uuid default null,
  p_set_assignment boolean default false,
  p_internal_notes text default null,
  p_set_internal_notes boolean default false
)
returns public.booking_requests
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  previous_booking public.booking_requests;
  updated_booking public.booking_requests;
  next_status text;
begin
  if not public.has_admin_permission_for_user(p_actor_user_id, 'bookings.update') then
    raise exception 'permission denied';
  end if;

  select * into previous_booking from public.booking_requests
  where id = p_booking_id for update;
  if not found then raise exception 'booking request not found'; end if;

  next_status := coalesce(p_workflow_status, previous_booking.workflow_status);
  if next_status not in ('new', 'reviewing', 'contacted', 'confirmed', 'declined', 'cancelled', 'archived') then
    raise exception 'invalid booking status';
  end if;
  if char_length(coalesce(p_internal_notes, '')) > 5000 then raise exception 'internal notes too long'; end if;
  if p_set_assignment and p_assigned_to is not null and not exists (
    select 1 from public.admin_profiles where user_id = p_assigned_to and status = 'active'
  ) then raise exception 'assignee is not active'; end if;

  update public.booking_requests set
    workflow_status = next_status,
    assigned_to = case when p_set_assignment then p_assigned_to else assigned_to end,
    internal_notes = case when p_set_internal_notes then nullif(trim(coalesce(p_internal_notes, '')), '') else internal_notes end,
    updated_by = p_actor_user_id
  where id = p_booking_id
  returning * into updated_booking;

  perform public.write_audit_log(
    p_actor_user_id,
    'booking_requests.update',
    'booking_requests',
    p_booking_id,
    jsonb_build_object('workflow_status', previous_booking.workflow_status, 'assigned_to', previous_booking.assigned_to, 'has_internal_notes', previous_booking.internal_notes is not null),
    jsonb_build_object('workflow_status', updated_booking.workflow_status, 'assigned_to', updated_booking.assigned_to, 'has_internal_notes', updated_booking.internal_notes is not null),
    '{}'::jsonb
  );
  return updated_booking;
end;
$$;

revoke all on function public.admin_update_booking_request(uuid, uuid, text, uuid, boolean, text, boolean)
  from public, anon, authenticated;
grant execute on function public.admin_update_booking_request(uuid, uuid, text, uuid, boolean, text, boolean)
  to service_role;
