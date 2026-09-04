# RoyzHouse Web Application

Built with **Next.js (Pages Router)**, **JavaScript**, **Tailwind CSS**, **Material UI**, **Supabase**, and **Cloudinary** according to **Victor's Full-Stack Development Standards**.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### 2. Environment Setup

Copy `.env.example` to `.env.local` and set values for your environment:

```bash
cp .env.example .env.local
```

`.env.local` is ignored by Git and must never be committed. Do not add real credentials to `.env.example`.

`web/` and `admin/` connect to the **same Supabase project** when integrations are enabled, but they maintain independent environment files and validation utilities.

#### Public browser-safe variables

| Variable | Required locally | Required in production | Purpose |
|---|---:|---:|---|
| `NEXT_PUBLIC_SITE_URL` | Yes (`http://localhost:3000`) | Yes | Canonical public website URL. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes when a Supabase-backed web feature is enabled | Yes | Shared Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes when a Supabase-backed web feature is enabled | Yes | Public Supabase anonymous key. |

Only variables prefixed with `NEXT_PUBLIC_` can enter browser bundles. They must never contain a service-role key, database URL, Cloudinary secret, or other privileged credential.

#### Server-only variables

| Variable | Required locally | Required in production | Purpose |
|---|---:|---:|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Yes when protected server operations are enabled | Yes | Server-only Supabase administrative operations. |
| `SUPABASE_DATABASE_URL` | Only when a server service requires a direct database connection | As required by deployed server services | Direct server database connection; never expose to the browser. |
| `CLOUDINARY_CLOUD_NAME` | Yes when server-side Cloudinary media operations are enabled | Yes | Cloudinary account identifier. |
| `CLOUDINARY_API_KEY` | Yes when server-side Cloudinary media operations are enabled | Yes | Cloudinary server credential. |
| `CLOUDINARY_API_SECRET` | Yes when server-side Cloudinary media operations are enabled | Yes | Cloudinary secret. |

Use `@/lib/env/client` only in browser-safe code and `@/lib/env/server` only in API routes, repositories, or server-side data functions. The public validator intentionally reads only `NEXT_PUBLIC_*` variables; the server validator provides helpful missing/invalid variable names without printing secret values.

### Media operations

Cloudinary is configured only by `lib/cloudinary/server.js`; browser code receives a short-lived signed upload payload, never `CLOUDINARY_API_SECRET`. Future protected admin routes must authenticate/authorize an administrator before calling `services/server/mediaAssetService.js` and must pass the server-verified admin UUID. The media service:

- accepts only JPEG, PNG, WebP, AVIF images up to 10 MB and MP4, WebM, MOV, or M4V videos up to 250 MB;
- persists only validated Cloudinary metadata and secure delivery URLs in `media_assets`, initially as `draft`;
- accepts only normal YouTube watch, `youtu.be`, and Shorts URLs, which are normalized to an ID, safe embed URL, and thumbnail URL;
- decommissions Cloudinary files using the database-stored public ID only; it blocks published or referenced assets and archives the metadata after a successful destroy.

`media_asset_references` is a web-owned reference registry. Admin content workflows must register an asset reference before publishing content and remove it only after a safe replacement, so destructive deletion remains blocked while content uses the asset. No media upload route is exposed publicly.

### Constants-to-Supabase migration workflow

The current UI continues to use `constants/` as its active fallback source. Before replacing any feature, review [`docs/constants-to-supabase-mapping.md`](docs/constants-to-supabase-mapping.md) for exact database-to-component DTO mappings and the distinction between local seeds and guarded production imports.

```bash
# Read-only transformation preview
npm run content:export

# No-write import summary
npm run content:import
```

The production import path is dry-run by default and requires explicit `--apply --confirm-constants-import` flags after migration, backup, and editorial approval. It never uploads existing assets to Cloudinary and excludes merchandise/cart data.

### Supabase CLI and migration ownership

This app uses `web/supabase/` for the **foundational public website/content** migration source. It shares one remote Supabase project with `admin/`, whose migrations are limited to admin roles, permissions, audit logs, and administrative extensions.

Read [`../docs/supabase-migration-ownership.md`](../docs/supabase-migration-ownership.md) before creating, linking, or applying any migration. It documents object ownership, globally unique chronological filenames, execution order, local linking commands, and the prohibition on remote resets.

For local inspection/linking only, after installing the Supabase CLI:

```bash
cd web
supabase link --project-ref <remote-project-ref>
supabase migration list
```

Do not run `supabase db push` or `supabase db reset` against an existing remote database without the approved migration process described in the ownership document.

### 3. Install & Run Locally
```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

---

## 📁 Architecture & Folder Structure

```text
web/
├── components/       # Common, layout, UI, and feedback components
│   ├── common/
│   ├── layout/       # Layout, Header, Footer, Sidebar
│   ├── ui/
│   └── feedback/     # Loading, EmptyState, ErrorMessage, SuccessMessage, OfflineNotice
├── features/         # Domain-driven feature modules
├── hooks/            # Reusable client hooks (useAuth, etc.)
├── services/         # API client & business logic services
├── repositories/     # Data access abstraction layer
├── validators/       # Input validation schemas (Zod)
├── utils/            # Standardized response formatters & error handlers
├── context/          # Auth Context & Global state providers
├── lib/              # Supabase & Cloudinary client initializations
├── styles/           # CSS modules & Tailwind global styling
└── supabase/         # SQL migrations and database setup
```

---

## 🔒 Security & Code Standards

- **RLS Enforced**: All Supabase database tables use Row Level Security policies.
- **Service Role Key**: `SUPABASE_SERVICE_ROLE_KEY` is strictly reserved for server operations.
- **Input Validation**: API inputs are validated server-side using Zod.
- **Import Aliases**: Path aliases start with `@/*` mapped to `./*`.
