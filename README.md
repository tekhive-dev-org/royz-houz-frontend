# Royz Houz

Monorepo for the Royz Houz creative ecosystem.

```text
.
├── web/     # Public website (Next.js 14, Pages Router, JavaScript)
├── admin/   # Admin dashboard (Next.js 14, Pages Router, JavaScript, Material UI)
└── docs/    # Deployment, security, migration, and development documentation
```

Both applications are independent Next.js projects. They share the same Supabase project but keep **separate environment files, Supabase clients, API routes, and migration ownership**.

## Applications

| App | Purpose | Local port | Stack |
|---|---|---|---|
| `web/` | Public Royz Houz website (home, about, talents, events, blog, media, contact, join, donate, merchandise demo) | `3000` | Next.js Pages Router, CSS Modules, Supabase, Cloudinary, YouTube |
| `admin/` | Protected administration dashboard (content, media, submissions, users/roles, audit) | `3001` | Next.js Pages Router, Material UI, CSS Modules, Supabase Auth |

## Key rules

- **Merchandise is a demonstration only.** The public site keeps its constants-driven merchandise UI and cart demo; the admin Merchandise page is a static “Coming Soon” placeholder. No commerce, inventory, order, or payment APIs exist.
- **One Supabase project for both apps.** `web/` owns the foundational public content schema; `admin/` owns admin-specific extensions. Migration filenames are globally chronological because both histories target the same database.
- **Secrets stay server-side.** Only the Supabase URL and anonymous key are public (`NEXT_PUBLIC_*`). Service-role keys and Cloudinary API secrets are server-only.
- **No real credentials are committed.** `.env.local` files are git-ignored; `.env.example` files contain placeholders only.

## Quick start

See `docs/local-development.md` for the full walkthrough.

```bash
# Web
cd web
npm ci
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3000

# Admin (second terminal)
cd admin
npm ci
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3001
```

## Scripts

### `web/`

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server on `:3000` |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run test:security` | Security-critical unit tests |
| `npm run test:adapters` | Content adapter contract tests |
| `npm run test:smoke` | Production API/page smoke tests (requires a prior build) |
| `npm run content:export` | Export constants to Supabase records (dry-run by default) |
| `npm run content:import` | Import constants to Supabase (explicit confirmation required) |

### `admin/`

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server on `:3001` |
| `npm run build` | Production build |
| `npm run start` | Serve the production build on `:3001` |
| `npm run lint` | ESLint |
| `npm run test:security` | Authorization/security unit tests |
| `npm run test:smoke` | Production API/page smoke tests (requires a prior build) |

## Documentation

| Document | Contents |
|---|---|
| `docs/local-development.md` | Local setup, Supabase local, seeds, run commands |
| `docs/supabase-deployment.md` | Shared project, migration ownership and order, linking |
| `docs/web-deployment.md` | Public website deployment and environment |
| `docs/admin-deployment.md` | Admin deployment, auth bootstrap, permissions |
| `docs/cloudinary-setup.md` | Cloudinary configuration and signed uploads |
| `docs/security-audit.md` | Security audit, findings, remediation checklist |
| `docs/supabase-migration-ownership.md` | Ownership of every database object |
| `docs/production-checklist.md` | Pre-launch verification checklist |
| `docs/cms-content-audit.md` | Public content audit (web) |
| `docs/constants-to-supabase-mapping.md` | Constants-to-database mapping (web) |

## Status

- Public website: dynamic Supabase content for homepage, about, talents, events, blog, media, and public forms, with constants retained as controlled fallbacks where verification is still staged.
- Admin dashboard: protected, permission-based content management for all public modules except Merchandise (Coming Soon).
