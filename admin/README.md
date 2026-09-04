# Royz Houz Admin

Independent Next.js 14 **Pages Router** administration application for the Royz Houz platform.

## Current scope

This unit establishes a secure administration foundation:

- Next.js Pages Router and JavaScript
- Material UI with component-scoped CSS Modules
- Absolute `@/` imports
- Independent scripts and environment files
- A protected admin landing page and neutral foundation content
- Supabase password sign-in, sign-out, session restoration, expiry handling, and safe same-origin redirects
- An unauthorized state for authenticated users without active administrative access
- Server-authoritative profile, role, and exact-permission authorization helpers
- Read-only `GET /api/admin/health` and protected `GET /api/admin/auth/session` endpoints
- Admin-owned Supabase configuration and authorization/audit migration source

It intentionally does **not** include OAuth, Cloudinary uploads, dashboard CRUD modules, or merchandise management. Password authentication uses Supabase Auth, but an authenticated account remains denied unless it has an active `admin_profiles` row and an active role assignment. The committed migrations must be applied through the approved process before access can be granted. The future Merchandise admin navigation entry must be a **Coming Soon** state only, with no merchandise tables, forms, APIs, queries, or migrations.

## Prerequisites

- Node.js 18 or later
- npm 9 or later

## Run the public website (`web/`)

```bash
cd web
npm install
npm run dev
```

The public website runs at [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run build
npm run start
```

## Run the admin application (`admin/`)

```bash
cd admin
npm install
npm run dev
```

The admin application runs at [http://localhost:3001](http://localhost:3001).

```bash
npm run lint
npm run build
npm run start
```

`dev` and `start` use port `3001`, allowing the two applications to run independently at the same time.

## Environment setup

```bash
cd admin
cp .env.example .env.local
```

`.env.local` is ignored by Git and must never be committed. Do not add real credentials to `.env.example`.

`admin/` and `web/` connect to the **same Supabase project** when integrations are enabled, but each application owns its own `.env.local`, `.env.example`, and runtime validation utilities. This foundation does not connect to Supabase or Cloudinary yet, so the validators are not invoked by the landing page.

### Public browser-safe variables

| Variable | Required locally | Required in production | Purpose |
|---|---:|---:|---|
| `NEXT_PUBLIC_ADMIN_URL` | Yes (`http://localhost:3001`) | Yes | Canonical admin dashboard URL. |
| `NEXT_PUBLIC_WEB_URL` | Yes (`http://localhost:3000`) | Yes | Canonical public website URL used by admin links. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes when an admin Supabase feature is enabled | Yes | Shared Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes when an admin Supabase feature is enabled | Yes | Public Supabase anonymous key. |

Only `NEXT_PUBLIC_*` variables can be included in browser bundles. Do not place a service-role key, database URL, Cloudinary API key, Cloudinary secret, or other administrative credential in a public variable.

### Server-only variables

| Variable | Required locally | Required in production | Purpose |
|---|---:|---:|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Yes when protected admin operations are enabled | Yes | Server-only Supabase administrative operations. |
| `SUPABASE_DATABASE_URL` | Only when a server service requires a direct database connection | As required by deployed server services | Direct server database connection; never expose to the browser. |
| `CLOUDINARY_CLOUD_NAME` | Yes when server-side Cloudinary media operations are enabled | Yes | Cloudinary account identifier. |
| `CLOUDINARY_API_KEY` | Yes when server-side Cloudinary media operations are enabled | Yes | Cloudinary server credential. |
| `CLOUDINARY_API_SECRET` | Yes when server-side Cloudinary media operations are enabled | Yes | Cloudinary secret. |

Use `@/lib/env/client` only from browser-safe code. Use `@/lib/env/server` only from protected API routes or server-side services. The public validator intentionally does not read server-only variables, and server configuration errors name invalid keys without printing values.

The public foundational schema belongs in `web/supabase/migrations/`. `admin/supabase/migrations/` may only add admin-specific extensions and must not duplicate public schema objects.

### Admin authorization migration foundation

`admin/supabase/migrations/` now owns `admin_profiles`, roles, permissions, role assignments, invitations, audit logs, revisions, and publishing activity. It provides exact database permission checks, browser write lock-down via RLS, self-role-assignment prevention, and audit triggers for role/permission changes.

`admin/supabase/seed.sql` seeds only system role and permission definitions. It deliberately creates **no** administrator profile, assignment, invitation, or email. Provision the initial administrator only through an approved protected server-side process after the migrations have been applied.

### Authentication and authorization flow

- `pages/login.js` uses Supabase password sign-in only; OAuth is not configured.
- `pages/index.js` uses an SSR guard, and `AdminRouteGuard` handles browser-side session restoration/expiry UX. These client checks supplement—not replace—server checks.
- `services/server/adminAuthorizationService.js` exports `requireAdminPermission(req, res, permissionKey)` for every future administrative mutation. It validates the server-side session, requires an active profile and role, then calls the database exact-permission function. Request bodies cannot supply roles or permissions.
- `writeSuccessfulAdminMutationAudit(...)` records a successful sensitive server mutation. Role and permission changes are additionally audited by database triggers.
- The service-role client is server-only and never enters browser bundles. Do not import `lib/supabase/service-role.js` from components, hooks, or client services.

### Protected API infrastructure

Routes under `pages/api/admin/` share the following server-side infrastructure:

- `utils/apiHandler.js` — request-ID creation, HTTP-method allowlisting, and centralized safe error/log handling.
- `utils/apiResponse.js` — consistent success (`{ success, data, meta }`) and error (`{ success, error: { code, message, fields? } }`) envelopes with request ID and timestamp metadata.
- `services/server/adminAuthorizationService.js` — `requireAdminPermission(req, res, permission)` for session verification and exact-permission authorization; `adminHasExactPermission()` for page-level checks.
- `utils/crudHandler.js` — `createAdminCrudHandler()` composes independently permission-guarded CRUD routes.
- `utils/apiRequest.js` — JSON body parsing, schema validation, and write rate limiting.
- `validators/common.js` and `validators/listQuery.js` — Zod schemas for pagination, slugs, UUIDs, statuses, search, filtering, and sorting.
- `utils/pagination.js`, `utils/rateLimit.js`, `utils/serverLogger.js`, and `utils/sanitize.js` — pagination, in-memory rate limiting, request-ID correlation logging, and sensitive-data redaction.

`GET /api/admin/dashboard` is a protected summary endpoint. It returns server-derived counts for published, draft, and scheduled content, upcoming events, published blog posts, pending comments, active talents, media assets, new contact submissions, new join applications, and donation records, plus recent administrative activity. Individual cards are permission-gated and the activity feed requires `audit.read`. It never includes merchandise statistics or personal submission details.

Raw Supabase errors and secret values are never returned to clients. Every protected endpoint enforces its own exact permission; there are no merchandise endpoints.

## Supabase CLI and migration ownership

This app shares one remote Supabase project with `web/`, but `admin/supabase/migrations/` is restricted to administrative roles, permissions, audit logging, and admin-only extensions.

Read [`../docs/supabase-migration-ownership.md`](../docs/supabase-migration-ownership.md) before creating, linking, or applying a migration. It lists all proposed objects, migration ownership, globally unique chronological filename rules, and the required `web`-before-`admin` execution order.

For local inspection/linking only, after installing the Supabase CLI:

```bash
cd admin
supabase link --project-ref <remote-project-ref>
supabase migration list
```

Do not run `supabase db push` or `supabase db reset` against an existing remote database without the approved migration process described in the ownership document.

## Structure

```text
admin/
├── components/          # Reusable admin presentation components
├── constants/           # Foundation configuration/constants
├── hooks/               # Client-side UI hooks
├── lib/                 # Shared runtime helpers (no Supabase client yet)
├── pages/               # Next.js Pages Router pages and API routes
├── public/              # Static admin assets
├── services/            # API client/service boundary
├── styles/              # Global styles
├── supabase/            # Admin-only Supabase configuration/extensions
└── utils/               # Shared utilities
```
