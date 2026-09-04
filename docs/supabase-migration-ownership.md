# Supabase Migration Ownership and Execution Order

**Shared target:** `web/` and `admin/` target the same approved remote Supabase project.  
**Migration history:** Global across both applications. Migration timestamps must be globally unique.  
**Remote safety:** This repository setup does not link, reset, push to, or otherwise modify an existing remote database.

---

## Ownership boundary

| Directory | Owner | Scope |
|---|---|---|
| `web/supabase/migrations/` | Public website foundation | Foundational site/content tables, public submission records, content/media integrity, web-owned trigger functions, indexes, and RLS enablement. |
| `admin/supabase/migrations/` | Administrative extensions | Admin roles, permissions, role assignments, authorization functions, audit logs, and admin-only RLS/policies/extensions. |

A database object has one owner. The other application may reference that object when necessary, but must not recreate or duplicate it. Platform-managed `auth`, `storage`, `realtime`, `extensions`, and `graphql_public` schema objects are not application-owned and must not be recreated.

---

## Implemented web-owned objects

The following objects are created only in `web/supabase/migrations/`.

### Types and helper function

| Object | Type | Owner | Migration |
|---|---|---|---|
| `public.content_status` | Enum: `draft`, `scheduled`, `published`, `archived` | `web` | `20260825120000` |
| `public.review_status` | Enum: `pending`, `approved`, `rejected` | `web` | `20260825120000` |
| `public.media_source` | Enum: `cloudinary`, `youtube`, `external` | `web` | `20260825120000` |
| `public.media_type` | Enum: `image`, `video`, `audio`, `document` | `web` | `20260825120000` |
| `public.set_updated_at()` | Trigger function | `web` | `20260825120000` |

### Global site and static-page content

| Object | Type | Owner | Purpose |
|---|---|---|---|
| `public.site_settings` | Table | `web` | Named public site settings and global content. |
| `public.navigation_items` | Table | `web` | Header/utility navigation. |
| `public.footer_sections` | Table | `web` | Footer content sections. |
| `public.footer_links` | Table | `web` | Footer section links. |
| `public.social_links` | Table | `web` | Public social links by placement. |
| `public.homepage_sections` | Table | `web` | Homepage section content and ordering. |
| `public.about_sections` | Table | `web` | About page section content and ordering. |
| `public.seo_metadata` | Table | `web` | Explicit one-to-one SEO metadata for supported content targets. |

### Talents and events

| Object | Type | Owner | Purpose |
|---|---|---|---|
| `public.talents` | Table | `web` | Public talent profiles. |
| `public.talent_categories` | Table | `web` | Talent taxonomy. |
| `public.talent_category_assignments` | Join table | `web` | Talent/category relations and primary category. |
| `public.events` | Table | `web` | Public event content. |
| `public.event_categories` | Table | `web` | Event taxonomy. |
| `public.event_category_assignments` | Join table | `web` | Event/category relations and primary category. |

### Blog and public comments

| Object | Type | Owner | Purpose |
|---|---|---|---|
| `public.blog_authors` | Table | `web` | Public editorial author profiles. |
| `public.blog_categories` | Table | `web` | Blog taxonomy. |
| `public.blog_posts` | Table | `web` | Journal posts and structured body content. |
| `public.blog_post_categories` | Join table | `web` | Post/category relations and primary category. |
| `public.blog_comments` | Table | `web` | Moderated public comments and same-post replies. |

### Media

| Object | Type | Owner | Purpose |
|---|---|---|---|
| `public.media_assets` | Table | `web` | Cloudinary/YouTube/external metadata and references only. |
| `public.media_collections` | Table | `web` | Media playlists/curated collections. |
| `public.media_collection_items` | Join table | `web` | Ordered collection/media membership. |
| `public.media_asset_references` | Table | `web` | Explicit content/media usage registry used by safe replacement and deletion workflows. |

### Campaigns and protected public submissions

| Object | Type | Owner | Purpose |
|---|---|---|---|
| `public.donation_campaigns` | Table | `web` | Public donation campaign content. |
| `public.donation_records` | Table | `web` | Protected donation record; no payment-provider or checkout data. |
| `public.contact_submissions` | Table | `web` | Protected contact-form submissions. |
| `public.join_applications` | Table | `web` | Protected talent/join applications. |
| `public.content_reports` | Table | `web` | Private reports against published Talent productions and Media Library assets. |
| `public.booking_requests` | Table | `web` | Protected Talent booking inquiries; no payment or checkout data. |

### Supporting objects

| Object class | Owner | Purpose |
|---|---|---|
| `set_updated_at` triggers on mutable web tables | `web` | Automatic UTC `updated_at` maintenance. |
| Slug, status/publication, relation, and actor indexes | `web` | Lookup performance and foreign-key maintenance. |
| Check constraints and unique constraints | `web` | Slug, lifecycle, media-source, date, amount, email/reference, and relation integrity. |
| RLS policies and grants on all web-owned tables | `web` | Published-only public reads, no public CMS writes, and no public reads of protected submissions. |
| `public.submit_contact_submission(...)` | Security-definer function | `web` | Explicit public contact input boundary; creates pending records only. |
| `public.submit_join_application(...)` | Security-definer function | `web` | Explicit public join-application boundary; generates protected reference/status values. |
| `public.submit_blog_comment(...)` | Security-definer function | `web` | Explicit public comment boundary; creates pending comments only. |
| `public.submit_content_report(...)` | Security-definer function | `web` | Service-role-only, idempotent report submission boundary for published media. |
| `public.submit_booking_request(...)` | Security-definer function | `web` | Service-role-only, idempotent booking inquiry boundary with server-generated reference. |
| `public.get_published_blog_comments(uuid)` | Security-definer function | `web` | Safe comment projection that omits private email/audit data. |
| `public.published_homepage_content` | Security-invoker view | `web` | Published homepage projection. |
| `public.published_events` | Security-invoker view | `web` | Published event projection. |
| `public.published_blog_posts` | Security-invoker view | `web` | Published blog post projection. |
| `public.published_media` | Security-invoker view | `web` | Published media projection. |
| `public.published_talents` | Security-invoker view | `web` | Published talent projection. |
| `public.public_site_settings` | Security-invoker view | `web` | Published public site-settings projection. |

---

## Implemented admin-owned objects

The following are created only in `admin/supabase/migrations/` after all web foundation migrations:

| Object | Type | Owner | Purpose |
|---|---|---|---|
| `public.admin_profiles` | Table | `admin` | Admin-specific profile and activation state for `auth.users` identities. |
| `public.roles` | Table | `admin` | Server-authoritative system role definitions. |
| `public.permissions` | Table | `admin` | Server-authoritative granular permission definitions. |
| `public.role_permissions` | Join table | `admin` | Role/permission mapping. |
| `public.admin_role_assignments` | Table | `admin` | Audited, revocable role assignments. |
| `public.admin_invitations` | Table | `admin` | Hashed-token administrative invitations. |
| `public.audit_logs` | Table | `admin` | Append-only sensitive-action audit log. |
| `public.content_revisions` | Table | `admin` | Immutable generic content revision snapshots. |
| `public.publishing_activity` | Table | `admin` | Content publication lifecycle activity. |
| `public.is_admin()` | Function | `admin` | Current-user server/database admin-status check. |
| `public.has_admin_permission(text)` | Function | `admin` | Current-user exact permission check. |
| `public.has_admin_permission_for_user(uuid, text)` | Function | `admin` | Server-only exact permission check for a verified actor. |
| `public.write_audit_log(...)` | Function | `admin` | Server-only structured audit writer. |
| `reports.read`, `reports.moderate` | Permissions | `admin` | Exact read and moderation authorization for private reports. |
| `bookings.read`, `bookings.update` | Permissions | `admin` | Exact read and workflow authorization for private booking inquiries. |
| `public.admin_moderate_content_report(...)` | Function | `admin` | Permission-checked atomic report workflow update and redacted audit write. |
| `public.admin_update_booking_request(...)` | Function | `admin` | Permission-checked atomic booking workflow update and redacted audit write. |
| Admin RLS policies, self-assignment guard, indexes, and audit triggers | Database objects | `admin` | Browser lock-down and sensitive access-control change auditing. |

---

## Explicit exclusions

No migration in either application may create merchandise objects in this phase, including:

- products or product variants
- inventory
- carts
- merchandise orders
- checkout or payment tables
- shipping, fulfillment, refunds, or product reviews

`media_assets` stores Cloudinary/YouTube metadata and URLs only. It contains no `bytea`, blob, or media-file payload column; long media files stay with Cloudinary and are not placed in Supabase Storage by this foundation migration.

---

## Migration execution order

### Migration source order (not applied to a remote database in this task)

```text
20260825120000_web_create_foundational_content_types.sql
20260825120100_web_create_foundational_content_tables.sql
20260825120200_web_create_foundational_editorial_and_submission_tables.sql
20260825120300_web_add_foundation_foreign_key_indexes.sql
20260825120400_web_add_public_access_rls.sql
20260825120500_web_add_media_asset_references.sql
20260825120600_admin_create_access_control_and_audit_tables.sql
20260825120700_admin_add_authorization_rls_and_audit_triggers.sql
20260825120800_web_add_blog_comment_moderation.sql
20260825120900_web_add_donation_record_notes.sql
20260825121000_web_add_submission_workflow.sql
20260825121100_web_add_seo_administration.sql
20260825121200_admin_audit_admin_profiles.sql
20260825121300_web_restrict_public_submission_rpcs.sql
20260825121400_web_add_content_reporting.sql
20260825121500_admin_add_content_report_moderation.sql
20260825121600_web_add_booking_requests.sql
20260825121700_admin_add_booking_management.sql
```

Future migrations must receive globally unique timestamps later than `20260825121700` and execute after all migrations on which they depend. The admin report moderation migration must run after the web-owned content-report table migration. The booking migration is web-owned and must be deployed before any future admin booking-management extension.

### Filename rule

```text
YYYYMMDDHHMMSS_<owner>_<descriptive_name>.sql
```

- Timestamps are globally unique across `web/` and `admin/`.
- Sort and execute all `web` foundational migrations before a dependent `admin` extension migration.
- Do not create the same table, enum, function, trigger, index, policy, or constraint in both folders.

---

## Local linking and migration commands

Install the Supabase CLI separately. The committed `config.toml` files contain no project reference or credentials.

### Inspect/link each local checkout to the same approved remote project

```bash
cd web
supabase link --project-ref <remote-project-ref>
supabase migration list

cd ../admin
supabase link --project-ref <remote-project-ref>
supabase migration list
```

Use the real project reference only in local commands. Do not commit it to config/source/docs.

### Future migration creation

```bash
cd web
supabase migration new web_descriptive_change

cd ../admin
supabase migration new admin_descriptive_change
```

### Approved remote deployment only

The following commands modify a remote database and were **not run** in this task. Use them only after change approval, backup/history review, and cross-directory ownership review:

```bash
cd web
supabase db push

cd ../admin
supabase db push
```

Never run `supabase db reset` against an existing remote project.
