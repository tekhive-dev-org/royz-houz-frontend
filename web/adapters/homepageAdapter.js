import { toSection } from "./contentAdapter.js";
import { toBlogArticle } from "./blogAdapter.js";
import { toEventCard } from "./eventAdapter.js";
import { toMediaVideo } from "./mediaAdapter.js";
import { toFeaturedTalent } from "./talentAdapter.js";

const SECTION_KEYS = {
  hero: "hero",
  "featured-talents": "featuredTalents",
  "our-impact": "ourImpact",
  "upcoming-events": "upcomingEvents",
  "media-highlight": "mediaHighlight",
  "latest-blog": "latestBlog",
  "community-cta": "communityCta",
  testimonials: "testimonials",
  "support-movement": "supportMovement",
};

function toHomepageSection(row) {
  const section = toSection(row);
  const isVisible =
    section.featured !== false &&
    section.visible !== false &&
    (section.status ? section.status === "published" : true);

  const ctaLabel = section.ctaLabel || section.cta?.label || section.viewAllLabel;
  const ctaUrl = section.ctaUrl || section.cta?.href || section.viewAllHref;
  const image = section.imageUrl || section.image || section.backgroundImage || "";
  const imageAlt = section.imageAlt || section.alt || section.backgroundImageAlt || "";
  const badge = section.eyebrow || section.badge || "";
  const headline = section.heading || section.headline || section.title || "";
  const description = section.description || section.summary || "";

  const normalized = {
    ...section,
    visible: isVisible,
    ...(badge ? { badge, eyebrow: badge } : {}),
    ...(headline ? { headline, heading: headline } : {}),
    ...(description ? { description, summary: description } : {}),
    ...(image ? { image, imageUrl: image, backgroundImage: image } : {}),
    ...(imageAlt ? { imageAlt, alt: imageAlt, backgroundImageAlt: imageAlt } : {}),
    ...(ctaLabel ? { viewAllLabel: ctaLabel, cta: { label: ctaLabel, href: ctaUrl || "#" } } : {}),
    ...(ctaUrl ? { viewAllHref: ctaUrl } : {}),
  };

  if (section.slug === "hero") {
    const secondaryLabel =
      section.secondaryCtaLabel ||
      section.ctaSecondary?.label ||
      section.secondaryCta?.label;
    const secondaryUrl =
      section.secondaryCtaUrl ||
      section.ctaSecondary?.href ||
      section.secondaryCta?.href;

    const parsedStats =
      Array.isArray(section.stats) && section.stats.length > 0
        ? section.stats.filter((s) => s && (s.value || s.label))
        : undefined;

    const headingHighlight =
      section.headingHighlight ||
      section.headlineHighlight ||
      "";

    return {
      ...normalized,
      backgroundImage: image || section.backgroundImage || section.image || "",
      backgroundImageAlt: imageAlt || section.backgroundImageAlt || section.imageAlt || section.alt || "",
      description: description || section.description || section.summary || "",
      heading: section.heading || undefined,
      headingHighlight: headingHighlight || undefined,
      primaryCta: ctaLabel
        ? { label: ctaLabel, href: ctaUrl || "#" }
        : section.primaryCta || section.ctaPrimary || null,
      secondaryCta: secondaryLabel
        ? { label: secondaryLabel, href: secondaryUrl || "#" }
        : section.secondaryCta || section.ctaSecondary || null,
      ...(parsedStats && parsedStats.length > 0 ? { stats: parsedStats } : {}),
    };
  }

  if (section.slug === "testimonials") {
    const parsedTestimonials =
      Array.isArray(section.testimonials) && section.testimonials.length > 0
        ? section.testimonials.filter((t) => t && (t.name || t.quote))
        : undefined;

    return {
      ...normalized,
      ...(parsedTestimonials && parsedTestimonials.length > 0 ? { testimonials: parsedTestimonials } : {}),
    };
  }

  return normalized;
}

function toFeaturedMediaItem(row) {
  const media = toMediaVideo(row);
  const targetId = row.slug || media.slug || row.id || media.databaseId || media.id;
  const watchLink = targetId ? `/media/watch/${encodeURIComponent(targetId)}` : "/media";
  return {
    id: media.id,
    slug: row.slug || media.slug,
    category: media.category || "",
    title: media.title,
    duration: media.duration,
    views: media.views,
    image: media.thumbnail,
    watchLink,
    author: media.author,
  };
}

function toMediaHighlightItem(row) {
  const media = toMediaVideo(row);
  const targetId = row.slug || media.slug || row.id || media.databaseId || media.id;
  const link = targetId ? `/media/watch/${encodeURIComponent(targetId)}` : "/media";
  return {
    id: media.id,
    slug: row.slug || media.slug,
    title: media.title,
    author: media.author?.name || "Royz Houz",
    duration: media.duration,
    image: media.thumbnail,
    link,
  };
}

/**
 * Converts published homepage section records and their featured content into
 * the exact prop contracts used by the existing homepage sections.
 */
export function toHomepageContent({
  sections = [],
  talents = [],
  events = [],
  posts = [],
  media = [],
  testimonials = null,
} = {}) {
  const content = {};

  const sortedSections = sections
    .map(toHomepageSection)
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));

  sortedSections.forEach((section) => {
    const key = SECTION_KEYS[section.slug];
    if (key) content[key] = section;
  });

  content.sectionOrder = sortedSections
    .map((section) => SECTION_KEYS[section.slug])
    .filter(Boolean);

  if (talents.length) {
    content.featuredTalents = {
      ...(content.featuredTalents || {}),
      talents: talents.map(toFeaturedTalent),
    };
  }

  if (events.length) {
    content.upcomingEvents = {
      ...(content.upcomingEvents || {}),
      events: events.map(toEventCard),
    };
  }

  if (posts.length) {
    content.latestBlog = {
      ...(content.latestBlog || {}),
      posts: posts.map((post) => toBlogArticle(post)),
    };
  }

  if (media.length) {
    const highlights = media.slice(1, 4).map(toMediaHighlightItem);
    content.mediaHighlight = {
      ...(content.mediaHighlight || {}),
      featuredMedia: toFeaturedMediaItem(media[0]),
      ...(highlights.length > 0 ? { mediaHighlights: highlights } : {}),
    };
  }

  if (testimonials) {
    const rawItems = Array.isArray(testimonials.items)
      ? testimonials.items
      : Array.isArray(testimonials)
      ? testimonials
      : [];
    const activeItems = rawItems
      .filter((t) => t && t.isActive !== false && (t.name || t.quote))
      .map((t) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        quote: t.quote,
        avatar: t.avatar,
      }));

    content.testimonials = {
      ...(content.testimonials || {}),
      ...(testimonials.badge ? { badge: testimonials.badge, eyebrow: testimonials.badge } : {}),
      ...(testimonials.title ? { title: testimonials.title, heading: testimonials.title } : {}),
      ...(testimonials.description ? { description: testimonials.description } : {}),
      ...(activeItems.length > 0 ? { testimonials: activeItems } : {}),
    };
  }

  return content;
}

export function isHomepageSectionVisible(content, sectionName) {
  return content?.[sectionName]?.visible !== false;
}
