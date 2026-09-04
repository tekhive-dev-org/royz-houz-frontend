-- Royz Houz web foundation: SEO administration extensions.
--
-- Ownership: web/supabase/migrations
-- Adds follow/noindex robot directives and structured data support, and allows
-- canonical records to be either relative paths or absolute URLs.

alter table public.seo_metadata
  add column if not exists no_follow boolean not null default false,
  add column if not exists structured_data jsonb;

alter table public.seo_metadata
  drop constraint if exists seo_metadata_canonical_path_check;

alter table public.seo_metadata
  add constraint seo_metadata_canonical_path_check check (
    canonical_path is null
    or canonical_path ~ '^\/'
    or canonical_path ~ '^https:\/\/'
  );

comment on column public.seo_metadata.no_follow is
  'When true, robots are instructed not to follow links on this page.';
comment on column public.seo_metadata.structured_data is
  'Optional JSON-LD structured data object for this content record.';
