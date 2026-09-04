-- Royz Houz admin extension seed data.
--
-- This file seeds only server-authoritative role and permission definitions.
-- It intentionally does not create an auth user, admin profile, assignment,
-- invitation, or administrator email. Bootstrap the first administrator only
-- through an approved, audited server-side operational process.

insert into public.roles (role_key, name, description, is_system)
values
  ('super_admin', 'Super Admin', 'Full administrative access, including user and permission management.', true),
  ('administrator', 'Administrator', 'Operational content administration without super-admin bootstrap authority.', true),
  ('editor', 'Editor', 'Editorial content creation, editing, publishing, and media management.', true),
  ('author', 'Author', 'Draft content creation and editing without publish authority.', true),
  ('moderator', 'Moderator', 'Comment and public-submission moderation access.', true),
  ('viewer', 'Viewer', 'Read-only access to permitted administrative summaries.', true)
on conflict (role_key) do update
  set name = excluded.name,
      description = excluded.description,
      is_system = excluded.is_system;

insert into public.permissions (permission_key, description)
values
  ('settings.read', 'View site settings.'),
  ('settings.update', 'Update site settings.'),
  ('homepage.read', 'View homepage content configuration.'),
  ('homepage.update', 'Update homepage content configuration.'),
  ('talents.create', 'Create talent profiles.'),
  ('talents.update', 'Update talent profiles.'),
  ('talents.delete', 'Delete or archive talent profiles.'),
  ('events.create', 'Create events.'),
  ('events.update', 'Update events.'),
  ('events.delete', 'Delete or archive events.'),
  ('blog.create', 'Create blog posts.'),
  ('blog.update', 'Update blog posts.'),
  ('blog.publish', 'Publish, schedule, or unpublish blog posts.'),
  ('comments.moderate', 'Approve, reject, or remove blog comments.'),
  ('media.upload', 'Create media upload signatures and draft media records.'),
  ('media.update', 'Update media metadata and placements.'),
  ('media.delete', 'Decommission Cloudinary media through the protected workflow.'),
  ('donations.read', 'View protected donation records.'),
  ('donations.update', 'Update protected donation records and internal notes.'),
  ('donations.export', 'Export authorized donation records to CSV.'),
  ('contacts.read', 'View protected contact submissions.'),
  ('contacts.update', 'Update contact-submission workflow state.'),
  ('applications.read', 'View protected join applications.'),
  ('applications.update', 'Update join-application workflow state.'),
  ('reports.read', 'View private public-content reports.'),
  ('reports.moderate', 'Assign, resolve, dismiss, deduplicate, or archive content reports.'),
  ('bookings.read', 'View private Talent booking requests.'),
  ('bookings.update', 'Assign and update Talent booking request workflow.'),
  ('users.manage', 'Invite, assign, revoke, or manage administrative users.'),
  ('audit.read', 'View administrative audit and publishing activity logs.')
on conflict (permission_key) do update
  set description = excluded.description;

-- Super administrators receive every defined permission. Other roles receive
-- their minimum operational set; all enforcement remains in server/database
-- checks, never in client-supplied role claims.
insert into public.role_permissions (role_id, permission_id)
select role.id, permission.id
from public.roles role
cross join public.permissions permission
where role.role_key = 'super_admin'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select role.id, permission.id
from public.roles role
join public.permissions permission on permission.permission_key = any (
  case role.role_key
    when 'administrator' then array[
      'settings.read', 'settings.update', 'homepage.read', 'homepage.update',
      'talents.create', 'talents.update', 'talents.delete',
      'events.create', 'events.update', 'events.delete',
      'blog.create', 'blog.update', 'blog.publish', 'comments.moderate',
      'media.upload', 'media.update', 'media.delete',
      'donations.read', 'donations.update', 'donations.export', 'contacts.read', 'contacts.update',
      'applications.read', 'applications.update', 'reports.read', 'reports.moderate', 'bookings.read', 'bookings.update', 'audit.read'
    ]
    when 'editor' then array[
      'settings.read', 'homepage.read', 'homepage.update',
      'talents.create', 'talents.update', 'events.create', 'events.update',
      'blog.create', 'blog.update', 'blog.publish', 'comments.moderate',
      'media.upload', 'media.update', 'media.delete', 'reports.read', 'audit.read'
    ]
    when 'author' then array[
      'settings.read', 'homepage.read', 'talents.create', 'talents.update',
      'events.create', 'events.update', 'blog.create', 'blog.update',
      'media.upload', 'media.update'
    ]
    when 'moderator' then array[
      'comments.moderate', 'contacts.read', 'contacts.update',
      'applications.read', 'applications.update', 'reports.read', 'reports.moderate', 'bookings.read', 'bookings.update'
    ]
    when 'viewer' then array['settings.read', 'homepage.read', 'audit.read']
    else array[]::text[]
  end
)
where role.role_key in ('administrator', 'editor', 'author', 'moderator', 'viewer')
on conflict do nothing;
