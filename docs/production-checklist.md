# Production Checklist

Pre-launch verification for the Royz Houz public website (`web/`) and admin dashboard (`admin/`).

## Database and Supabase

- [ ] Both apps point at the **same** Supabase project (`NEXT_PUBLIC_SUPABASE_URL` matches in `web/.env.local` and `admin/.env.local`).
- [ ] All migrations applied in the documented order (see `docs/supabase-deployment.md`; 14 migrations, web foundational first, admin extensions interleaved by timestamp).
- [ ] `supabase migration list` shows no pending migrations.
- [ ] RLS verification (`web/supabase/rls-verification.sql`) passes against an approved local copy and was never run against production.
- [ ] Anonymous users can read only published content with an arrived `published_at`.
- [ ] Draft, scheduled, archived, and future-published content is not publicly reachable via API or sitemap.
- [ ] Contact/join/comment/donation submissions are not publicly readable.
- [ ] Public submission RPCs reject `anon`/`authenticated` execution (migration `20260825121300` applied).
- [ ] Seeds (`web/supabase/seed.sql`, `admin/supabase/seed.sql`) exist only as local development data and were not run on production.
- [ ] A first administrator exists (active `admin_profiles` + role assignment) or a documented bootstrap procedure is ready.

## Environment and secrets

- [ ] `web/.env.local` and `admin/.env.local` exist on the host and are not committed (git-ignored).
- [ ] `.env.example` files exist in both apps with placeholders only.
- [ ] No `NEXT_PUBLIC_*` variable contains a service-role key or Cloudinary secret.
- [ ] `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DATABASE_URL`, and Cloudinary secrets are server-only.
- [ ] Build steps receive the full variable set (public + server) so env validation passes.
- [ ] Logs and error trackers contain no secrets or request bodies.

## Builds and tests

- [ ] `cd web && npm ci && npm run lint && npm run build` passes.
- [ ] `cd admin && npm ci && npm run lint && npm run build` passes.
- [ ] `cd web && npm run test:security` passes (9 tests).
- [ ] `cd web && npm run test:adapters` passes (6 tests).
- [ ] `cd admin && npm run test:security` passes (8 tests).
- [ ] `cd web && npm run test:smoke` passes (production server, public APIs/pages).
- [ ] `cd admin && npm run test:smoke` passes (production server, auth guards, no merchandise API).
- [ ] `npm audit --omit=dev` findings reviewed; known limitations documented (Next 14 / PostCSS 8.4.31 / `@supabase/ssr` → `cookie` transitive advisories) and an upgrade plan scheduled.

## Public website (`web/`)

- [ ] `/api/health` returns `{ success: true }`.
- [ ] Public content APIs return only published data and safe envelopes.
- [ ] Homepage, About, Talents, Events, Blog, Media, Contact, Join, and Donate render at desktop/tablet/mobile widths.
- [ ] Dynamic detail routes return 404 for missing/unpublished slugs.
- [ ] Public forms (contact, join, blog comments, donation request) validate, rate-limit, sanitize, and never expose database errors.
- [ ] YouTube media renders via normalized safe embed URLs; iframe HTML input is rejected.
- [ ] Cloudinary/YouTube hosts allowlisted in `next.config.js` `images.remotePatterns` if remote media is published.
- [ ] Merchandise routes remain the constants-driven demo; `GET /api/merchandise` returns 404; cart behavior unchanged.
- [ ] Sitemap excludes drafts/scheduled/archived; robots is correct.

## Admin (`admin/`)

- [ ] Every `/api/admin/*` route rejects unauthenticated callers (smoke-tested).
- [ ] Exact permissions are enforced server-side for every mutation, including destructive operations (`talents.delete`, `media.delete`, etc.).
- [ ] Client-supplied roles/permissions are never trusted.
- [ ] Admin pages redirect to `/login` when unauthenticated and `/unauthorized` when not permitted.
- [ ] Media uploads are signed server-side; type/size/host/folder are validated; the Cloudinary secret never reaches the browser.
- [ ] Audit logs record actor/action/entity metadata without credentials or payloads.
- [ ] Merchandise page shows “Merchandise Management — Coming Soon” and makes no data-service calls.
- [ ] `GET /api/admin/merchandise` returns 404 (no commerce API).

## Security and operations

- [ ] HTTPS enforced; HSTS configured at the edge.
- [ ] Security headers configured at the platform/CDN layer (CSP report-only first, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`). See `docs/security-audit.md`.
- [ ] Rate limiting review: `TRUST_PROXY=true` only behind a trusted proxy; a shared limiter is planned if the deployment scales horizontally.
- [ ] Admin write endpoints have (or inherit) rate limits for invitations, role changes, uploads, and exports.
- [ ] `GET /api/admin/health` is restricted to monitoring networks if desired.
- [ ] Backups and rollback plan exist for the Supabase project (Point-in-Time Recovery configured if available).
- [ ] Monitoring/alerting on 401/403 spikes, 429s, and 5xx rates.

## Final visual confirmation

- [ ] Public UI structure preserved: no CSS Modules removed, no inline-style conversions, no section reordering.
- [ ] Desktop/tablet/mobile comparison completed against the constants fallback (see `web/docs/dynamic-content-verification.md`).
