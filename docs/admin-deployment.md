# Admin Deployment

Deployment guide for the Royz Houz admin dashboard (`admin/`).

## Runtime

- Next.js 14 (Pages Router), Material UI, Node.js 18.17+ (Node 20/22 LTS recommended).
- All admin pages are server-rendered (`getServerSideProps`) because access control must run server-side on every request.
- The admin app is separate from the public site and should be deployed/owned independently. It binds port `3001` locally.

## Build and start

```bash
cd admin
npm ci
npm run lint
npm run build
npm run start        # serves on :3001
```

Recommended platform commands:

```text
Install:  npm ci
Build:    npm run build
Start:    npm run start
```

## Environment variables

`admin/.env.example` lists every variable. The admin app connects to the **same** Supabase project as the public site, so `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must match `web/`.

| Variable | Visibility | Required in production |
|---|---|---|
| `NEXT_PUBLIC_ADMIN_URL` | public | Yes — admin canonical URL |
| `NEXT_PUBLIC_WEB_URL` | public | Yes — public website URL |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Yes — same project as web |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Yes — same anon key as web |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Yes — privileged admin mutations |
| `SUPABASE_DATABASE_URL` | server | Only if using DB scripts |
| `CLOUDINARY_CLOUD_NAME` | server | Yes — media library |
| `CLOUDINARY_API_KEY` | server | Yes — signed uploads |
| `CLOUDINARY_API_SECRET` | server | Yes — signed uploads (never public) |

Rules:

- Never expose `SUPABASE_SERVICE_ROLE_KEY` or Cloudinary secrets via `NEXT_PUBLIC_*`.
- Admin session cookies are issued by Supabase Auth with `SameSite=Lax` and `Secure` in production. Serve the admin over HTTPS only.
- Deploy the admin under its own hostname (for example `admin.royzhouz.com`); it must not share the public site origin unless CSRF/origin checks are explicitly handled.

## Authentication and authorization

- Login uses Supabase Auth (email/password) against the shared project.
- A valid Supabase account is **not** an admin. Access requires:
  1. An active `admin_profiles` record for the user.
  2. At least one active `admin_role_assignments` entry with an unexpired role.
  3. The exact permission required by the operation, checked server-side by `requireAdminPermission()`.
- Every admin API route enforces its own permission; page-level guards redirect unauthenticated users to `/login` and unauthorized users to `/unauthorized`.
- Roles/permissions are seeded by admin migrations. No real administrator email is seeded.

### First administrator bootstrap

1. Create the user via Supabase Auth (dashboard or `auth.admin.createUser` with a service-role context).
2. Insert an active `admin_profiles` row for that `auth.users.id`.
3. Assign a role with the needed permissions (`super_admin` or a composed set) via `admin_role_assignments` using the same patterns as the access-control API. Prefer the protected admin API once a first admin exists; use direct SQL only for the initial bootstrap.

## Media

- Cloudinary is configured server-side only; uploads are signed by protected server routes and validated (type, size, host, folder) before and after upload. See `docs/cloudinary-setup.md`.
- YouTube URLs are normalized server-side; arbitrary iframe HTML is rejected.

## Security notes

- See `docs/security-audit.md` for the full findings and the remediation checklist.
- Apply edge-level security headers and rate limiting. The in-memory limiter is per-process; horizontally scaled deployments should add a shared limiter.
- Restrict `GET /api/admin/health` to internal monitoring networks if service enumeration is a concern.
- Audit logs contain actor/action/entity metadata, never credentials or request bodies.

## Post-deploy verification

```bash
# From a built checkout
npm run test:smoke
```

Verify:

- `/api/admin/health` responds with a minimal readiness payload.
- Every protected `/api/admin/*` route rejects unauthenticated callers with `401`.
- Protected pages redirect to `/login` when unauthenticated.
- `GET /api/admin/merchandise` returns `404` (no commerce API).
- The Merchandise page shows “Merchandise Management — Coming Soon” when logged in.
