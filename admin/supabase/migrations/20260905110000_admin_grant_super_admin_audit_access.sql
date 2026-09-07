insert into public.permissions (permission_key, description)
values ('audit.read', 'View administrative audit and publishing activity logs.')
on conflict (permission_key) do update
set description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select role.id, permission.id
from public.roles role
cross join public.permissions permission
where role.role_key = 'super_admin'
  and permission.permission_key = 'audit.read'
on conflict do nothing;
