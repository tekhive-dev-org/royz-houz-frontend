-- Royz Houz web foundation: submission workflow administration.
--
-- Ownership: web/supabase/migrations
-- Adds workflow tracking to contact submissions and join applications:
-- workflow status, internal notes, and administrator assignment. Internal
-- notes and assignments are never exposed by any public projection.

alter table public.contact_submissions
  add column if not exists workflow_status text not null default 'new'
    check (workflow_status in ('new', 'reviewing', 'contacted', 'resolved', 'archived')),
  add column if not exists internal_notes text,
  add column if not exists assigned_to uuid references auth.users(id) on delete set null;

alter table public.join_applications
  add column if not exists workflow_status text not null default 'new'
    check (workflow_status in ('new', 'reviewing', 'contacted', 'resolved', 'archived')),
  add column if not exists internal_notes text,
  add column if not exists assigned_to uuid references auth.users(id) on delete set null;

create index contact_submissions_workflow_status_created_idx
  on public.contact_submissions (workflow_status, created_at desc);
create index contact_submissions_assigned_to_idx
  on public.contact_submissions (assigned_to);
create index join_applications_workflow_status_created_idx
  on public.join_applications (workflow_status, created_at desc);
create index join_applications_assigned_to_idx
  on public.join_applications (assigned_to);

comment on column public.contact_submissions.internal_notes is
  'Internal administrative notes. Never exposed publicly.';
comment on column public.join_applications.internal_notes is
  'Internal administrative notes. Never exposed publicly.';
