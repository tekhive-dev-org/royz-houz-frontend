-- Royz Houz admin extension: access control, audit, revision, and publishing tables.
--
-- Ownership: admin/supabase/migrations
-- Depends on all web foundation migrations through 20260825120500. This is
-- additive and references auth.users plus web-owned public.content_status;
-- it does not recreate any web-owned content table or helper.

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 160),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  role_key text not null unique check (role_key ~ '^[a-z][a-z0-9_]{2,80}$'),
  name text not null unique check (char_length(trim(name)) between 1 and 100),
  description text,
  is_system boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text not null unique check (permission_key ~ '^[a-z][a-z0-9_]{1,79}\.[a-z][a-z0-9_]{1,79}$'),
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  primary key (role_id, permission_id)
);

create table public.admin_role_assignments (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint admin_role_assignments_dates check (
    (expires_at is null or expires_at > assigned_at)
    and (revoked_at is null or revoked_at >= assigned_at)
  )
);

-- Invitation tokens are stored only as a hash. A raw invitation token must
-- never be persisted, returned to a browser, or copied into audit metadata.
create table public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null check (
    char_length(trim(email)) between 3 and 254
    and email = lower(email)
    and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  role_id uuid not null references public.roles(id) on delete restrict,
  invitation_token_hash text not null unique check (char_length(invitation_token_hash) between 32 and 255),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  invited_by uuid references auth.users(id) on delete set null,
  accepted_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint admin_invitations_dates check (
    expires_at > created_at
    and (accepted_at is null or accepted_at >= created_at)
    and (revoked_at is null or revoked_at >= created_at)
  )
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action ~ '^[a-z][a-z0-9_.]{2,150}$'),
  entity_type text not null check (entity_type ~ '^[a-z][a-z0-9_]{1,80}$'),
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default timezone('utc', now())
);

-- Generic revisions deliberately do not add foreign keys to web-owned content
-- tables because a revision can represent any admin-managed entity. Services
-- must validate content_type against their own allowlist before writing.
create table public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type ~ '^[a-z][a-z0-9_]{1,80}$'),
  content_id uuid not null,
  revision_number integer not null check (revision_number > 0),
  action text not null check (action in ('created', 'updated', 'scheduled', 'published', 'archived', 'restored')),
  snapshot jsonb not null check (jsonb_typeof(snapshot) in ('object', 'array')),
  change_summary text check (char_length(change_summary) <= 1000),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint content_revisions_content_revision_unique unique (content_type, content_id, revision_number)
);

create table public.publishing_activity (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type ~ '^[a-z][a-z0-9_]{1,80}$'),
  content_id uuid not null,
  action text not null check (action in ('created', 'updated', 'scheduled', 'published', 'unpublished', 'archived')),
  previous_status public.content_status,
  new_status public.content_status,
  scheduled_for timestamptz,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  performed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint publishing_activity_status_change check (
    previous_status is distinct from new_status or action in ('created', 'updated')
  )
);

create unique index admin_role_assignments_active_unique
  on public.admin_role_assignments (admin_user_id, role_id)
  where revoked_at is null;
create unique index admin_invitations_pending_email_unique
  on public.admin_invitations (email)
  where status = 'pending';
create index admin_role_assignments_active_user_idx
  on public.admin_role_assignments (admin_user_id, role_id)
  where revoked_at is null;
create index role_permissions_permission_idx on public.role_permissions (permission_id, role_id);
create index admin_invitations_status_expires_idx on public.admin_invitations (status, expires_at);
create index audit_logs_actor_created_idx on public.audit_logs (actor_user_id, created_at desc);
create index audit_logs_entity_created_idx on public.audit_logs (entity_type, entity_id, created_at desc);
create index content_revisions_content_created_idx on public.content_revisions (content_type, content_id, created_at desc);
create index publishing_activity_content_created_idx on public.publishing_activity (content_type, content_id, created_at desc);
create index publishing_activity_action_created_idx on public.publishing_activity (action, created_at desc);

create trigger admin_profiles_set_updated_at before update on public.admin_profiles
  for each row execute function public.set_updated_at();
create trigger roles_set_updated_at before update on public.roles
  for each row execute function public.set_updated_at();
create trigger permissions_set_updated_at before update on public.permissions
  for each row execute function public.set_updated_at();
create trigger admin_role_assignments_set_updated_at before update on public.admin_role_assignments
  for each row execute function public.set_updated_at();
create trigger admin_invitations_set_updated_at before update on public.admin_invitations
  for each row execute function public.set_updated_at();

comment on table public.admin_profiles is 'Admin-owned profile state separate from auth.users identity data.';
comment on table public.audit_logs is 'Append-only operational audit log. Do not store secrets, raw invitation tokens, payment data, or private form bodies.';
comment on table public.content_revisions is 'Admin-owned immutable revision snapshots for any validated admin-managed content entity.';
comment on table public.publishing_activity is 'Admin-owned publication lifecycle activity for admin-managed content entities.';
