-- Royz Houz web RLS verification queries.
--
-- Run only against an approved LOCAL Supabase database after applying the web
-- migrations. Execute as a database owner/service role with psql so SET ROLE
-- can switch to `anon`. The script ends with ROLLBACK and leaves no test data.
-- Do not run it against an existing production remote database.

\set ON_ERROR_STOP on

begin;

-- Create controlled content fixtures before switching to the anonymous role.
insert into public.talents (slug, title, status, published_at, scheduled_at)
values
  ('rls-verification-published-talent', 'Published verification talent', 'published', timezone('utc', now()), null),
  ('rls-verification-draft-talent', 'Draft verification talent', 'draft', null, null),
  ('rls-verification-scheduled-talent', 'Scheduled verification talent', 'scheduled', null, timezone('utc', now()) + interval '1 day'),
  ('rls-verification-archived-talent', 'Archived verification talent', 'archived', timezone('utc', now()) - interval '1 day', null),
  ('rls-verification-future-talent', 'Future verification talent', 'published', timezone('utc', now()) + interval '1 day', null);

insert into public.blog_posts (slug, title, status, published_at)
values ('rls-verification-post', 'RLS verification post', 'published', timezone('utc', now()));

insert into public.blog_comments (blog_post_id, author_name, author_email, body, status, published_at)
select id, 'Approved commenter', 'approved@example.test', 'Approved verification comment.', 'approved', timezone('utc', now())
from public.blog_posts where slug = 'rls-verification-post';

insert into public.blog_comments (blog_post_id, author_name, author_email, body, status)
select id, 'Pending commenter', 'pending@example.test', 'Pending verification comment.', 'pending'
from public.blog_posts where slug = 'rls-verification-post';

insert into public.blog_comments (blog_post_id, author_name, author_email, body, status)
select id, 'Rejected commenter', 'rejected@example.test', 'Rejected verification comment.', 'rejected'
from public.blog_posts where slug = 'rls-verification-post';

-- Confirm anonymous users can read content only after publication time arrives.
set local role anon;

select exists (
  select 1 from public.talents where slug = 'rls-verification-published-talent'
) as published_talent_visible;
-- Expected: true

select exists (
  select 1 from public.talents where slug = 'rls-verification-draft-talent'
) as draft_talent_visible;
-- Expected: false



select count(*) = 0 as non_public_lifecycle_states_hidden
from public.talents
where slug in (
  'rls-verification-scheduled-talent',
  'rls-verification-archived-talent',
  'rls-verification-future-talent'
);
-- Expected: true

-- Direct CMS changes must be denied for anonymous users.
\set ON_ERROR_STOP off
savepoint anonymous_cms_write;
update public.talents
set title = 'This update must fail'
where slug = 'rls-verification-published-talent';
-- Expected: ERROR permission denied for table talents
rollback to savepoint anonymous_cms_write;

-- Protected submission tables must not be readable by anonymous users.
savepoint anonymous_private_read;
select * from public.donation_records;
-- Expected: ERROR permission denied for table donation_records
rollback to savepoint anonymous_private_read;

savepoint anonymous_private_contact_read;
select * from public.contact_submissions;
-- Expected: ERROR permission denied for table contact_submissions
rollback to savepoint anonymous_private_contact_read;

savepoint anonymous_private_join_read;
select * from public.join_applications;
-- Expected: ERROR permission denied for table join_applications
rollback to savepoint anonymous_private_join_read;

-- Comment emails remain private because direct comment-table reads are denied.
savepoint anonymous_comment_email_read;
select author_email from public.blog_comments;
-- Expected: ERROR permission denied for table blog_comments
rollback to savepoint anonymous_comment_email_read;

\set ON_ERROR_STOP on

select count(*) = 1 as only_approved_comment_visible
from public.get_published_blog_comments(
  (select id from public.blog_posts where slug = 'rls-verification-post')
);
-- Expected: true

-- Anonymous clients cannot bypass API-layer validation and rate limiting by
-- invoking protected submission RPCs directly.
\set ON_ERROR_STOP off
savepoint anonymous_submission_rpc;
select public.submit_contact_submission(
  'RLS',
  'Verifier',
  'rls.verifier@example.test',
  '+2348000000000',
  'NG',
  'General Inquiry',
  'This submission must be denied to anonymous callers.'
);
-- Expected: ERROR permission denied for function submit_contact_submission
rollback to savepoint anonymous_submission_rpc;
\set ON_ERROR_STOP on

-- The web API's service-role boundary may invoke the restricted functions.
set local role service_role;

select public.submit_contact_submission(
  'RLS',
  'Verifier',
  'rls.verifier@example.test',
  '+2348000000000',
  'NG',
  'General Inquiry',
  'This is a valid rollback-only RLS verification submission.'
) as contact_submission_id;
-- Expected: one UUID

-- Valid join submission uses only the explicit RPC parameters. The function
-- returns a UUID while keeping its generated reference and status private.
select public.submit_join_application(
  'RLS Applicant',
  null,
  'rls.applicant@example.test',
  '+2348000000001',
  null,
  'Lagos',
  'musician',
  null,
  'emerging',
  '1-2 years',
  'A valid rollback-only verification biography.',
  'Afrobeats',
  '[]'::jsonb,
  '[]'::jsonb,
  '{}'::jsonb,
  '{}'::jsonb,
  true
) as join_application_id;
-- Expected: one UUID

-- Invalid and excessive input must be rejected by the function. Keep psql from
-- stopping so the remaining rollback completes after the expected errors.
\set ON_ERROR_STOP off
savepoint invalid_contact_submission;
select public.submit_contact_submission(
  '',
  null,
  'invalid-email',
  null,
  'NGA',
  null,
  repeat('x', 601)
);
-- Expected: ERROR describing the invalid explicit field(s)
rollback to savepoint invalid_contact_submission;

set local role anon;

savepoint direct_submission_insert;
insert into public.contact_submissions (first_name, email, message, status)
values ('Bypass', 'bypass@example.test', 'Direct inserts must be denied.', 'approved');
-- Expected: ERROR permission denied for table contact_submissions
rollback to savepoint direct_submission_insert;

savepoint excessive_join_payload;
select public.submit_join_application(
  'RLS Applicant', null, 'rls.applicant@example.test', '+2348000000001',
  null, null, 'musician', null, null, null, 'Valid biography.', null,
  jsonb_build_array(to_jsonb(repeat('x', 17000))), '[]'::jsonb,
  '{}'::jsonb, '{}'::jsonb, true
);
-- Expected: ERROR application JSON payload exceeds permitted item or size limits
rollback to savepoint excessive_join_payload;

\set ON_ERROR_STOP on
rollback;
