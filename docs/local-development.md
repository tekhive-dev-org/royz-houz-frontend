# Local Development

This guide covers running both Royz Houz applications locally.

## Prerequisites

- Node.js 18.17+ (Node 20/22/24 LTS recommended)
- npm 9+
- Supabase CLI (`supabase`) for local database work
- Access to the Supabase project (URL, anon key, service-role key) or a local Supabase instance
- Cloudinary credentials if testing media uploads

## Install dependencies

```bash
cd web && npm ci
cd ../admin && npm ci
```

Use `npm ci` for reproducible installs. Both applications have committed lockfiles.

## Environment variables

Each application has its own `.env.example` and its own `.env.local`. Copy the example and fill in real values:

```bash
# web
cd web
cp .env.example .env.local

# admin
cd admin
cp .env.example .env.local
```

`.env.local` files are git-ignored and must never be committed. Both applications must point at the **same** Supabase project, so `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` should match across the two `.env.local` files (the service-role key is shared too).

### Required variables

#### `web/.env.local`

| Variable | Public/Server | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | Canonical public site URL |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Browser-safe anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Privileged server-side writes (never public) |
| `SUPABASE_DATABASE_URL` | server | Direct database connection (scripts/ops) |
| `CLOUDINARY_CLOUD_NAME` | server | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | server | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | server | Cloudinary API secret (never public) |
| `TRUST_PROXY` | server | Optional; set to `true` only behind a trusted reverse proxy |

#### `admin/.env.local`

| Variable | Public/Server | Purpose |
|---|---|---|
| `NEXT_PUBLIC_ADMIN_URL` | public | Admin application URL |
| `NEXT_PUBLIC_WEB_URL` | public | Public website URL |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Same Supabase project as web |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Same anon key as web |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Privileged server-side admin writes |
| `SUPABASE_DATABASE_URL` | server | Direct database connection |
| `CLOUDINARY_CLOUD_NAME` | server | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | server | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | server | Cloudinary API secret |

Environment validation:

- Public variables are validated by browser-safe modules (`lib/env/client.js`).
- Server variables are validated only on the server (`lib/env/server.js`) and throw helpful configuration errors without leaking values.
- Missing server variables never break browser bundles.

## Supabase locally

The two applications share one database. Run migrations in the globally chronological order described in `docs/supabase-deployment.md`.

Local database (Supabase CLI):

```bash
# From the repository root (or either app directory)
supabase start

# Link to your project (only needed for pushing to the remote database)
supabase link --project-ref <your-project-ref>

# Apply all pending migrations in order
supabase db push

# Reset a LOCAL database and re-apply migrations + seed (never run against remote)
supabase db reset --local
```

> `supabase db reset` destroys local data. Never use it against the shared remote project. `web/supabase/seed.sql` seeds representative local development content only.

RLS verification queries live in `web/supabase/rls-verification.sql` and are rollback-only; run them against an approved local database, not production.

## Run the applications

```bash
# Terminal 1 — public website
cd web
npm run dev        # http://localhost:3000

# Terminal 2 — admin dashboard
cd admin
npm run dev        # http://localhost:3001
```

## Tests and validation

```bash
# Web
cd web
npm run lint
npm run test:security
npm run test:adapters
npm run build
npm run test:smoke      # requires a completed build

# Admin
cd admin
npm run lint
npm run test:security
npm run build
npm run test:smoke      # requires a completed build
```

`test:smoke` boots the production server on a local port, exercises public APIs/pages (web) and authorization/redirect behavior (admin), then shuts it down.

## Common issues

- **Ports in use**: web uses `3000`, admin uses `3001` (`admin` also hard-codes these in its scripts).
- **Supabase unreachable**: public content APIs return safe error envelopes and the pages fall back to their constants, so the UI still renders.
- **`MODULE_TYPELESS_PACKAGE_JSON` warning during `node --test`**: informational only; adding `"type": "module"` would risk the Next.js CJS build and is intentionally avoided.
- **Cloudinary images not loading in `next/image`**: configure `remotePatterns` for your Cloudinary host in `next.config.js` (see `docs/cloudinary-setup.md`).
