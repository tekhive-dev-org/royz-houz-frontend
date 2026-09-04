-- Royz Houz web foundation: blog comment moderation extensions.
--
-- Ownership: web/supabase/migrations
-- Extends the web-owned blog_comments moderation workflow with spam and hidden
-- states plus internal moderation notes. Additive only.

-- Add moderation states to the shared review_status enum.
alter type public.review_status add value if not exists 'spam';
alter type public.review_status add value if not exists 'hidden';

-- Internal moderation notes. These are administrative-only and never exposed by
-- the public comment projection.
alter table public.blog_comments
  add column if not exists moderation_notes text;

comment on column public.blog_comments.moderation_notes is
  'Internal moderation notes. Never returned by the public comment projection.';
