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
  const normalized = {
    ...section,
    visible: section.visible !== false,
  };

  if (section.slug === "hero") {
    return {
      ...normalized,
      backgroundImage: section.backgroundImage || section.image || "",
      backgroundImageAlt: section.backgroundImageAlt || section.imageAlt || section.alt || "",
      description: section.description || section.summary || "",
      primaryCta: section.primaryCta || section.ctaPrimary || null,
      secondaryCta: section.secondaryCta || section.ctaSecondary || null,
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
export function toHomepageContent({ sections = [], talents = [], events = [], posts = [], media = [] } = {}) {
  const content = {};

  sections
    .map(toHomepageSection)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .forEach((section) => {
      const key = SECTION_KEYS[section.slug];
      if (key) content[key] = section;
    });

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

  return content;
}

export function isHomepageSectionVisible(content, sectionName) {
  return content?.[sectionName]?.visible !== false;
}
