-- Royz Houz admin extension: audit admin profile lifecycle.
--
-- Ownership: admin/supabase/migrations
-- Records account activation/deactivation and profile changes in the audit log.
-- The generic audit trigger runs for inserts, updates, and deletes.

create or replace function public.audit_admin_profile_change()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
begin
  insert into public.audit_logs (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  ) values (
    auth.uid(),
    'admin_profiles.' || lower(tg_op),
    'admin_profiles',
    coalesce(new.user_id, old.user_id),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger admin_profiles_audit_changes
  after insert or update or delete on public.admin_profiles
  for each row execute function public.audit_admin_profile_change();
