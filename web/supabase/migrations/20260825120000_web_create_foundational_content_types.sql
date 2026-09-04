-- Royz Houz web foundation: common database types and timestamp maintenance.
--
-- Ownership: web/supabase/migrations
-- This migration is additive. It creates only web-owned types and helper
-- functions; no existing data or remote database is modified by this file.

-- Published lifecycle shared by editorial content records.
do $$
begin
  create type public.content_status as enum (
    'draft',
    'scheduled',
    'published',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

-- Review lifecycle used by protected public submissions and blog comments.
do $$
begin
  create type public.review_status as enum (
    'pending',
    'approved',
    'rejected'
  );
exception
  when duplicate_object then null;
end $$;

-- Source platform for externally managed media. Cloudinary remains the media
-- delivery/upload provider; Supabase stores references and metadata only.
do $$
begin
  create type public.media_source as enum (
    'cloudinary',
    'youtube',
    'external'
  );
exception
  when duplicate_object then null;
end $$;

-- Renderable media category used by public adapters and collections.
do $$
begin
  create type public.media_type as enum (
    'image',
    'video',
    'audio',
    'document'
  );
exception
  when duplicate_object then null;
end $$;

-- Shared, web-owned timestamp trigger function. It never changes created_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Web-owned trigger helper that maintains updated_at timestamps on web-owned tables.';
