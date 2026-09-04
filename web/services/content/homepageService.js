import { listPublicRecords } from "@/repositories/publicContentRepository";
import { toHomepageContent } from "@/adapters/homepageAdapter";
import { getContentClient, serviceFailure, serviceSuccess } from "./serviceUtils";

const FEATURED_CONTENT_LIMIT = 8;

/**
 * Loads only records exposed by public RLS policies, then adapts them into the
 * current homepage-section props. Content records remain independent; this
 * composition does not move database access into presentation components.
 */
export async function getHomepageContent({ client } = {}) {
  const contentClient = getContentClient(client);
  const featured = [{ column: "featured", value: true }];
  const [sections, talents, events, posts, media] = await Promise.all([
    listPublicRecords(contentClient, {
      source: "homepage_sections",
      order: { column: "sort_order" },
    }),
    listPublicRecords(contentClient, {
      source: "talents",
      filters: featured,
      order: { column: "sort_order" },
      pagination: { page: 1, limit: FEATURED_CONTENT_LIMIT, from: 0, to: FEATURED_CONTENT_LIMIT - 1 },
    }),
    listPublicRecords(contentClient, {
      source: "events",
      filters: featured,
      order: { column: "starts_at" },
      pagination: { page: 1, limit: FEATURED_CONTENT_LIMIT, from: 0, to: FEATURED_CONTENT_LIMIT - 1 },
    }),
    listPublicRecords(contentClient, {
      source: "blog_posts",
      filters: featured,
      order: { column: "published_at", ascending: false },
      pagination: { page: 1, limit: FEATURED_CONTENT_LIMIT, from: 0, to: FEATURED_CONTENT_LIMIT - 1 },
    }),
    listPublicRecords(contentClient, {
      source: "media_assets",
      filters: featured,
      order: { column: "sort_order" },
      pagination: { page: 1, limit: 4, from: 0, to: 3 },
    }),
  ]);

  const failedResult = [sections, talents, events, posts, media].find((result) => !result.success);
  if (failedResult) return serviceFailure(failedResult.error);

  let mediaItems = Array.isArray(media.data) ? [...media.data] : [];
  if (mediaItems.length < 4) {
    const publishedResult = await listPublicRecords(contentClient, {
      source: "media_assets",
      filters: [{ column: "status", value: "published" }],
      order: { column: "sort_order" },
      pagination: { page: 1, limit: 4, from: 0, to: 3 },
    });
    if (publishedResult.success && Array.isArray(publishedResult.data)) {
      const existingIds = new Set(mediaItems.map((m) => m.id));
      for (const item of publishedResult.data) {
        if (!existingIds.has(item.id)) {
          mediaItems.push(item);
          if (mediaItems.length >= 4) break;
        }
      }
    }
  }

  let blogPostItems = Array.isArray(posts.data) ? [...posts.data] : [];
  if (blogPostItems.length < 6) {
    const publishedResult = await listPublicRecords(contentClient, {
      source: "blog_posts",
      filters: [{ column: "status", value: "published" }],
      order: { column: "published_at", ascending: false },
      pagination: { page: 1, limit: 6, from: 0, to: 5 },
    });
    if (publishedResult.success && Array.isArray(publishedResult.data)) {
      const existingIds = new Set(blogPostItems.map((p) => p.id));
      for (const item of publishedResult.data) {
        if (!existingIds.has(item.id)) {
          blogPostItems.push(item);
          if (blogPostItems.length >= 6) break;
        }
      }
    }
  }

  return serviceSuccess(
    toHomepageContent({
      sections: sections.data,
      talents: talents.data,
      events: events.data,
      posts: blogPostItems,
      media: mediaItems,
    }),
    "Homepage content loaded successfully"
  );
}
