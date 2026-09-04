# Royz Houz Public CMS Content Audit

**Audit date:** 2026-08-25  
**Application:** `web/` (Next.js Pages Router, JavaScript)  
**Scope:** Read-only audit of all `pages/`, feature folders in `components/`, `constants/`, `utils/`, existing integration folders, forms, dynamic routes, SEO, and merchandise demo.  
**Implementation status:** No CMS implementation was performed in this unit. No existing UI, JSX structure, CSS Modules, constants, or routes were modified.

---

## Executive summary

The public application is currently a static/client-side prototype:

```text
constants and component-local data → components → existing UI
```

- `web/constants/` is the primary source of public editorial data.
- `web/lib/`, `web/services/`, `web/supabase/migrations/`, `web/supabase/functions/`, and `web/supabase/seed/` are empty.
- `@supabase/supabase-js`, `@supabase/ssr`, and `cloudinary` are installed, and placeholder environment variables exist, but no Supabase client, query, Cloudinary configuration, signed upload, or media delivery integration exists in source code.
- The only API endpoint is `GET /api/health` in `pages/api/health.js`.
- Most dynamic detail routes use SSG/ISR from constants, but several unknown slugs resolve to a default item rather than a 404.
- Content actions that appear transactional (donation, ticketing, booking, contact, newsletter, talent application, cart) are local-state demonstrations and must not be treated as production transactions.

## Target direction (future implementation)

```text
Supabase → server API/repository/service → adapter → existing components → preserved UI
```

Use the existing component data shapes as the adapter contract. Do not move fetch logic into presentational components or redesign sections while migrating.

---

## Shared audit findings

| Area | Current state | Future recommendation | UI-preservation risk |
|---|---|---|---|
| Styling | CSS Modules are used throughout feature components; some Tailwind utilities are also present. | Preserve selectors, module class names, markup hierarchy, breakpoints, and animations. | **High** if wrapper elements or class names change. |
| Data fetching | No fetch layer exists. | Add feature services/hooks outside presentational components; use API routes for public data. | **Medium**: data arrival must not collapse sections. |
| Loading / empty / error | No reusable feedback components currently exist; content is always available via constants. | Add minimal feature-level states using existing section/card patterns, without changing layout. | **High**: avoid layout shift and visual redesign. |
| Assets | Local `/public/assets` paths are used by `next/image`; media URLs are mostly placeholders. | Store Cloudinary/YouTube metadata in Supabase; adapter must yield current `image`, `thumbnail`, `coverImage`, and video URL fields. | **High**: preserve aspect ratios and `next/image` field expectations. |
| Supabase | Installed but not used. | Separate browser anon client from server service-role client. Service role must only be imported server-side. | **Low** if hidden behind services. |
| Cloudinary | Installed but not used. | Admin upload flow later; store only URLs/metadata/references in Supabase. | **Low** if adapters preserve existing asset URLs. |
| API convention | Health endpoint uses `{ success, data, message }`. | Keep that success shape; use `{ success: false, error: { code, message, details? } }` for errors. | **Low**. |
| Search | Header submits to `/search?q=...`, but `/search` does not exist. | Define a public search endpoint/page only as a separate feature. | **Medium**: do not silently redirect existing behavior during unrelated CMS units. |

---

# Public feature map

Each feature below identifies the current content contract and the proposed future migration boundary.

## 1. Global navigation

| Audit item | Finding |
|---|---|
| **Page and route** | Shared by all routes through `pages/_app.js` → `components/layout/Layout/Layout.js` → `components/layout/Header/Header.js`. |
| **Components used** | `Header`, shared `SocialIcons`; mobile drawer/search state is local to `Header`. |
| **Current data source** | Component-local `navItems`; hard-coded social URLs, logo `/logo.png`, and donate link. |
| **Expected object shape** | `navItem: { label, href }`; social: `{ platform, url, ariaLabel }`; site identity: `{ logo, logoAlt, donateHref }`. |
| **Images/media fields** | `logo` is a local static image; no separate alt or media record. |
| **Existing form behaviour** | Search submits client-side to `/search?q=<encoded>`; target route is absent. No data is persisted. |
| **Admin-managed?** | Yes for site navigation, social URLs, and site settings after a global settings feature is introduced. Do not make active-route behavior or mobile state CMS-managed. |
| **Recommended database entity** | `site_settings` (singleton) and `navigation_items` with label, href, placement, order, enabled flag. |
| **Recommended API/service** | `GET /api/site-settings`; `siteSettingsService.getPublicSettings()`. Cacheable public response. |
| **Required adapter** | Map records into `navItems`, static logo URL, and social link fields. Keep route-active detection in `Header`. |
| **UI-preservation risks** | Header uses exact CSS Modules and desktop/mobile structures. Keep item order, CTA position, and responsive drawer markup unchanged. Do not expose invalid CMS external URLs without validation. |
| **Migration priority** | **P2** — global dependency; migrate after a proven content-query foundation. |

## 2. Footer

| Audit item | Finding |
|---|---|
| **Page and route** | Shared by all standard-layout routes through `Layout` → `components/layout/Footer/Footer.js`. |
| **Components used** | `Footer`, shared `SocialIcons`. |
| **Current data source** | Component-local brand description, Explore/Community links, contact information, social URLs, copyright/legal labels. |
| **Expected object shape** | `footer: { brandDescription, socialLinks: [{ platform, url }], columns: [{ heading, links: [{ label, href }] }], contact: { address, email, phone, website }, newsletter: { title, description }, legalLinks: [{ label, href }] }`. |
| **Images/media fields** | Local `/logo.png`. |
| **Existing form behaviour** | Newsletter only toggles local `subscribed` state for four seconds; no request/persistence. |
| **Admin-managed?** | Yes: contact details, social URLs, footer columns, legal links, newsletter copy. Newsletter subscription itself is operational data, not CMS content. |
| **Recommended database entity** | `site_settings` and `navigation_items`; later `newsletter_subscriptions` for opt-ins. |
| **Recommended API/service** | `GET /api/site-settings`; separately `POST /api/newsletter-subscriptions` with Zod validation/rate limiting. |
| **Required adapter** | Return the current column/link and contact shapes; do not render raw CMS rich text here. |
| **UI-preservation risks** | Preserve four-column layout and newsletter box. Audit found conflicting contact/address data across Footer and Contact; normalize content before publishing a shared source. |
| **Migration priority** | **P2** for settings; **P1** for operational newsletter endpoint only when enabled. |

## 3. Homepage

| Audit item | Finding |
|---|---|
| **Page and route** | `/` → `pages/index.js`. |
| **Components used** | `HeroSection`, `FeaturedTalents`, `OurImpact`, `UpcomingEvents`, `MediaHighlight`, `LatestBlog`, `CommunityCTA`, `Testimonials`, `SupportMovement`. |
| **Current data source** | Component-local hero/impact/CTA copy plus `FEATURED_TALENTS`, `UPCOMING_EVENTS`, `FEATURED_MEDIA`, `MEDIA_HIGHLIGHTS`, `LATEST_BLOG_POSTS`, `TESTIMONIALS`. |
| **Expected object shape** | Hero/stat data are currently inline. Featured talents: `{ id, slug, name, category, genre, location, rating, followers, image, isHot }`. Events: `{ id, slug, title, day, month, year, location, image, ticketLink }`. Home featured media: `{ id, category, title, duration, views, image, watchLink, author: { name, avatar } }`; highlights: `{ id, title, author, duration, image, link }`. Blog cards: `{ slug, image, title, category?, readTime, date }`. Testimonials: `{ id, quote, name, role, avatar }`. |
| **Images/media fields** | Hero/impact backgrounds are local component fields. Card fields use `image`; talent uses `image`; media uses `image` and nested `author.avatar`. `OurImpact` hard-codes a placeholder YouTube URL. |
| **Existing form behaviour** | `CommunityCTA` validates a basic `@` condition and presents temporary local success only. |
| **Admin-managed?** | Yes: hero/copy/stats, featured ordering, impact media/copy, CTA copy, featured talent/event/media/blog selections, and testimonials. Newsletter submission is operational, not content. |
| **Recommended database entity** | `site_sections` or explicit singleton sections (`home_hero`, `home_impact`, `home_ctas`), plus `talents`, `events`, `media_items`, `blog_posts`, `testimonials`, and optional `content_placements`. |
| **Recommended API/service** | `GET /api/home`; `homeService.getHomePage()` composes limited featured records server-side. |
| **Required adapter** | `homeAdapter` must map normalized CMS records into every existing card prop shape, including display strings (`followers`, `views`, `readTime`) until components are intentionally updated. |
| **UI-preservation risks** | Section composition/order in `pages/index.js` must remain unchanged. Ensure empty featured collections do not remove or collapse styled sections. `LatestBlog` expects `category`, but current `BLOG_ARTICLES` lacks it. |
| **Migration priority** | **P1** — high-visibility read-only CMS surface, but complete after core talent/event/blog/media entities exist. |

## 4. About

| Audit item | Finding |
|---|---|
| **Page and route** | `/about` → `pages/about.js`. |
| **Components used** | `AboutHero`, `AboutStory`, `WhyChooseUs`, `Moments`, `Gallery`, `Testimonials`, `Breadcrumb`. |
| **Current data source** | Static hero/story/leader content in components; `constants/about.js` for `MISSION_VISION_CARDS`, `IMPACT_METRICS`, `MOMENTS_FEATURES`, `ABOUT_GALLERY_COLUMNS`; `TESTIMONIALS`. |
| **Expected object shape** | Mission/vision: `{ id, title, description, icon }`; metrics: `{ id, title, percentage, description }`; moments: `{ id, title, description, iconName, darkBadge }`; gallery uses columns `Array<Array<{ id, title, image, alt, size }>>`, `size ∈ short | tall | extraTall`. |
| **Images/media fields** | Hero, story/team/leader assets are local literals. Gallery uses `image` and `alt`. |
| **Existing form behaviour** | None. |
| **Admin-managed?** | Yes: all editorial text, leader/story information, CTAs, metrics, moments, and gallery. Icons should remain a frontend-controlled mapping. |
| **Recommended database entity** | `site_pages`/`site_sections` for singleton About blocks and `media_assets`; optional `about_gallery_items`. |
| **Recommended API/service** | `GET /api/pages/about`; `aboutService.getAboutPage()`. |
| **Required adapter** | Convert a persisted `icon_key` to existing icon components; format gallery items into existing column arrays (or retain display-order/column fields). Validate `percentage` is 0–100. |
| **UI-preservation risks** | `MISSION_VISION_CARDS.icon` currently stores imported React components and is not serializable. Do not persist components. Preserve CSS-controlled gallery sizes and fixed story hierarchy. |
| **Migration priority** | **P3** — static informational content; low operational urgency. |

## 5. Talents

| Audit item | Finding |
|---|---|
| **Page and routes** | `/talents`, `/talents/[slug]`, `/talents/[slug]/book`, `/talents/[slug]/video`, `/talents/[slug]/video/[videoId]`, `/talents/apply`, and `/join`. |
| **Components used** | Listing: `TalentHero`, `TrendingTalents`, `TalentDirectory`, `TalentCTA`, `Testimonials`. Profile: `TalentProfile` and its hero/sidebar/tabs/sticky bar/share components. Video: `TalentVideoPlayer` family. Forms: `TalentApplication` and `TalentBooking` families. |
| **Current data source** | `FEATURED_TALENTS`, `TRENDING_TALENTS`, `TALENT_CATEGORIES`, `TALENT_DIRECTORY_ITEMS` in `constants/talents.js`; application/booking constants; `utils/talentHelpers.js`. |
| **Expected object shape** | Homepage card: `{ id, slug, name, category, genre, location, rating, followers, image, isHot }`. Trending: `{ id, slug, name, profession, image, alt }`. Canonical directory/profile: `{ id, slug, name, category, categoryKey, badge, subtitle, bio, rating, reviewCount, followers, bookingPrice, image, coverImage, isHot, tabs, awards, achievements, socials, musicTracks?, publications?, videoReel?, relatedCategoryTitle, relatedCreatives }`. `socials` is `{ facebook, youtube, instagram, twitter, tiktok }`; `musicTracks` uses `{ id?, title, duration, plays?, streams? }`; `videoReel` contains `thumbnail`, `portfolioItems`, `upNextVideos`; related cards use `{ id, name, category, image, slug }`. |
| **Images/media fields** | `image`, `coverImage`, `videoReel.thumbnail`, `upNextVideos[].thumbnail`, related images, and talent portfolio/video records. Current data generally lacks canonical source URLs, captions, asset metadata, rights, and transcript data. |
| **Existing form behaviour** | Directory has client-side search/filter/sort/pagination. Application is a five-step local wizard; browser file previews only and simulated success. Booking is a four-step local request form and locally generated reference. No persistence or server notification. |
| **Admin-managed?** | Yes: public profiles, categories, featured/trending placement, bios, social accounts, galleries, credits, awards, video/audio portfolios, display booking price, and curation. Applications and bookings are protected operational submissions, not public CMS records. |
| **Recommended database entity** | `talents`, `talent_categories`, `talent_social_links`, `talent_awards`, `talent_achievements`, `talent_media`, `talent_related`, `talent_applications`, `talent_application_assets`, `talent_bookings`. |
| **Recommended API/service** | Public: `GET /api/talents?page&limit&category&search&sort`, `GET /api/talents/[slug]`; `talentService`. Protected forms: `POST /api/talent-applications`, `POST /api/talents/[slug]/bookings`, Zod validators, rate limits, private asset upload flow. |
| **Required adapter** | `talentAdapter` must create current card variants and rich `TalentProfile` input from normalized relations. Keep hard-coded constants as fallback until individual listing/profile/media modules are verified. |
| **UI-preservation risks** | The current canonical records are heterogeneous: music, publications, and video data are optional. Preserve conditional tab behavior. Unknown slugs currently return the first talent through `getTalentBySlug`; migration should return `notFound` rather than changing the visual design. Avoid leaking private application file URLs. |
| **Migration priority** | **P1** — core directory/content surface; split into profile/listing first, then application/booking operations. |

### Talent form contracts

- **Application input currently held in `INITIAL_FORM_DATA`:**
  `{ fullName, stageName, phoneNumber, dateOfBirth, emailAddress, stateRegion, profilePhoto, profilePhotoPreview, talentCategory, customTalentCategory, experienceLevel, yearsOfExperience, shortBio, genresSpecialties, socialProfiles: [{ id, platform, url }], otherPlatformUrl, workSamples: [{ id, name, type, size, thumbnail? }], interestedInBookings, opportunities: string[], generalAvailability, preferredEngagement, workLocations: string[], languages, equipmentResources, achievements: string[], references, confirmedAccuracy }`.
- **Booking request contract:**
  `{ firstName, lastName, email, phone, eventType, eventDate, eventLocation, eventDescription, budget, agreedToTerms, bookingReference }`.
- **Operational concerns:** application defaults contain sample personal data and files are only browser `File`/object URLs. Server-side validation, anti-spam, virus/type/size validation, private storage, consent timestamp/version, status workflow, and server-created references are required later.

## 6. Events

| Audit item | Finding |
|---|---|
| **Page and routes** | `/events` and `/events/[slug]`. |
| **Components used** | List: `EventsHero`, `EventsTabs`, `EventsFilterBar`, `EventsSection`, `EventCard`. Detail: `EventOverview`, detail hero/about/sidebar/ticket selector/speakers/schedule/gallery/FAQ/popular events/payment modals; `SupportMovement`. |
| **Current data source** | `UPCOMING_EVENTS`, `POPULAR_EVENTS`, `PAST_EVENTS`, `DEFAULT_EVENT_DETAILS`, `EVENT_CATEGORIES`, `EVENT_LOCATIONS`, `POPULAR_CALENDAR_EVENTS` in `constants/events.js`; `utils/eventHelpers.js`. |
| **Expected object shape** | Listing: `{ id, slug?, title, day, month, year, location, description?, category, image, ticketLink?, isPopular? }`; past records add `{ categoryTag?, dateString?, attendees?, recapLink?, isPast? }`. Full detail: listing fields plus `{ categoryTag, time, venue, heroImage, startingPrice, ticketsSold, totalTickets, countdownTarget, aboutParagraphs, ticketTiers, speakers, schedule, gallery, venueMap, faqs, host, partners, performingArtists, tags }`. Tier: `{ id, name, price, priceFormatted, badge?, badgeType?, isDefault?, features: string[] }`; speaker: `{ id, name, role, organization?, avatar }`; venue map: `{ name, address, mapImage, googleMapsUrl }`. |
| **Images/media fields** | `image`, `heroImage`, speaker/host `avatar`, `gallery: string[]`, `venueMap.mapImage`. |
| **Existing form behaviour** | Client filtering/search/sort. Ticket flow selects local tiers/quantity, collects attendee details, calculates a local 8% fee capped at ₦1,000, then simulates payment/success. No inventory/order/payment persistence. |
| **Admin-managed?** | Yes: event details, lifecycle/publication, dates, locations, schedules, speakers, venue, gallery, FAQs, partners, media, visible ticket tiers, and featured order. Ticketing is transactional, not only CMS content. |
| **Recommended database entity** | `events`, `event_categories`, `event_speakers`, `event_schedule_items`, `event_gallery_items`, `event_faqs`, `event_partners`, `event_ticket_tiers`; later `event_orders`, `event_registrants`, `ticket_inventory`, `payment_transactions`. |
| **Recommended API/service** | Public: `GET /api/events?page&limit&category&location&search&sort&status`, `GET /api/events/[slug]`; `eventService`. Ticket request/payment endpoints must use server-calculated pricing/inventory and verified payment webhooks. |
| **Required adapter** | `eventAdapter` maps ISO dates/times/time zones into existing `day`, `month`, `year`, `dateString`, and rich overview fields. Merge defaults only as temporary fallback—not as published content. |
| **UI-preservation risks** | Many event detail screens are populated by `DEFAULT_EVENT_DETAILS`, masking missing event data. Require event detail completeness before removing fallback. `selectedLocation` is currently cosmetic and must not change layout when made functional. `EVENT_CATEGORIES` lacks `Conferences` while records use it. |
| **Migration priority** | **P1** — public content first; **P0 only if ticket payments are enabled** because current flow is a demo. |

### Event ticket form contract

`{ reference, tier, quantity, formData: { firstName, lastName, email, phone, organization, dietary, subscribeNews }, ticketSubtotal, serviceFee, grandTotal, eventTitle }`.

**Future rule:** Never trust any client-supplied tier, price, totals, status, or payment result. The server must load tier/tax/inventory, persist an order, and verify provider webhooks.

## 7. Blog

| Audit item | Finding |
|---|---|
| **Page and routes** | `/blog` and `/blog/[slug]`. |
| **Components used** | Overview: `BlogOverview`, `BlogHero`, `BlogPillars`, `BlogArticles`, `BlogMultimedia`, `BlogCta`. Detail: `ArticleHeader`, `ArticleBody`, `ArticleAuthorCard`, `ArticleCommentForm`, `ArticleComments`, `ArticleRelated`. |
| **Current data source** | `BLOG_HERO_SLIDES`, `BLOG_PILLARS`, `BLOG_ARTICLES`, `BLOG_MULTIMEDIA`, `LATEST_BLOG_POSTS` in `constants/blog.js`; related cards use `BLOG_ARTICLES`. |
| **Expected object shape** | Hero: `{ id, badge, titlePrefix, titleHighlight, description, ctaText, ctaLink, backgroundImage }`. Pillar: `{ id, title, description, image, link }`. Article: `{ id, title, slug, badge, format, readTime, date, author, image, excerpt }`. Multimedia: `{ mainVideo: { title, tagline, subtitle, coverImage, videoUrl }, playlist: [{ id, title, category, duration, videoUrl }] }`. |
| **Images/media fields** | Hero `backgroundImage`; article `image`; multimedia `coverImage` and `videoUrl`. |
| **Existing form behaviour** | Detail comment form is client-only. Comments/replies/edit/delete are local; likes use browser local storage. No identity/auth, moderation, server persistence, or notification. |
| **Admin-managed?** | Yes: posts, authors, categories/tags, rich body blocks, publication state, feature placement, hero slides, pillars, multimedia, SEO fields, related content. Comments are operational/moderation data. |
| **Recommended database entity** | `blog_posts`, `blog_authors`, `blog_categories`, `blog_tags`, junction tables, `blog_hero_slides`, `blog_pillars`, `blog_media`, optional `blog_comments`/`blog_comment_replies`. |
| **Recommended API/service** | Public: `GET /api/blog?page&limit&category&search`, `GET /api/blog/[slug]`; `blogService`. Comments later need protected `POST/PATCH/DELETE` endpoints with auth/ownership/moderation/rate limiting. |
| **Required adapter** | `blogAdapter` must map database post/author/media records to current listing cards and detail header. Introduce a portable rich-text-to-`ArticleBody` block adapter before making body dynamic. |
| **UI-preservation risks** | `ArticleBody` is static and receives no article prop, so all posts render the same body. `ArticleAuthorCard`/header use fixed author presentation. Unknown slugs fall back to the first article/hero-like record rather than 404. Blog cards expect `category`, absent from existing articles. Keep static fallback until all three are corrected in one feature unit. |
| **Migration priority** | **P1** — editorial content; comments are **P3** after identity/moderation design. |

## 8. Media

| Audit item | Finding |
|---|---|
| **Page and routes** | `/media`, `/media/watch`, `/media/watch/[mediaId]`. |
| **Components used** | `MediaHero`, `MediaFilters`, `MediaVideos`, `MediaPodcasts`, `MediaMusic`, `MediaGallery`, `MediaPagination`, `MediaCta`; detail reuses `TalentVideoPlayer`. |
| **Current data source** | `FEATURED_HERO_MEDIA`, `FEATURED_MEDIA`, `MEDIA_HIGHLIGHTS`, `MEDIA_VIDEOS`, `MEDIA_BEYOND_SPOTLIGHT_PODCASTS`, `MEDIA_PODCASTS`, `MEDIA_DISCOVER_SOUNDS`, `MEDIA_ALL_MUSIC_TRACKS`, `MEDIA_MUSIC_SPOTLIGHT`, `MEDIA_GALLERY_PHOTOS`, `MEDIA_FILTER_TABS` in `constants/media.js`. |
| **Expected object shape** | Video: `{ id, title, subtitle, duration, thumbnail, author: { name, avatar }, views, publishedAt, videoUrl }`. Podcast: `{ id, title, description, host, duration, views, publishedAt, thumbnail, audioUrl }`. Track: `{ id, title, genre, artist, coverImage, audioUrl, duration? }`. Gallery: `{ id, title, image, alt, size }`. Featured hero: `{ badge, title, highlightTitle, description, author, duration, views, videoUrl, bgImage }`. |
| **Images/media fields** | Cloudinary target metadata should cover URL, secure URL, public ID, resource type, format, width, height, duration, bytes, alt, caption. YouTube target metadata should cover original URL, normalized ID, embed URL, thumbnail URL, title, caption. Existing fields use `thumbnail`, `coverImage`, `image`, `bgImage`, `author.avatar`, `videoUrl`, and `audioUrl`. |
| **Existing form behaviour** | No submission forms. Tabs synchronize to `?tab=` shallow route. Search/filter/pagination are local. Gallery opens local lightbox. |
| **Admin-managed?** | Yes: media catalogue, credits, metadata, assets, content type, playlists, featured placements, captions, alt text, publish state, and gallery. |
| **Recommended database entity** | `media_items`, `media_assets`, `media_contributors`, `media_collections`/`playlists`, `media_placements`; use type discriminator (`video`, `podcast`, `track`, `gallery_image`). |
| **Recommended API/service** | `GET /api/media?page&limit&type&search&sort`, `GET /api/media/[slug-or-id]`, `mediaService`; protected Cloudinary signed-upload and media-admin APIs later. |
| **Required adapter** | `mediaAdapter` maps normalized records into current incompatible component shapes and preserves compact homepage promotion vs full catalogue variants. It must normalize YouTube URLs before display and choose Cloudinary image/video transformations per usage. |
| **UI-preservation risks** | `sortBy` is rendered but unused. Gallery search calls `p.category.toLowerCase()` even though gallery records omit `category`, causing a runtime error on nonempty search. `MEDIA_VIDEOS`/podcasts/tracks/gallery are repeated generated demo records. Detail adapter currently discards real media source URLs when adapting to `TalentVideoPlayer`. |
| **Migration priority** | **P1** for read-only content; **P2** for admin uploads after Cloudinary security design. |

## 9. Contact

| Audit item | Finding |
|---|---|
| **Page and route** | `/contact` → `ContactHero`, `ContactInfo`, `ContactMap`, `ContactFAQ`, `ContactCTA`. |
| **Components used** | All under `components/contact/`. |
| **Current data source** | All contact cards, map information, FAQs, socials, country codes, and inquiry reasons are component-local. |
| **Expected object shape** | Public contact settings: `{ email, phone, hours, headquarters: { name, address, mapEmbedUrl?, mapImage?, directionsUrl? }, socialLinks }`; FAQ `{ id, question, answer }`; contact submission `{ firstName, lastName?, email, phone?, countryCode?, reason?, message }`. |
| **Images/media fields** | Hero/local imagery; Google Maps iframe embed. No CMS media contract currently. |
| **Existing form behaviour** | Client required checks for first name/email/message; message capped at 600. Country UI is local and its dial code is not included in submitted form data. Submit clears form and shows temporary success only. |
| **Admin-managed?** | Public contact details, FAQ, map settings, and page copy: yes. Contact submissions: protected operational data. |
| **Recommended database entity** | `site_settings`, `contact_faqs`, `contact_messages`, optionally `contact_inquiry_types`. |
| **Recommended API/service** | `GET /api/contact-page`; `POST /api/contact-messages` with Zod validation, rate limiting/spam controls, and safe error handling; `contactService`. |
| **Required adapter** | `contactAdapter` returns display-ready phone/email/map/FAQ data and maps public inquiry type labels. |
| **UI-preservation risks** | Do not alter country picker/form markup. Contact information conflicts across Contact/Footer (Lagos vs Bali and different email/phone values); resolve content before centralizing. |
| **Migration priority** | **P1** for message persistence/security; **P3** for static contact copy. |

## 10. Join / Talent application entry point

| Audit item | Finding |
|---|---|
| **Page and route** | `/join` → `TalentApplication`; also `/talents/apply` duplicates the same feature. |
| **Components used** | `TalentApplication` and five step/progress/success components. |
| **Current data source** | `constants/talentApplication.js`; component-local UI state. |
| **Expected object shape** | See Talents application contract above. Supporting options are `{ id, label }` / `{ id, title, subtitle }`. |
| **Images/media fields** | Browser-selected profile/work samples only; no persisted URL/metadata. |
| **Existing form behaviour** | Full local application wizard with prefilled sample PII and simulated 800ms completion/random `RH-APP-*` reference. |
| **Admin-managed?** | Application copy/options may be admin-managed. Applicant submission, files, and review status are protected operational data. |
| **Recommended database entity** | `application_configuration`, `talent_applications`, `talent_application_assets`, `application_status_history`. |
| **Recommended API/service** | `GET /api/talent-application-config`; `POST /api/talent-applications`; a separate signed private-upload flow. |
| **Required adapter** | Keep existing option structures and renderable preview records; map persisted asset metadata into existing `workSamples` display shape only after authorized upload completes. |
| **UI-preservation risks** | Duplicate routes require a canonical/redirect decision separately from CMS work. Do not allow constants fallback to submit fake PII. |
| **Migration priority** | **P1** if applications are intended to be live; otherwise keep explicit demo state. |

## 11. Donations

| Audit item | Finding |
|---|---|
| **Page and route** | `/donate` → `DonateHero`, `DonationForm`, `DonationReview`, `PaymentSuccess`, `PaymentFailure`. |
| **Components used** | All under `components/donate/`; page controls local form/review/success/failure states. |
| **Current data source** | Page-local `donationData`; component-local frequencies, preset amounts, causes, country codes, and presentation text. |
| **Expected object shape** | Donation intent: `{ frequency, frequencyLabel, amount, customAmount, cause, fullName, email, phone }`. CMS-facing campaign config: `{ id, name, description, presetAmounts, allowedFrequencies, currency, active }`. |
| **Images/media fields** | Static hero/presentation assets; no donor media. |
| **Existing form behaviour** | Starts with sample donor personal data. Form validates amount and required HTML fields; review edits locally; “Paystack” process always turns into local success after timeout. No transaction, provider call, donor persistence, receipt, webhook, or recurring mandate. |
| **Admin-managed?** | Campaign/cause copy, presets, impact content: yes. Donor/payment data: transactional and protected, not CMS content. |
| **Recommended database entity** | `donation_campaigns`, `donation_causes`; operational `donation_intents`, `donations`, `payment_transactions`, `donor_consents`. |
| **Recommended API/service** | `GET /api/donation-config`; payment provider implementation must use server `POST /api/donations/initialize` and verified webhook endpoint. |
| **Required adapter** | `donationAdapter` maps CMS configuration into existing selectors and labels. Payment amounts/statuses must come from server response, not adapters/browser state. |
| **UI-preservation risks** | Current visual success is not a verified payment. Never connect the existing success state directly to client input; preserve UI but make success depend on server-confirmed state. |
| **Migration priority** | **P0** only if accepting money; otherwise retain clearly as a demonstration and do not introduce partial payments. |

## 12. SEO

| Audit item | Finding |
|---|---|
| **Pages and routes** | Most primary pages use `next/head`; `_document.js` defines document-level metadata. `404.js` and `500.js` have no page-level SEO. |
| **Components used** | Page-level `Head` elements; no centralized SEO component/service. |
| **Current data source** | Titles/descriptions/partial OG fields are inline in page files. Dynamic pages derive some fields from constants. |
| **Expected object shape** | `seo: { title, description, canonicalUrl, ogTitle?, ogDescription?, ogImage?, ogType?, twitterCard?, robots? }`; entity-level fields should include `slug`, `image/ogImage`, and structured-data-ready dates/locations where relevant. |
| **Images/media fields** | OG fields frequently use relative local paths; reliable social sharing requires absolute public URLs. |
| **Existing form behaviour** | None. |
| **Admin-managed?** | Yes for page/entity SEO overrides and global defaults; structured-data rendering remains application-owned. |
| **Recommended database entity** | `site_settings` for defaults; optional `seo_metadata` attached to `blog_posts`, `events`, `talents`, and CMS pages. |
| **Recommended API/service** | Server-side SEO fields should be retrieved with entity content through respective services; introduce a shared `buildSeo` utility, not a client fetch. |
| **Required adapter** | `seoAdapter` produces `next/head` props from settings/entity fields and safely creates absolute URLs. |
| **UI-preservation risks** | None visual, but high crawl risk: no canonical tags, no sitemap/robots implementation, no JSON-LD, partial OG/Twitter metadata, duplicate URL aliases, and unknown dynamic slugs returning default content. |
| **Migration priority** | **P1** alongside each migrated dynamic content entity; do not index dynamic CMS paths until `notFound` behavior is correct. |

### Existing SEO observations

- `/join` and `/talents/apply` duplicate application content.
- `/shop`, `/merchandise`, `/merchandise/category`, and `/merchandise/category/[slug]` overlap in merchandise behavior.
- `/product/[id]` and `/merchandise/product/[id]` duplicate product routes.
- `/cart` and `/merchandise/cart` duplicate the cart page.
- No canonical tags, `og:url`, Twitter card metadata, sitemap, robots route/file, or JSON-LD were found.
- Blog, event, talent, media, and product detail routes should return `notFound` for nonexistent identifiers rather than render fallback content.
- Footer links to `/impact`, `/terms`, and `/privacy`, but no pages exist.

## 13. Merchandise — explicitly excluded from CMS implementation

> **Required classification:**
>
> - **Public demo only**
> - **Existing constants retained**
> - **No Supabase integration**
> - **Admin “Coming Soon”**

| Audit item | Finding |
|---|---|
| **Pages and routes** | `/merchandise`, `/shop`, `/merchandise/category`, `/merchandise/category/[slug]`, `/merchandise/product/[id]`, `/product/[id]`, `/cart`, `/merchandise/cart`. |
| **Components used** | Landing: `MerchHero`, `MerchFeatures`, `MerchCollections`, `MerchProductGrid`, `MerchWhyUs`, `MerchTestimonial`, `MerchStatsBanner`, `MerchCTA`, `CartDrawer`. Category: breadcrumb/sidebar/grid/cards. Detail: gallery/info/features/editorial/reviews/recently viewed. Cart: item/list/summary. |
| **Current data source** | Inline `NEW_ARRIVALS`/`COMMUNITY_FAVORITES` in `pages/merchandise.js`; inline `CASUAL_PRODUCTS` in category page; inline `DEFAULT_PRODUCT` in product page; `INITIAL_CART_ITEMS` in cart page; local component arrays for editorial/collection/reviews. |
| **Expected object shape** | Landing card: `{ id, title, category, rating, reviewsCount?, price, oldPrice?, badge, image }`. Cart item: `{ id, title, category, price, quantity, image }`. Detail object has `id, title, category, price, oldPrice?, discountPercent?, rating, reviews, description, images, editorialImages`. |
| **Images/media fields** | Product `image`/`images`/editorial image fields point to local assets. |
| **Existing form behaviour** | Product/category cart interactions are local and disconnected from `/cart`; filters/sort/pagination are visual state only; product `[id]` and category `[slug]` do not select real records; checkout uses browser `alert()` only. No payment/checkout is present. |
| **Admin-managed?** | **No in this project phase.** Public demo only. Preserve mock/constants and cart demonstration behavior. Admin gets only a polished Merchandise navigation item and Coming Soon page. |
| **Recommended database entity** | **None. Do not create product, inventory, cart, order, payment, or merchandise migrations.** |
| **Recommended API/service** | **None. Do not create merchandise APIs, queries, services, or admin forms.** |
| **Required adapter** | **None. Retain existing constants and local state exactly.** |
| **UI-preservation risks** | High: do not restructure the current demo or replace its working local cart UI. Do not accidentally make checkout appear live. |
| **Migration priority** | **Excluded / no migration.** |

---

# Route and implementation inventory

## All page files audited

| File | Route / responsibility | Current source / rendering |
|---|---|---|
| `pages/_app.js` | Global app wrapper | Loads global CSS/Lato and shared `Layout`. |
| `pages/_document.js` | HTML document shell | Document-level head/font setup. |
| `pages/index.js` | `/` | Homepage composition. |
| `pages/about.js` | `/about` | About composition. |
| `pages/contact.js` | `/contact` | Contact composition. |
| `pages/donate.js` | `/donate` | Local-state donation demo. |
| `pages/join.js` | `/join` | Duplicate talent application entry. |
| `pages/talents.js` | `/talents` | Talent directory/search composition. |
| `pages/talents/[slug].js` | Talent profile | Static paths/props from constants; ISR 60 seconds. |
| `pages/talents/[slug]/book.js` | Booking request | Static props from constants; local submit demo. |
| `pages/talents/[slug]/video/index.js` | Talent video index | Local constant lookup. |
| `pages/talents/[slug]/video/[videoId].js` | Talent video | Local constant lookup. |
| `pages/talents/apply.js` | Application | Duplicate TalentApplication feature. |
| `pages/events.js` | `/events` | Client filter/search/sort over constants. |
| `pages/events/[slug].js` | Event detail | Static paths/props and merged default details. |
| `pages/blog.js` | `/blog` | Blog overview composition. |
| `pages/blog/[slug].js` | Blog detail | Client local lookup and local comments. |
| `pages/media.js` | `/media` | Local media catalogue/tab/filter state. |
| `pages/media/watch/index.js` | `/media/watch` | Convenience media detail route. |
| `pages/media/watch/[mediaId].js` | Media detail | Synthesizes talent/video props from local media shapes. |
| `pages/merchandise.js` | `/merchandise` | Local merchandise landing/cart demo. |
| `pages/shop.js` | `/shop` | Merchandise category alias. |
| `pages/cart.js` | `/cart` | Separate local cart demo. |
| `pages/merchandise/cart.js` | `/merchandise/cart` | Cart alias. |
| `pages/merchandise/category/index.js` | `/merchandise/category` | Category experience. |
| `pages/merchandise/category/[slug].js` | Category detail | Same local product dataset for any slug. |
| `pages/merchandise/product/[id].js` | Product detail | Same local default product for any ID. |
| `pages/product/[id].js` | Product alias | Merchandise product alias. |
| `pages/404.js` / `pages/500.js` | Error pages | Static error UI. |
| `pages/api/health.js` | `GET /api/health` | Only existing API; uses static health payload. |

## Constants audited

| File | Role | Migration treatment |
|---|---|---|
| `constants/about.js` | About metrics, values, gallery | Retain fallback; later map serializable DB fields to current shapes. |
| `constants/blog.js` | Hero/pillars/posts/multimedia | Retain fallback; build post/body/author adapters. |
| `constants/events.js` | Listing/detail/ticket mock event data | Retain fallback; migration must stop generic detail merging after records are complete. |
| `constants/media.js` | Hero/videos/podcasts/music/gallery | Retain fallback; normalize through adapter, not component rewrites. |
| `constants/talentApplication.js` | Multi-step options/defaults | Retain UI options; remove mock PII only when live submit is implemented/verified. |
| `constants/talentBooking.js` | Booking options/defaults | Retain UI options; server creates reference/status. |
| `constants/talents.js` | Cards/directory/profiles/video data | Primary fallback for talent migration. |
| `constants/testimonials.js` | Testimonial carousel content | Straightforward fallback/entity seed candidate. |
| `constants/theme.js` | Brand color object | Not used by audited features; no CMS requirement. |

## Utilities and integrations audited

| Location | Finding |
|---|---|
| `utils/talentHelpers.js` | Looks up constant talent by slug/id and falls back to first talent; derives same-category related items. Replace with server service/repository later, preserving component shape. |
| `utils/eventHelpers.js` | Combines event arrays and merges sparse results into `DEFAULT_EVENT_DETAILS`; unknown slugs generate title-cased fallback. Replace with service/adapter and proper 404 behavior. |
| `utils/index.js` | Exports talent helpers only. |
| `lib/` | Empty. |
| `services/` | Empty. |
| `supabase/` | Directories exist but migrations/functions/seed are empty. |
| Cloudinary source usage | None found. Package/env placeholders only. |
| Supabase source usage | None found. Packages/env placeholders only. |
| `pages/api/health.js` | Existing API response convention; unsupported methods incorrectly return 455 instead of conventional 405. Do not change in this audit unit. |

---

# Recommended migration order

| Priority | Unit | Scope | Fallback policy |
|---|---|---|---|
| **P0** | Transaction readiness (only if enabled) | Donations/event ticket payments | Do not enable real payment UI until server init/webhook/reconciliation are complete. |
| **P1** | Foundation | Web Supabase clients, server repository/service layer, API response helpers, base migrations/RLS, public settings entity | No component changes; constants remain fallback. |
| **P1** | Talents | Listing/profile read path → adapter → current components | Verify list/profile independently before replacing fallback. |
| **P1** | Events | Listing/detail read path → adapter → current components | Retain `DEFAULT_EVENT_DETAILS` until complete per-event content is verified. |
| **P1** | Blog | Listing/detail/author/body read path → adapter | Keep body/cards fallback until post, author, and blocks are all complete. |
| **P1** | Media | Catalogue/type filtering/detail metadata → adapter | Retain existing static media while Cloudinary/YouTube validation is introduced. |
| **P1** | SEO | Entity SEO fields, canonical policy, dynamic `notFound`, sitemap/robots | Pair with each content feature; avoid indexing default fallback pages. |
| **P1** | Public submissions | Contact, newsletter, talent applications/bookings | Add Zod/server validation/rate limiting/private storage; preserve existing screens. |
| **P2** | Homepage/global settings | Home placements, header/footer/site settings | Query via server composition; retain static fallback per section. |
| **P2** | Admin setup | Admin auth/RBAC, audit logging, content CRUD/media upload | Merchandise nav only; Coming Soon page; no merchandise entities. |
| **P3** | About/static pages | About CMS blocks and contact copy/FAQ | Low-risk once settings/media patterns exist. |
| **P3** | Comments | Auth, moderation, comment/reply/like service | Do not convert local comments without a moderation/identity design. |
| **Excluded** | Merchandise | No public CMS/admin CRUD/data migration/API | **Public demo only; constants retained; admin Coming Soon.** |

---

# Pre-implementation requirements checklist

Before replacing a constants-backed feature:

1. Define a migration entity/relations and RLS policy in `web/supabase/migrations/`.
2. Add only server-side service-role usage; public browser code uses the anon key where truly needed.
3. Add server repository → service → API route with Zod validation for all input.
4. Add a feature adapter that yields the *existing* component contract.
5. Preserve constants as a fallback and identify a verification condition before removing them.
6. Add loading, empty, and error states without changing CSS Modules, DOM hierarchy, or responsive behavior beyond the state itself.
7. Use paginated list API contracts and server-side filtering/search for catalog endpoints.
8. Return `notFound` for absent dynamic records; never silently substitute a different talent/event/post/product.
9. For admin writes, enforce authorization server-side and add audit logging.
10. Run lint and production build for every implementation unit.

---

# Audit-only limitations

This document describes the source code currently present. It does not certify any payment, operational form, asset upload, or external service as live because no implementation was found. It intentionally does not create database tables, APIs, Supabase clients, Cloudinary integrations, or UI changes.
