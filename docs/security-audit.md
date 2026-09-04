# Royz Houz Security Audit

**Date:** 2026-08-25  
**Scope:** Public website (`web/`) and admin dashboard (`admin/`)  
**Method:** Source-level review of environment clients, Supabase migrations/RLS, public and admin API routes, authorization services, media utilities, rate limiting, logging, and configuration; targeted automated tests for critical authorization paths; SQL verification fixture review.

## Executive summary

- No critical-severity issue remains open.
- One **high-severity** issue was found and fixed during this audit: public submission functions were directly callable with the anonymous key, bypassing API-layer sanitization, size limits, logging, and rate limiting.
- The admin application's session/permission model was reviewed end-to-end and is correctly server-authoritative; no critical or high finding was identified in admin.
- Automated tests were added for both applications and pass.
- The public RLS verification fixture was updated to cover the newly closed path.

---

## Verified controls

| Requirement | Status | Evidence |
|---|---|---|
| RLS enabled correctly | ✅ Verified | Public content and submission tables have RLS enabled with published-only read policies; protected tables (`contact_submissions`, `join_applications`, `donation_records`, `blog_comments`, admin tables) have no anonymous read policy. |
| Anonymous users cannot access drafts | ✅ Verified | RLS requires `status = 'published'` and `published_at <= now()`; services apply the same filters defensively. Covered by `web/supabase/rls-verification.sql` (draft/scheduled/archived/future fixtures). |
| Anonymous users cannot read private submissions | ✅ Verified | `donation_records`, `contact_submissions`, `join_applications`, `blog_comments` have no `SELECT` grant/policy for `anon`/`authenticated`; comments are exposed only through a safe public projection. |
| Authenticated non-admin users cannot access admin APIs | ✅ Verified | `requireAdminPermission()` validates the server-side session, requires an active `admin_profiles` record and active role assignment, then checks the exact database permission. Tested in `admin/scripts/tests/security-critical-paths.test.mjs`. |
| Admin permissions checked server-side | ✅ Verified | Every protected admin handler calls `requireAdminPermission(req, res, <exact-permission>)`; role/permission values in request bodies are never consulted. Tested. |
| Service-role keys never sent to browsers | ✅ Verified | `web/lib/supabase/service-role.js` and `admin/lib/supabase/service-role.js` are server-only modules; only `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are validated by browser-safe clients. |
| Cloudinary secrets never exposed | ✅ Verified | Cloudinary configuration is server-only; signing and registration happen in protected API routes; the API secret never appears in client bundles or responses. |
| Upload endpoints validate type and size | ✅ Verified | Media upload issuance/registration validates resource type, format, host, folder, and stored size server-side; client-declared size is re-checked at registration. Provider-side size binding is a documented medium remediation. |
| YouTube URLs safely normalized | ✅ Verified | `normalizeYouTubeUrl()` accepts only `youtube.com`, `www.youtube.com`, `m.youtube.com`, `youtu.be` (watch/shorts) with an 11-character video ID pattern; rejects credentials, ports, unsupported hosts, and malformed IDs. Tested. |
| Arbitrary iframe HTML rejected | ✅ Verified | Embed URLs are generated server-side from a validated video ID; stored raw embed URLs are not trusted; iframe HTML input is rejected. Tested. |
| Destructive operations require exact permissions | ✅ Verified | Deletes and other destructive admin mutations are guarded by exact permission keys (for example `talents.delete`, `media.delete`). Tested via the exact-permission matrix. |
| Rate-limiting hooks protect public forms | ✅ Verified | Contact, Join, blog comment, and donation-record endpoints enforce in-memory limiters; forwarding address spoofing is mitigated (trusted-proxy gating). Tested. |
| API errors do not expose implementation details | ✅ Verified | API responses return structured codes and safe messages; raw Supabase errors and stack traces are never sent to clients. |
| Audit logs do not contain credentials or sensitive payloads | ✅ Verified | Application audit records log actor/action/entity metadata, not bodies, tokens, or credentials; request logging excludes payloads. |
| CORS and security headers appropriate | ⚠️ Medium (noted) | No application-level CORS headers are configured (APIs are same-origin). No centralized security-header policy exists in either app; documented below as a deployment/platform remediation. |
| Merchandise has no live CMS or commerce APIs | ✅ Verified | No merchandise/cart/checkout/order/payment API routes exist in either app; the admin Merchandise page is a static “Coming Soon” placeholder; public merchandise remains constants-only demo. |

---

## Findings

### Web (`web/`)

| Severity | Finding | Status |
|---|---|---|
| **High** | Public submission RPCs (`submit_contact_submission`, `submit_join_application`, `submit_blog_comment`) were callable by `anon`/`authenticated` with the public anon key, bypassing API-layer sanitization, size limits, rate limiting, and logging. | **Fixed.** New migration `web/supabase/migrations/20260825121300_web_restrict_public_submission_rpcs.sql` revokes `EXECUTE` from `anon`/`authenticated` and grants it only to `service_role`. |
| **High** | Submission services would stop working after the RPC revocation because they used the anonymous client. | **Fixed.** `contactService`, `joinApplicationService`, and `blogCommentService` now use the server-only service-role client for writes. Public reads (published comments) remain anonymous RPC reads. |
| **High** | Rate limiter trusted the client-controlled first `X-Forwarded-For` value, letting callers rotate rate-limit buckets. | **Fixed.** `web/utils/rateLimit.js` keys on `req.socket.remoteAddress` unless `TRUST_PROXY=true`; when enabled it uses the right-most address only. |
| Medium | Rate limiting is in-memory (per process); not coordinated across multiple instances. | Documented remediation: shared atomic store (Redis or database-backed limiter) for horizontally scaled deployments. |
| Medium | No centralized security-header policy. | Documented remediation: CSP (report-only first), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`, HSTS at the edge. |
| Low | `TRUST_PROXY` is deployment-sensitive. | Leave unset unless the reverse proxy appends/sanitizes `X-Forwarded-For`; prevent direct origin access when enabled. |

### Admin (`admin/`)

| Severity | Finding | Status |
|---|---|---|
| Medium | No centralized HTTP security-header configuration. | Documented remediation (CSP tuned for MUI + YouTube iframes, `frame-ancestors 'none'`, nosniff, referrer/permissions policy). |
| Medium | `enforceWriteRateLimit()` exists but is not invoked by protected mutation handlers. | Documented remediation: enforce per-actor/route limits for invitations, role/profile changes, uploads, exports, and destructive operations; consider edge-level limiting. |
| Medium | Audit triggers record a `null` actor for service-role mutations because `auth.uid()` is absent. | Documented remediation: single authoritative audit path with the server-verified actor passed into an authorized database function/transaction. |
| Medium | Cloudinary signed-upload size is validated at registration but not bound by the provider upload policy. | Documented remediation: provider-side upload preset ceilings; short-lived signing tokens. |
| Low | `GET /api/admin/health` is intentionally unauthenticated and reveals the admin service name. | Acceptable if network-restricted; document platform-level restriction. |

---

## Remediation checklist

### Completed

- [x] Revoke `EXECUTE` on public submission functions from `anon`/`authenticated`; grant only to `service_role` (`20260825121300_web_restrict_public_submission_rpcs.sql`).
- [x] Switch public submission writes to the server-only service-role client.
- [x] Harden rate-limit client identification against `X-Forwarded-For` spoofing.
- [x] Update `web/supabase/rls-verification.sql` to assert anonymous RPC denial and service-role execution.
- [x] Add `web/scripts/tests/security-critical-paths.test.mjs` (9 tests) and `admin/scripts/tests/security-critical-paths.test.mjs` (8 tests).
- [x] Add alias loader so `node --test` can import application modules; repair the previously broken `test:adapters` runner.
- [x] Remove a stale reference to the non-existent `published_talents` view from the RLS verification fixture.

### Recommended follow-up (not completed in this unit)

- [ ] Deploy centralized security headers (CSP report-only → enforced; `X-Content-Type-Options: nosniff`; `Referrer-Policy`; `Permissions-Policy`; `frame-ancestors`; HSTS at the edge) for both `web/` and `admin/`, or enforce equivalent headers at the CDN/platform layer.
- [ ] Replace the in-memory rate limiters with a shared atomic store; add per-authenticated-actor keys for admin writes.
- [ ] Enforce admin write rate limits (invitations, access-control changes, uploads, exports, destructive actions).
- [ ] Make admin audit actor attribution unambiguous for service-role mutations (pass the verified actor into an authorized transactional function; avoid duplicate trigger + application audit rows).
- [ ] Bind Cloudinary upload size with a provider-side upload preset; keep signing tokens short-lived.
- [ ] Run the updated `web/supabase/rls-verification.sql` against a local database after applying migrations; do not run against production.
- [ ] Restrict `GET /api/admin/health` to internal monitoring networks if service enumeration is a concern.
- [ ] Re-run `npm audit` and dependency upgrades on a release cadence.

---

## Automated tests

### Web

```bash
cd web
npm run test:security
npm run test:adapters
```

`web/scripts/tests/security-critical-paths.test.mjs` covers:

- YouTube normalization (valid watch/shorts/youtu.be; unsupported hosts, credentials, ports, iframe HTML, malformed IDs rejected).
- Rate-limit spoofing protection (`X-Forwarded-For` ignored by default; right-most address used only with `TRUST_PROXY=true`).
- Submission sanitization (HTML/control characters stripped, nested payloads).
- API validation boundaries (contact/comment/donation schemas reject empty, oversized, malformed, fabricated, and unknown inputs).

### Admin

```bash
cd admin
npm run test:security
```

`admin/scripts/tests/security-critical-paths.test.mjs` covers the authorization decision tree:

- Unauthenticated request → `401 SESSION_EXPIRED`.
- Authenticated user without an active admin profile → `403`.
- Suspended profile → `403`.
- Admin without the exact permission → `403 PERMISSION_DENIED`.
- Destructive permission denied without the exact permission.
- Client-supplied role/permission values are ignored.
- Valid admin with exact permission → authorized.
- Invalid permission keys rejected before any database call.

The tests run against fixture clients (no network, no credentials). The preloaded alias loader (`scripts/tests/register-alias.mjs` in each app) resolves `@/` imports for plain `node --test`.

### Database

`web/supabase/rls-verification.sql` documents/verifies:

- Published content visible to anonymous; draft/scheduled/archived/future hidden.
- Direct anonymous CMS writes denied.
- Private submission tables not readable anonymously.
- Comment emails private; only approved comments returned by the public projection.
- Anonymous submission-RPC calls denied; service-role execution succeeds; invalid/excessive input rejected.
- Ends with `ROLLBACK`; never run against production.

---

## Validation results

- `web`: `npm run lint` ✅, `npm run build` ✅, `npm run test:security` (9/9) ✅, `npm run test:adapters` (6/6) ✅.
- `admin`: `npm run lint` ✅, `npm run test:security` (8/8) ✅.
- `web` `npm audit --offline --omit=dev`: 0 vulnerabilities (reported by the web audit pass).

## Scope notes

- Merchandise: unchanged; no live CMS/commerce APIs; demo/cart behavior retained.
- No payment processing was added or changed.
- The `MODULE_TYPELESS_PACKAGE_JSON` warning emitted by `node --test` is informational only (the apps use Next.js CJS defaults; adding `"type": "module"` to the package manifests would risk the Next.js build and was intentionally avoided).
