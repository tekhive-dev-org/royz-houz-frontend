-- Royz Houz web foundation: explicit media usage registry.
--
-- Ownership: web/supabase/migrations
-- This additive registry lets server-side media deletion block assets still
-- referenced by content. It stores references only, never media bytes.

create table public.media_asset_references (
  id uuid primary key default gen_random_uuid(),
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  content_type text not null check (content_type ~ '^[a-z_]{2,80}$'),
  content_id uuid not null,
  field_path text not null check (char_length(trim(field_path)) between 1 and 300),
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  constraint media_asset_references_unique unique (media_asset_id, content_type, content_id, field_path)
);

comment on table public.media_asset_references is
  'Web-owned explicit media/content reference registry. Admin media workflows must register a reference before publishing content and remove it only after safe replacement.';
comment on column public.media_asset_references.field_path is
  'Logical content field path (for example body.hero.image) used for safe replacement and deletion checks.';

create index media_asset_references_asset_id_idx on public.media_asset_references (media_asset_id);
create index media_asset_references_content_lookup_idx on public.media_asset_references (content_type, content_id);

-- This registry is operational metadata. No anonymous or authenticated public
-- access is granted; protected server/admin operations use a service role until
-- admin-owned authorization policies are introduced.
alter table public.media_asset_references enable row level security;
