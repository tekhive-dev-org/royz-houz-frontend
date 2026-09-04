-- Royz Houz web foundation: donation record administrative notes.
--
-- Ownership: web/supabase/migrations
-- Adds an internal-notes field for donor record administration. Never exposed
-- by any public projection.

alter table public.donation_records
  add column if not exists internal_notes text;

comment on column public.donation_records.internal_notes is
  'Internal administrative notes. Never returned publicly.';
