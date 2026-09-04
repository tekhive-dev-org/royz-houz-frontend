# Dynamic Content Verification

**Date:** 2026-08-25  
**Scope:** Public website constants-to-Supabase migration verification  
**Verification mode:** Production build, route/adaptor contract inspection, and responsive-layout code review. An interactive browser or screenshot runner is not available in this environment, so the final viewport-by-viewport visual pass is explicitly tracked below as a required local QA step.

## Verification standard

Public dynamic content must retain the existing component-facing contracts:

```text
Supabase public RLS read
→ server content service
→ adapter
→ existing page/component props
→ unchanged CSS Modules and layout
```

All public services use the RLS-protected foundational tables and explicitly require content to be `published` with a `published_at` timestamp that has arrived. Draft, scheduled, and archived records are not public content sources.

## Automated verification completed

| Check | Result | Evidence |
|---|---:|---|
| JavaScript lint | Pass | `npm run lint` completed with no warnings or errors. |
| Production build | Pass | `npm run build` compiled successfully and generated 171 pages. |
| Dynamic route generation | Pass | Talent, event, blog, and media detail routes use blocking ISR and 60-second revalidation. |
| Unknown dynamic content | Pass | Talent, event, blog, and media detail routes return `notFound` instead of rendering a first-record/static default. |
| CMS publication protection | Pass | Services query `talents`, `events`, `blog_posts`, and `media_assets` with publication filters; RLS remains the database boundary. |
| CSS Modules | Pass | No CSS Modules were converted to inline styles. Existing responsive selectors remain in place. |
| Merchandise isolation | Pass | No merchandise/cart component, route, API, service, database query, or constants flow was changed. |

## Visual and behavioral matrix

### Shared shell

| Area | Contract review | Responsive visual QA status |
|---|---|---|
| Header | Remains constants/component-local. Its JSX, logo dimensions (`160×44`), navigation order, active states, desktop navigation, and mobile drawer are unchanged. | Requires local desktop/tablet/mobile viewport check. |
| Footer | Remains constants/component-local. Its four-column markup, newsletter demo, static logo dimensions, and responsive CSS are unchanged. | Requires local desktop/tablet/mobile viewport check. |
| Error pages | `404` and `500` retain their existing standalone layout. Dynamic content routes now use `notFound` for missing public records. | Requires local browser check for direct unknown URLs. |

### Homepage and About

| Route | Dynamic source | Shape / layout safeguard | Status |
|---|---|---|---|
| `/` | `homepage_sections` and featured public content through `homepageService` | Existing section components receive constants-compatible props. A published section with `body.visible === false` is omitted without a spacer. Incomplete optional collections keep their matching constants fallback. | Build/contract pass; live Supabase and viewport QA pending. |
| `/about` | `about_sections` through `aboutService` | Serializable `iconKey` values map back to the existing React icon components. Gallery columns retain `{ id, title, image, alt, size }`. | Build/contract pass; live Supabase and viewport QA pending. |

### Talents

| Route family | Dynamic source | Shape / layout safeguard | Status |
|---|---|---|---|
| `/talents` | `talents` through `talentService` | Directory and trending components receive their existing card shapes. Empty/unavailable published data uses list constants as a controlled fallback. | Build/contract pass; live data QA pending. |
| `/talents/[slug]` and existing nested public routes | `talents` by published slug | Missing/unpublished content is a 404. Adapter guarantees local `image` and `coverImage` fallbacks so `next/image` receives a valid source. | Build/contract pass; live data QA pending. |

### Events

| Route family | Dynamic source | Shape / layout safeguard | Status |
|---|---|---|---|
| `/events` | `events` through `eventService` | Existing tabs, filters, sorting, event sections, and card data fields (`day`, `month`, `year`, `location`, `image`) are preserved. Empty/unavailable list data uses constants fallback. | Build/contract pass; live data QA pending. |
| `/events/[slug]` | `events` by published slug | Missing/unpublished content is a 404. Adapter provides the existing event hero/card image fallback. | Build/contract pass; live data QA pending. |

### Blog and comments

| Route family | Dynamic source | Shape / layout safeguard | Status |
|---|---|---|---|
| `/blog` | `blog_posts` and `blog_categories` | Existing Blog Overview and article card structures remain in use. Static articles stay available only when no published CMS list is available. | Build/contract pass; live data QA pending. |
| `/blog/[slug]` | `blog_posts` by published slug | Missing/unpublished posts are a 404. Structured article blocks are passed to the existing body component. The adapter provides a local cover-image fallback. | Build/contract pass; live data QA pending. |
| Approved comments | Safe comment RPC/API | Only approved public comment projections render; commenter email fields are not supplied to UI components. Pending submissions remain invisible until moderation. | Build/contract pass; endpoint QA pending against configured Supabase. |

### Media

| Route family | Dynamic source | Shape / layout safeguard | Status |
|---|---|---|---|
| `/media` | `media_assets` through `mediaService` | Existing video, podcast, music, and gallery component contracts are retained. Cloudinary uses secure/responsive URLs; YouTube is normalized to safe embed/thumbnail metadata. | Build/contract pass; live data QA pending. |
| `/media/watch/[mediaId]` | `media_assets` by published slug | Missing/unpublished media is a 404. Adapter always returns a local image fallback when provider metadata lacks a usable thumbnail, preserving existing fixed image wrappers. | Build/contract pass; live data QA pending. |

### Public forms

| Page | Behavioral verification | Status |
|---|---|---|
| `/contact` | Existing Contact form submits through the protected, sanitized, rate-limited `/api/contact` endpoint with field, pending, success, and safe error states. | Build/contract pass; live endpoint QA pending. |
| `/join` | Existing application wizard submits an allowlisted payload to protected `/api/join`; browser files/previews are excluded and duplicate submissions are blocked. | Build/contract pass; live endpoint QA pending. |
| `/blog/[slug]` | Existing comment form submits to protected `/api/blog/comments`; success means submitted for moderation, not public publication. | Build/contract pass; live endpoint QA pending. |
| `/donate` | Existing UI creates a pending donation request through `/api/donations/record`; it does not claim payment confirmation or add payment processing. | Build/contract pass; live endpoint QA pending. |

### Merchandise demo

| Area | Result |
|---|---|
| `/merchandise`, `/shop`, product/category/cart routes | Retained exactly as demo/constants behavior. |
| Constants | Retained completely. |
| Supabase/API/payment work | None added. |

## Missing-media and loading/empty-state safeguards

- Existing `next/image` card wrappers, `fill`, and `sizes` values remain unchanged.
- Adapters now provide local fallback image paths for talent, event, blog, and media DTOs when optional CMS media is absent. This prevents an empty image source from causing a runtime error or collapsing an existing media container.
- List pages retain their current constants-compatible collections when a public content service is unavailable or returns no published records. This avoids an unstyled empty page during staged migration.
- Published-but-disabled homepage/About sections are omitted at page composition, leaving no blank section gap.
- Existing component-level empty-state behavior remains in place for client filters such as events and media.

## Constants intentionally retained

No constants fallback has been removed in this verification unit. Removing one requires both a populated published Supabase dataset and a desktop/tablet/mobile visual comparison against the corresponding constant data.

| Constants/location | Why retained |
|---|---|
| `web/constants/talents.js` | Listing fallback, known static route coverage during migration, and demo content for incomplete CMS records. |
| `web/constants/events.js` | List fallback and legacy display data until all event records are fully populated and visually verified. |
| `web/constants/blog.js` | Blog overview fallback and existing hero/pillar/multimedia content not yet modeled as a complete public CMS surface. |
| `web/constants/media.js` | Media list fallback and static presentation collections pending complete published media curation. |
| `web/constants/about.js` | About mission/metrics/gallery fallback until each corresponding `about_sections` record is complete and verified. |
| `web/constants/homepageContent.js` | Controlled fallback for each homepage section during staged public-content rollout. |
| `web/constants/aboutContent.js` | Controlled fallback for singleton About copy/media during staged rollout. |
| Header/Footer component-local constants | Global layout migration is a separate verification scope; JSX and behavior are intentionally unchanged here. |
| All merchandise/cart constants | Mandatory permanent demo-only exclusion from Supabase. |

## Required local visual QA

Run the public app with a configured Supabase project containing representative published content, then compare the following widths against the constants fallback render:

- Desktop: `1440px`
- Tablet: `768px`
- Mobile: `375px`

Check these routes at each applicable viewport:

```text
/
/about
/talents
/talents/<published-slug>
/events
/events/<published-slug>
/blog
/blog/<published-slug>
/media
/media/watch/<published-slug>
/contact
/join
/donate
/non-existent-route
/merchandise
/merchandise/cart
```

Before removing a fallback, confirm:

1. Published CMS content yields the same adapter DTO fields the existing component consumed from constants.
2. Every meaningful `next/image` source is present or intentionally uses the documented fallback.
3. No section/card/header/footer height changes unexpectedly after navigation or hydration.
4. Empty, loading, validation, rate-limit, and safe-error states retain the existing visual language.
5. Mobile drawers, carousels, grids, filter bars, wizard steps, and donation review behavior remain usable.
