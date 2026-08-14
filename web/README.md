# RoyzHouse Web Application

Built with **Next.js (Pages Router)**, **JavaScript**, **Tailwind CSS**, **Material UI**, **Supabase**, and **Cloudinary** according to **Victor's Full-Stack Development Standards**.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### 2. Environment Setup
Copy `.env.example` to `.env.local` and populate required variables:
```bash
cp .env.example .env.local
```

Required keys:
* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY` (Server environment only)
* `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

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
