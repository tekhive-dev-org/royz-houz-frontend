const DEFAULT_STATUS = "draft";

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cloneSerializable(value) {
  return JSON.parse(JSON.stringify(value));
}

function createContentRecord({ slug, title, summary = null, body = {}, sortOrder = 0, featured = false }) {
  return {
    slug,
    title,
    summary,
    body: cloneSerializable(body),
    sort_order: sortOrder,
    featured,
    status: DEFAULT_STATUS,
    published_at: null,
    scheduled_at: null,
  };
}

function parseDisplayEventDate(event) {
  const monthMap = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };
  const month = monthMap[String(event.month || "").slice(0, 3).toLowerCase()];
  const year = Number(event.year);
  const day = Number(event.day);

  if (!Number.isInteger(year) || !Number.isInteger(day) || month === undefined) {
    return null;
  }

  const parsed = new Date(Date.UTC(year, month, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed.toISOString();
}

function uniqueBySlug(records) {
  return Array.from(new Map(records.map((record) => [record.slug, record])).values());
}

function extractYoutubeId(url) {
  const match = String(url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{11})/);
  return match?.[1] || null;
}

function mapAbout(about) {
  const gallery = about.ABOUT_GALLERY_COLUMNS.map((column, columnIndex) =>
    column.map((item) => ({ ...item, column: columnIndex }))
  );

  return [
    createContentRecord({
      slug: "mission-vision",
      title: "Mission and Vision",
      body: {
        cards: about.MISSION_VISION_CARDS.map(({ icon: _icon, ...card }) => ({
          ...card,
          iconKey: card.id,
        })),
      },
      sortOrder: 1,
    }),
    createContentRecord({
      slug: "impact-metrics",
      title: "Impact Metrics",
      body: { metrics: about.IMPACT_METRICS },
      sortOrder: 2,
    }),
    createContentRecord({
      slug: "moments-features",
      title: "Moments Features",
      body: { features: about.MOMENTS_FEATURES },
      sortOrder: 3,
    }),
    createContentRecord({
      slug: "gallery",
      title: "Gallery",
      body: { columns: gallery },
      sortOrder: 4,
    }),
  ];
}

function mapTalents(talents) {
  const categoryRecords = talents.TALENT_CATEGORIES.filter((category) => category.id !== "all").map(
    (category, index) =>
      createContentRecord({
        slug: slugify(category.id),
        title: category.label,
        summary: null,
        sortOrder: index + 1,
      })
  );

  const featuredSlugs = new Set(talents.FEATURED_TALENTS.map((item) => item.slug));
  const trendingSlugs = new Set(talents.TRENDING_TALENTS.map((item) => item.slug));

  const talentRecords = talents.TALENT_DIRECTORY_ITEMS.map((item, index) => ({
    ...createContentRecord({
      slug: item.slug,
      title: item.name,
      summary: item.subtitle || item.bio || null,
      body: {
        ...item,
        sourceId: item.id,
        featuredOnHomepage: featuredSlugs.has(item.slug),
        trending: trendingSlugs.has(item.slug),
      },
      sortOrder: index + 1,
      featured: featuredSlugs.has(item.slug) || trendingSlugs.has(item.slug),
    }),
    location: item.location || null,
  }));

  const categorySlugs = new Set(categoryRecords.map((category) => category.slug));
  const assignments = talentRecords
    .map((talent) => {
      const categoryKey = talent.body.categoryKey || talent.body.category;
      const categorySlug = slugify(categoryKey);
      if (!categorySlugs.has(categorySlug)) {
        return null;
      }
      return {
        talent_slug: talent.slug,
        talent_category_slug: categorySlug,
        is_primary: true,
        sort_order: 0,
      };
    })
    .filter(Boolean);

  return { categoryRecords, talentRecords, assignments };
}

function mapEvents(events) {
  const allEvents = uniqueBySlug(
    [...events.UPCOMING_EVENTS, ...events.PAST_EVENTS]
      .filter((event) => event.slug)
      .map((event) => ({ ...event, slug: slugify(event.slug) }))
  );

  const categoryNames = Array.from(
    new Set(allEvents.map((event) => event.category).filter(Boolean))
  );
  const categoryRecords = categoryNames.map((title, index) =>
    createContentRecord({ slug: slugify(title), title, sortOrder: index + 1 })
  );

  const eventRecords = allEvents.map((event, index) => ({
    ...createContentRecord({
      slug: event.slug,
      title: event.title,
      summary: event.description || event.dateString || null,
      body: {
        ...event,
        sourceId: event.id,
        parsedStartAt: parseDisplayEventDate(event),
      },
      sortOrder: index + 1,
      featured: Boolean(event.isPopular),
    }),
    starts_at: parseDisplayEventDate(event),
    venue_name: event.location || null,
    venue_address: event.location || null,
    timezone: "Africa/Lagos",
  }));

  const assignments = eventRecords.map((event) => ({
    event_slug: event.slug,
    event_category_slug: slugify(event.body.category),
    is_primary: true,
    sort_order: 0,
  }));

  return { categoryRecords, eventRecords, assignments };
}

function mapBlog(blog) {
  const authorNames = Array.from(new Set(blog.BLOG_ARTICLES.map((article) => article.author).filter(Boolean)));
  const authorRecords = authorNames.map((name, index) =>
    createContentRecord({
      slug: slugify(name),
      title: name,
      summary: null,
      sortOrder: index + 1,
    })
  );

  const categoryRecords = [{ slug: "journal", title: "Journal", summary: null, sort_order: 1 }].map(
    (category) => ({ ...category, status: DEFAULT_STATUS, published_at: null, scheduled_at: null, featured: false })
  );

  const postRecords = blog.BLOG_ARTICLES.map((article, index) => ({
    ...createContentRecord({
      slug: article.slug,
      title: article.title,
      summary: article.excerpt || null,
      body: {
        sourceId: article.id,
        badge: article.badge,
        format: article.format,
        readTime: article.readTime,
        displayDate: article.date,
        image: article.image,
      },
      sortOrder: index + 1,
      featured: index < 3,
    }),
    author_slug: slugify(article.author),
  }));

  const assignments = postRecords.map((post) => ({
    blog_post_slug: post.slug,
    blog_category_slug: "journal",
    is_primary: true,
    sort_order: 0,
  }));

  return { authorRecords, categoryRecords, postRecords, assignments };
}

function mapMediaCandidates(media) {
  const candidates = [
    { ...media.FEATURED_HERO_MEDIA, sourcePlacement: "media-hero" },
    ...media.MEDIA_VIDEOS.map((item) => ({ ...item, sourcePlacement: "video-catalog" })),
  ]
    .map((item) => ({ ...item, youtubeVideoId: extractYoutubeId(item.videoUrl) }))
    .filter((item) => item.youtubeVideoId)
    .reduce((records, item) => {
      if (!records.some((record) => record.youtube_video_id === item.youtubeVideoId)) {
        records.push({
          slug: slugify(item.id || `youtube-${item.youtubeVideoId}`),
          title: item.title,
          summary: item.subtitle || item.description || null,
          media_source: "youtube",
          media_type: "video",
          youtube_original_url: item.videoUrl,
          youtube_video_id: item.youtubeVideoId,
          youtube_embed_url: `https://www.youtube.com/embed/${item.youtubeVideoId}`,
          youtube_thumbnail_url: `https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`,
          body: {
            sourceConstantId: item.id || "featured-hero-media",
            thumbnail: item.thumbnail || item.bgImage || null,
            author: item.author || null,
            duration: item.duration || null,
            views: item.views || null,
          },
          sort_order: records.length + 1,
          featured: item.sourcePlacement === "media-hero",
          status: DEFAULT_STATUS,
          published_at: null,
          scheduled_at: null,
        });
      }
      return records;
    }, []);

  return candidates;
}

/**
 * Converts current constants into records compatible with the existing web
 * schema. All records default to draft, preventing accidental publication.
 *
 * The result intentionally excludes form defaults containing PII, UI-only
 * controls, derived arrays, merchandise/cart data, and generated demo media.
 */
export function transformConstantsToRecords(constants) {
  const talent = mapTalents(constants.talents);
  const event = mapEvents(constants.events);
  const blog = mapBlog(constants.blog);

  return {
    formatVersion: 1,
    generatedAt: new Date().toISOString(),
    defaultStatus: DEFAULT_STATUS,
    tables: {
      about_sections: mapAbout(constants.about),
      talent_categories: talent.categoryRecords,
      talents: talent.talentRecords,
      talent_category_assignments: talent.assignments,
      event_categories: event.categoryRecords,
      events: event.eventRecords,
      event_category_assignments: event.assignments,
      blog_authors: blog.authorRecords,
      blog_categories: blog.categoryRecords,
      blog_posts: blog.postRecords,
      blog_post_categories: blog.assignments,
    },
    reviewCandidates: {
      media_assets: mapMediaCandidates(constants.media),
      testimonials: cloneSerializable(constants.testimonials.TESTIMONIALS),
      eventDetailsTemplate: cloneSerializable(constants.events.DEFAULT_EVENT_DETAILS),
      blogHeroSlides: cloneSerializable(constants.blog.BLOG_HERO_SLIDES),
      blogPillars: cloneSerializable(constants.blog.BLOG_PILLARS),
    },
    excluded: {
      theme: "Design tokens remain local and are not editorial content.",
      talentApplication: "Wizard options and INITIAL_FORM_DATA include UI state and mock PII.",
      talentBooking: "Wizard options and request state remain local until a booking entity exists.",
      generatedMedia: "Generated video, podcast, music, and gallery arrays remain local until approved media metadata exists.",
      merchandise: "Merchandise and demo cart data are explicitly excluded from this CMS migration.",
    },
  };
}

export { slugify };
