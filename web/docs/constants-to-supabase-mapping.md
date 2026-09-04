# Constants-to-Supabase Migration Strategy

**Scope:** Non-destructive migration plan for `web/constants/`.  
**Status:** Constants remain the live UI source. No page, component, adapter, or constant import has been replaced in this unit.

---

## Safety model

```text
Existing constants → transformation utility → draft seed-compatible records
                                         ↘ review-only candidates

Approved Supabase records → server/service → adapter → existing component DTO
```

1. Existing constants remain as development fallbacks until a feature is verified against Supabase.
2. Transform output defaults every importable editorial record to `draft`; it does not publish content.
3. Local development seed data is intentionally small and published only for safe rendering checks.
4. The production import script is a dry run by default and needs both `--apply` and `--confirm-constants-import` before it can use the service-role key.
5. Media URLs are preserved in JSON content or generated as **review candidates**. No current asset is uploaded to Cloudinary, copied to Supabase Storage, or rewritten.
6. Merchandise and all cart/demo commerce data are excluded.
7. Form defaults with mock PII, wizard state, and client-only option data remain local.

---

## Utilities

| File | Purpose | Write behavior |
|---|---|---|
| `scripts/lib/load-constants.mjs` | Loads the current constant modules without writing to them. It removes only presentation-only imports/re-exports in memory so Node can inspect serializable data. | None |
| `scripts/lib/constants-to-records.mjs` | Converts approved canonical constant collections into schema-compatible draft rows and slug-based relationships. | None |
| `scripts/export-constants-records.mjs` | Prints transformed records to stdout or writes a JSON review artifact when `--output <path>` is supplied. | Local JSON only when an output path is provided |
| `scripts/import-constants-to-supabase.mjs` | Dry-run summary by default; performs idempotent upserts only with explicit confirmation. | Supabase only with `--apply --confirm-constants-import` |
| `supabase/seed.sql` | Small, representative, idempotent **local development** dataset. | Local Supabase seed only |

### Commands

```bash
# Review JSON in the terminal; no file and no database write.
npm run content:export

# Write a local review artifact; do not commit generated review artifacts.
npm run content:export -- --output supabase/seed/review-records.json

# Default production-import dry run; does not read credentials or call Supabase.
npm run content:import

# Future approved import only: requires applied migrations, backup/review,
# NEXT_PUBLIC_SUPABASE_URL, and server-only SUPABASE_SERVICE_ROLE_KEY.
npm run content:import -- --apply --confirm-constants-import
```

The importer never logs environment values. It upserts slug-keyed records and composite category assignments so a repeated approved import does not create duplicates. It intentionally does **not** import `reviewCandidates.media_assets`, testimonials, generated media, form defaults, merchandise, or cart data.

---

## Database-to-component adapter rule

Every mapped content record stores current component-only properties under `body` (or `content` for site settings). A future adapter reads database columns plus that JSON payload and reconstructs the existing object exactly. This prevents JSX or CSS changes while database normalization evolves.

| Entity | Normalized database fields | Preserved component DTO fields in JSON | Adapter target |
|---|---|---|---|
| `talents` | `slug`, `title ← name`, `summary ← subtitle/bio`, `location`, `featured`, `sort_order`, lifecycle fields | `id`, `name`, `category`, `categoryKey`, `badge`, `subtitle`, `bio`, `rating`, `reviewCount`, `followers`, `bookingPrice`, `image`, `coverImage`, `isHot`, `tabs`, `awards`, `achievements`, `socials`, `musicTracks`, `publications`, `videoReel`, `relatedCategoryTitle`, `relatedCreatives` | `FEATURED_TALENTS`, `TRENDING_TALENTS`, `TALENT_DIRECTORY_ITEMS`, `TalentProfile`, video/booking pages |
| `events` | `slug`, `title`, `summary`, `starts_at`, `timezone`, `venue_name`, `venue_address`, `featured`, lifecycle fields | `id`, `day`, `month`, `year`, `location`, `description`, `category`, `image`, `ticketLink`, `isPopular`, `isPast`, `dateString`, `categoryTag`, `attendees`, `recapLink` and future rich event details | `UPCOMING_EVENTS`, `PAST_EVENTS`, event cards/details |
| `blog_posts` | `slug`, `title`, `summary ← excerpt`, `blog_author_id`, `featured`, lifecycle fields | `id`, `badge`, `format`, `readTime`, display `date`, `image`; later article body blocks | Blog listing cards, `ArticleHeader`, related cards, home latest posts |
| `about_sections` | `slug`, `title`, `summary`, `body`, ordering/lifecycle fields | Mission/vision cards without React icon values, metrics, moments features, gallery columns/items with original `image`, `alt`, `size` | `WhyChooseUs`, `Moments`, `Gallery` |
| `media_assets` | Source/type/URL metadata, dimensions, duration, caption/alt, lifecycle fields | Original thumbnail/cover/author/display metadata in `body` | Media cards/player adapters after editorial review |
| `homepage_sections` | `slug`, `title`, `summary`, `body`, ordering/lifecycle fields | Hero image and CTA labels/hrefs | Homepage sections |

`image`, `thumbnail`, `coverImage`, `heroImage`, `bgImage`, avatar paths, gallery image paths, and local `/assets/...` values are kept unchanged inside JSON during the transition. They are not automatically converted into Cloudinary uploads.

---

## Constant inventory and exact current shapes

### `constants/about.js`

| Export | Current consumed shape | Transform status | Database mapping / adapter rule |
|---|---|---|---|
| `MISSION_VISION_CARDS` | `[{ id, title, description, icon: ReactComponent }]` | Importable text only | `about_sections.slug = mission-vision`; `body.cards[]` preserves `{ id, title, description, iconKey }`. Adapter maps `iconKey` back to existing frontend icons. React component references are never stored. |
| `IMPACT_METRICS` | `[{ id, title, percentage, description }]` | Importable | `about_sections.slug = impact-metrics`; `body.metrics[]` preserves every field. |
| `MOMENTS_FEATURES` | `[{ id, title, description, iconName, darkBadge }]` | Importable UI metadata | `about_sections.slug = moments-features`; `body.features[]` retains `iconName`/`darkBadge` for the existing component. |
| `ABOUT_GALLERY_COLUMNS` | `Array<Array<{ id, title, image, alt, size }>>` | Importable as section JSON | `about_sections.slug = gallery`; `body.columns` preserves column order, `image`, `alt`, and masonry `size`. |
| `ABOUT_GALLERY_ITEMS` | `ABOUT_GALLERY_COLUMNS.flat()` | Not independently imported | Derived data; adapter derives it from `body.columns` when needed. |

### `constants/talents.js`

| Export | Current consumed shape | Transform status | Database mapping / adapter rule |
|---|---|---|---|
| `TALENT_CATEGORIES` | `[{ id, label }]` | Importable except `all` | `talent_categories.slug ← id`, `title ← label`. `all` remains a UI filter option, not a table row. |
| `TALENT_DIRECTORY_ITEMS` | `[{ id, slug, name, category, categoryKey, badge, subtitle, bio, rating, reviewCount, followers, bookingPrice, image, coverImage, isHot, tabs, awards, achievements, socials, musicTracks?, publications?, videoReel?, relatedCategoryTitle, relatedCreatives[] }]` | Canonical import source | One `talents` record per existing slug plus `talent_category_assignments`. Full existing DTO is retained in `body`; adapter returns current shape without component rewrite. |
| `FEATURED_TALENTS` | `[{ id, slug, name, category, genre, location, rating, followers, image, isHot }]` | Not independently imported | `featured` is derived from membership of canonical talent slug. Existing home-card fields are retained from canonical body or fallback constants. |
| `TRENDING_TALENTS` | `[{ id, slug, name, profession, image, alt }]` | Not independently imported | Trending membership is retained in canonical talent `body.trending`; adapter produces current compact card shape. |

### `constants/events.js`

| Export | Current consumed shape | Transform status | Database mapping / adapter rule |
|---|---|---|---|
| `EVENT_CATEGORIES` | `string[]` | Review-only taxonomy reference | Approved labels map to `event_categories`; the filter-only array remains local until category data is verified. |
| `EVENT_LOCATIONS` | `string[]` | Local UI reference | No location table currently exists; remains local. |
| `UPCOMING_EVENTS` | `[{ id, slug, title, day, month, year, location, description, category, image, ticketLink, isPopular }]` | Importable | `events` core fields plus `body` retaining the display fields. `starts_at` is parsed only when the display date is valid. |
| `PAST_EVENTS` | `[{ id, slug, title, category, categoryTag, dateString, location, month, year, day, attendees, image, recapLink, isPast }]` | Importable | Same `events` path; display-only flags/text remain in `body`. |
| `POPULAR_EVENTS` / `POPULAR_CALENDAR_EVENTS` | Promotional event card arrays | Not independently imported | Must become a featured/sorted query over canonical `events`, avoiding duplicate event records. |
| `DEFAULT_EVENT_DETAILS` | Rich detail fallback with tickets, speakers, schedule, gallery, venue map, FAQs, partners, artists, tags | Review-only | Never seed as a universal default. A verified event detail may be retained in one event `body` record until dedicated relation tables/adapters are added. |

### `constants/blog.js`

| Export | Current consumed shape | Transform status | Database mapping / adapter rule |
|---|---|---|---|
| `BLOG_ARTICLES` | `[{ id, title, slug, badge, format, readTime, date, author, image, excerpt }]` | Importable | Deduplicated `blog_authors`, one `blog_posts` row per slug, and one `blog_post_categories` relation. `badge`, `format`, `readTime`, display `date`, and `image` stay in `body`. |
| `LATEST_BLOG_POSTS` | `BLOG_ARTICLES.slice(0, 3)` | Not independently imported | Derived by `featured`/sort order. |
| `BLOG_HERO_SLIDES` | `[{ id, badge, titlePrefix, titleHighlight, description, ctaText, ctaLink, backgroundImage }]` | Review candidate only | Current schema has no dedicated blog-hero entity; retain local until an approved section/placement design exists. |
| `BLOG_PILLARS` | `[{ id, title, description, image, link }]` | Review candidate only | Remains local until explicit editorial placement design exists. |
| `BLOG_MULTIMEDIA` | `{ mainVideo, playlist[] }` with presentation fields | Excluded | Existing media uses demo YouTube URLs; keep local. |

### `constants/media.js`

| Export | Current consumed shape | Transform status | Database mapping / adapter rule |
|---|---|---|---|
| `MEDIA_FILTER_TABS` | `[{ id, label }]` | Local UI configuration | Remains local. |
| `FEATURED_MEDIA`, `MEDIA_HIGHLIGHTS` | Home media card shapes with title, duration, author and image/link fields | Review candidates | Future mapping: `media_assets` + featured collection/placement. Current local images remain unchanged. |
| `FEATURED_HERO_MEDIA` | `{ badge, title, highlightTitle, description, author, duration, views, videoUrl, bgImage }` | One review candidate only | Transformer deduplicates the valid YouTube ID into a draft `media_assets` candidate. |
| `MEDIA_VIDEOS`, `MEDIA_PODCASTS`, `MEDIA_ALL_MUSIC_TRACKS`, `MEDIA_GALLERY_PHOTOS` | Generated catalog arrays with repeated mock records | Excluded from importer | They are synthetic/repeated and use placeholders (`dQw4w9WgXcQ` or `#`). Keep local until verified media metadata exists. |
| `MEDIA_BEYOND_SPOTLIGHT_PODCASTS`, `MEDIA_DISCOVER_SOUNDS`, `MEDIA_MUSIC_SPOTLIGHT`, `MEDIA_GALLERY_COLUMNS` | Podcast/music/gallery presentation data | Review-only or excluded | No automatic Cloudinary upload; approved assets later map to `media_assets` and `media_collections`. |

### `constants/talentApplication.js` and `constants/talentBooking.js`

| Export group | Current consumed shape | Migration decision |
|---|---|---|
| Steps, categories, experience levels, Nigerian states, social platforms, opportunity/availability/engagement/location options, and booking event types | Small `[{ id, label }]`, `[{ id, title, subtitle }]`, or `string[]` UI option structures | Keep local. These are form UI/reference configuration and have no dedicated schema entity yet. |
| `INITIAL_FORM_DATA` | Mock personal profile, social links, work samples, availability and consent | Never seed. It contains mock PII and local preview/file state. Real entries use protected `join_applications` through the safe RPC/API boundary only. |
| `INITIAL_BOOKING_DATA` | Local booking wizard state | Never seed. It is not CMS data and there is no booking entity in the current schema. |

### `constants/testimonials.js` and `constants/theme.js`

| Export | Current consumed shape | Migration decision |
|---|---|---|
| `TESTIMONIALS` | `[{ id, quote, name, role, avatar }]` | Not imported. The current schema has no testimonial table, and named endorsements need consent/editorial review. Keep current constants as fallback. |
| `BRAND_COLOR` | `{ primary, hover, light, dark, palette }` | Never import. Design tokens remain frontend-owned, and this export is currently unused. |

---

## Local seed versus production import

### `supabase/seed.sql`

The local seed is deliberately representative, not a full data dump. It includes:

- Global/site navigation and footer examples
- Homepage and About records
- One talent/category relationship
- One event/category relationship
- One blog author/post/category relationship
- One draft media review candidate using a valid YouTube metadata shape
- One donation campaign

It does **not** seed any protected form submissions, donation records, blog comments, testimonials, full generated media arrays, merchandise, cart data, or binary assets. All statements use `ON CONFLICT` upserts so repeated local seeding does not duplicate rows.

### Production import script

The production-oriented script:

- Is dry-run by default.
- Uses only `NEXT_PUBLIC_SUPABASE_URL` and the **server-only** `SUPABASE_SERVICE_ROLE_KEY` when explicitly applied.
- Requires migrations to have already been reviewed/applied.
- Upserts by unique `slug` or relationship composite keys.
- Imports records as `draft`; publication remains a separate editorial action.
- Does not upload or transform asset files.
- Does not import review candidates or excluded data.

Do not run it against a remote database without the migration approval/backup process documented in [`../../docs/supabase-migration-ownership.md`](../../docs/supabase-migration-ownership.md).
