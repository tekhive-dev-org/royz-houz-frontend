# Supabase Deployment

Both `web/` and `admin/` connect to the **same** Supabase project. The two applications keep independent `supabase/` directories because migration ownership is deliberately separated.

## Project structure

```text
web/supabase/
  config.toml
  migrations/      # Foundational public content schema (web-owned)
  seed.sql         # Representative LOCAL development data only

admin/supabase/
  config.toml
  migrations/      # Admin roles, permissions, audit, and extensions (admin-owned)
  seed.sql         # Local-only admin seed data
```

Rules:

- The same database object is never created in both directories.
- Migration filenames are globally unique and chronological because both histories target one database.
- `web/supabase/migrations` owns foundational/public content tables.
- `admin/supabase/migrations` owns admin roles, permissions, audit logs, and admin extensions.
- `docs/supabase-migration-ownership.md` lists every proposed database object and its owner.

## Migration execution order

All migrations apply in filename (timestamp) order. The complete order:

| Order | Migration | Owner |
|---|---|---|
| 1 | `20260825120000_web_create_foundational_content_types.sql` | web |
| 2 | `20260825120100_web_create_foundational_content_tables.sql` | web |
| 3 | `20260825120200_web_create_foundational_editorial_and_submission_tables.sql` | web |
| 4 | `20260825120300_web_add_foundation_foreign_key_indexes.sql` | web |
| 5 | `20260825120400_web_add_public_access_rls.sql` | web |
| 6 | `20260825120500_web_add_media_asset_references.sql` | web |
| 7 | `20260825120600_admin_create_access_control_and_audit_tables.sql` | admin |
| 8 | `20260825120700_admin_add_authorization_rls_and_audit_triggers.sql` | admin |
| 9 | `20260825120800_web_add_blog_comment_moderation.sql` | web |
| 10 | `20260825120900_web_add_donation_record_notes.sql` | web |
| 11 | `20260825121000_web_add_submission_workflow.sql` | web |
| 12 | `20260825121100_web_add_seo_administration.sql` | web |
| 13 | `20260825121200_admin_audit_admin_profiles.sql` | admin |
| 14 | `20260825121300_web_restrict_public_submission_rpcs.sql` | web |

Run `supabase db push` from the repository (or either app directory) and Supabase applies pending migrations in this exact order. Do not run migrations from `web/` and `admin/` out of order and do not apply the same migration twice.

## Linking and pushing

```bash
# One Supabase project, referenced by its project ref
supabase login
supabase link --project-ref <your-project-ref>

# Apply pending migrations (order is automatic)
supabase db push

# Inspect current migration status
supabase migration list
```

No project reference or credentials are hardcoded in the repository. The project ref is provided at link time.

## Environment variables (database-related)

Both apps need:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DATABASE_URL=
```

`SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_DATABASE_URL` are server-only and must never be exposed through `NEXT_PUBLIC_*` variables. The browser bundle only ever contains the URL and the anon key.

## Access model

- **Public content** (`talents`, `events`, `blog_posts`, `media_assets`, homepage/about sections, etc.) is readable anonymously **only** when `status = 'published'` and `published_at` has arrived. Draft, scheduled, archived, and future-published records are invisible to anonymous reads (RLS) and excluded by service filters.
- **Public submissions** (contact, join, blog comments, donation records) are written only through protected API routes. The submission functions reject `anon`/`authenticated` execution; the server uses the service-role key.
- **Admin data** (profiles, roles, permissions, audit logs, revisions, publishing activity) is never readable by browser roles. Access requires an active admin profile, active role assignment, and exact permissions checked server-side.

## Seeds and data migration

- `web/supabase/seed.sql` and `admin/supabase/seed.sql` are for **local development only**; they are idempotent and must never be run against a production database.
- `npm run content:export` (web) transforms existing constants into seed-compatible records and is dry-run by default.
- `npm run content:import` (web) performs the import only after explicit confirmation.
- Existing image URLs may remain external during the constants migration; assets are not uploaded to Cloudinary automatically.

## RLS verification

`web/supabase/rls-verification.sql` verifies:

- Anonymous users see only published content with an arrived publication time.
- Draft/scheduled/archived/future records are hidden.
- Direct anonymous CMS writes are denied.
- Private submission tables are unreadable anonymously.
- Anonymous submission-RPC calls are denied; service-role execution works.
- Invalid/excessive input is rejected.

It ends with `ROLLBACK` and must only be run against an approved local database.

## Safe operations

- Never run `supabase db reset` against the shared remote project.
- Never edit production data through the Supabase dashboard with the service-role key unless you understand the consequences.
- Keep the service-role key out of build logs, CI logs, and browser bundles.
- Rotate keys immediately if one is exposed.
