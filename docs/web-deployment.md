# Web Deployment

Deployment guide for the public Royz Houz website (`web/`).

## Runtime

- Next.js 14 (Pages Router), Node.js 18.17+ (Node 20/22 LTS recommended).
- Works on Vercel, Netlify, or any Node host running `next start` (or a containerized Node server).
- ISR pages (home, about, talents, events, blog, media detail routes) revalidate every 60 seconds. The host must support ISR (file-system `.next` persistence for `next start`; serverless platforms handle it natively).

## Build and start

```bash
cd web
npm ci
npm run lint
npm run build        # outputs .next
npm run start        # serves on :3000
```

Recommended platform commands:

```text
Install:  npm ci
Build:    npm run build
Start:    npm run start
```

## Environment variables

`web/.env.example` lists every variable. Public (`NEXT_PUBLIC_*`) values are embedded in the browser bundle at build time; server variables are read only on the server.

| Variable | Visibility | Required in production |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | Yes — canonical site URL |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Yes — privileged public-submission writes |
| `SUPABASE_DATABASE_URL` | server | Only if using DB scripts |
| `CLOUDINARY_CLOUD_NAME` | server | If media uploads are used |
| `CLOUDINARY_API_KEY` | server | If media uploads are used |
| `CLOUDINARY_API_SECRET` | server | If media uploads are used |
| `TRUST_PROXY` | server | Set to `true` only behind a trusted reverse proxy that sanitizes `X-Forwarded-For` |

Rules:

- Never add `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DATABASE_URL`, or Cloudinary secrets as `NEXT_PUBLIC_*`.
- Build-time environment validation fails with a clear message if a required server variable is missing in the build environment. Provide every variable to the build step.

## Supabase

- The web app reads published content through the same project used by admin (`NEXT_PUBLIC_SUPABASE_URL` must match).
- All migrations must be applied to the shared project **before** deploying the web app (see `docs/supabase-deployment.md`).
- Public content is protected by RLS; drafts and scheduled content are never public.

## Media

- Cloudinary configuration is server-side only (see `docs/cloudinary-setup.md`).
- YouTube URLs are normalized server-side to safe embed URLs and thumbnails.
- If Cloudinary-hosted images are served through `next/image`, add the Cloudinary host to `next.config.js` `images.remotePatterns`:

```js
// next.config.js (no secrets)
module.exports = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
};
```

Local `/assets` images work without this configuration. The site currently ships local fallback assets, so a missing `next.config.js` does not break the build; remote-media hosts must be allowlisted before Cloudinary/YouTube assets are published.

## SEO and sitemap

- `pages/robots.txt.js` and `pages/sitemap.xml.js` are generated from published content only.
- Draft, scheduled, and archived content is excluded from the sitemap.
- Page-level SEO lives in each page's `Head`; global defaults come from site settings/SEO services.

## Security notes

- Public write endpoints (`/api/contact`, `/api/join`, `/api/blog/comments`, `/api/donations/record`) are protected by Zod validation, sanitization, size limits, and rate limiting. Deploy behind a proxy that sets a real client address and review the `TRUST_PROXY` flag.
- Deploy with HTTPS and configure security headers at the platform/CDN edge (CSP report-only first, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS). See `docs/security-audit.md` and `docs/production-checklist.md`.

## Post-deploy verification

```bash
# From a built checkout
npm run test:smoke
```

Verify:

- `/api/health` returns `{ success: true }`.
- Public content APIs return only published data.
- Homepage/About/talents/events/blog/media pages render.
- `POST /api/contact` with an invalid payload returns a safe `400 VALIDATION_ERROR`.
- Unknown routes return the 404 page.
- Merchandise routes remain the constants-driven demo.
