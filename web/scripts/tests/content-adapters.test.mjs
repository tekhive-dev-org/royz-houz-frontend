import assert from "node:assert/strict";
import test from "node:test";

import { toTalentDirectoryItem, toFeaturedTalent } from "../../adapters/talentAdapter.js";
import { toEventCard, toEventDetails } from "../../adapters/eventAdapter.js";
import { toBlogArticle } from "../../adapters/blogAdapter.js";
import { formatDisplayViews, parseBaselineViews, toMediaTrack, toMediaVideo, toPublicMediaAsset } from "../../adapters/mediaAdapter.js";
import { normalizeYouTubeUrl } from "../../utils/media/youtube.js";
import { toAboutContent } from "../../adapters/aboutAdapter.js";
import {
  buildTalentVideoQueue,
  findTalentMedia,
  findTalentVideo,
  getSafeAudioSource,
  getSafeVideoSource,
  getTalentMediaItems,
  getTalentMediaPath,
  getTalentVideoPath,
  partitionTalentVideoQueue,
} from "../../components/talents/TalentVideoPlayer/talentVideoUtils.js";

const publishedAt = "2026-01-01T00:00:00.000Z";

test("talent adapters preserve the existing directory and featured-card contracts", () => {
  const row = {
    id: "database-talent-id",
    slug: "zara-diallo",
    title: "Zara Diallo",
    summary: "Creative director",
    location: "Dakar, Senegal",
    talent_category_assignments: [
      {
        talent_category_id: "category-secondary",
        is_primary: false,
        sort_order: 2,
        talent_categories: { id: "category-secondary", title: "Creative Directors", slug: "creative-directors" },
      },
      {
        talent_category_id: "category-primary",
        is_primary: true,
        sort_order: 1,
        talent_categories: { id: "category-primary", title: "Fashion Designers", slug: "fashion-designers" },
      },
    ],
    body: {
      id: "zara-diallo",
      name: "Zara Diallo",
      category: "Legacy Category",
      categoryKey: "legacy-category",
      genre: "Contemporary Fashion",
      rating: 4.9,
      followers: "58K",
      image: "/assets/img/talents/zara.jpg",
      isHot: true,
      tabs: ["About"],
    },
  };

  const directoryItem = toTalentDirectoryItem(row);
  assert.deepEqual(directoryItem.tabs, ["About"]);
  assert.equal(directoryItem.category, "Fashion Designers");
  assert.equal(directoryItem.categoryKey, "fashion-designers");
  assert.deepEqual(directoryItem.categoryIds, ["category-primary", "category-secondary"]);
  assert.equal(directoryItem.primaryCategoryId, "category-primary");
  assert.deepEqual(toFeaturedTalent(row), {
    id: "zara-diallo",
    slug: "zara-diallo",
    name: "Zara Diallo",
    category: "Fashion Designers",
    genre: "Contemporary Fashion",
    location: "Dakar, Senegal",
    rating: 4.9,
    followers: "58K",
    image: "/assets/img/talents/zara.jpg",
    isHot: true,
  });
});

test("talent adapter retains legacy category fields when no published assignment is joined", () => {
  const talent = toTalentDirectoryItem({
    id: "legacy-talent",
    slug: "legacy-talent",
    title: "Legacy Talent",
    body: {
      category: "Writer",
      categoryKey: "writers",
      categoryIds: ["legacy-category"],
      primaryCategoryId: "legacy-category",
    },
  });

  assert.equal(talent.category, "Writer");
  assert.equal(talent.categoryKey, "writers");
  assert.deepEqual(talent.categoryIds, ["legacy-category"]);
  assert.equal(talent.primaryCategoryId, "legacy-category");
});

test("talent adapter does not expose stale category metadata after a successful empty category join", () => {
  const talent = toTalentDirectoryItem({
    id: "uncategorized-talent",
    slug: "uncategorized-talent",
    title: "Uncategorized Talent",
    talent_category_assignments: [],
    body: {
      category: "Unpublished Category",
      categoryKey: "unpublished-category",
      categoryIds: ["unpublished-category-id"],
      primaryCategoryId: "unpublished-category-id",
    },
  });

  assert.equal(talent.category, "");
  assert.equal(talent.categoryKey, "");
  assert.deepEqual(talent.categoryIds, []);
  assert.equal(talent.primaryCategoryId, null);
});

test("talent playback queue retains order and always includes the current video", () => {
  const storedVideos = [
    { id: "video-1", title: "First" },
    { id: "video-2", title: "Second" },
  ];

  const talent = { slug: "ada-creative", videos: storedVideos };
  const queue = buildTalentVideoQueue(talent, storedVideos[1]);
  assert.deepEqual(queue.map((video) => video.id), ["video-1", "video-2"]);
  assert.deepEqual(queue.map((video) => video.slug), ["first", "second"]);
  assert.equal(getTalentVideoPath(talent, queue[1]), "/talents/ada-creative/video/second");
  assert.equal(findTalentVideo(talent, "second").id, "video-2");
  assert.equal(findTalentVideo(talent, "video-2").slug, "second");
  const partitionedQueue = partitionTalentVideoQueue(queue, "video-1");
  assert.equal(partitionedQueue.currentVideo.id, "video-1");
  assert.deepEqual(partitionedQueue.upcomingVideos.map((video) => video.id), ["video-2"]);
  const wrappedQueue = partitionTalentVideoQueue(queue, "video-2");
  assert.deepEqual(wrappedQueue.upcomingVideos.map((video) => video.id), ["video-1"]);
  assert.deepEqual(
    buildTalentVideoQueue({ videos: storedVideos }, { id: "routed-video", title: "Current" }).map((video) => video.id),
    ["routed-video", "video-1", "video-2"]
  );
});

test("talent media utilities combine videos and music into safe canonical routes", () => {
  const mediaTalent = {
    slug: "ada-creative",
    videos: [
      {
        id: "video-1",
        title: "Live Session",
        videoUrl: "https://youtu.be/dQw4w9WgXcQ",
      },
    ],
    musicTracks: [
      {
        id: "track-1",
        title: "Golden Hour",
        trackUrl: "https://res.cloudinary.com/demo/video/upload/golden-hour.mp3",
      },
    ],
  };

  const mediaItems = getTalentMediaItems(mediaTalent);

  assert.deepEqual(
    mediaItems.map((item) => [item.slug, item.mediaType]),
    [
      ["live-session", "video"],
      ["golden-hour", "music"],
    ]
  );
  assert.equal(
    getTalentMediaPath(mediaTalent, mediaItems[1]),
    "/talents/ada-creative/media/golden-hour"
  );
  assert.equal(findTalentMedia(mediaTalent, "golden-hour").mediaType, "music");
  assert.equal(getSafeAudioSource("https://example.com/audio/song.mp3").type, "audio");
  assert.equal(getSafeAudioSource("https://spotify.com/track/example"), null);
});

test("event adapters retain current display date and detail fields", () => {
  const row = {
    id: "database-event-id",
    slug: "fashion-forward-abuja",
    title: "Fashion Forward: Abuja",
    summary: "Fashion showcase",
    starts_at: "2026-10-08T00:00:00.000Z",
    venue_name: "National Diamond Centre",
    venue_address: "Abuja, Nigeria",
    featured: true,
    body: {
      id: "fashion-forward-abuja",
      day: "08",
      month: "Oct",
      year: "2026",
      category: "Fashion Show",
      image: "/assets/img/events/events-hero-bg.png",
      ticketLink: "/events/fashion-forward-abuja",
    },
  };

  assert.equal(toEventCard(row).ticketLink, "/events/fashion-forward-abuja");
  assert.equal(toEventDetails(row).venue, "Abuja, Nigeria");
  assert.equal(toEventDetails(row).heroImage, "/assets/img/events/events-hero-bg.png");
});

test("blog and media adapters map stored JSON metadata to component-facing fields", () => {
  const article = toBlogArticle({
    id: "database-post-id",
    slug: "creative-career",
    title: "Creative Career",
    summary: "An article excerpt",
    published_at: publishedAt,
    body: {
      id: "creative-career",
      badge: "PREMIUM",
      format: "PODCAST",
      readTime: "5min read",
      displayDate: "January 1, 2026",
      image: "/assets/img/blog/post-ballet.jpg",
    },
  });
  const media = toMediaVideo({
    id: "database-media-id",
    title: "Beyond the Stage",
    summary: "Stories",
    media_source: "youtube",
    youtube_original_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtube_video_id: "dQw4w9WgXcQ",
    youtube_thumbnail_url: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    published_at: publishedAt,
    body: { duration: "22:45", author: { name: "Royz Production", avatar: "" } },
  });

  assert.equal(article.readTime, "5min read");
  assert.equal(article.image, "/assets/img/blog/post-ballet.jpg");
  assert.equal(media.videoUrl, "https://www.youtube.com/embed/dQw4w9WgXcQ");
  assert.equal(media.duration, "22:45");
});

test("shared media adapter returns a safe responsive image projection", () => {
  const media = toPublicMediaAsset({
    id: "database-media-id",
    slug: "gallery-photo",
    title: "Gallery photo",
    summary: "A portrait",
    media_source: "cloudinary",
    media_type: "image",
    secure_url: "https://res.cloudinary.com/royz-houz/image/upload/v1/gallery-photo.jpg",
    alt_text: "A creative portrait",
    width: 1600,
    height: 900,
    body: {},
  });

  assert.equal(media.url, "https://res.cloudinary.com/royz-houz/image/upload/v1/gallery-photo.jpg");
  assert.equal(media.responsiveImages.length, 3);
  assert.match(media.responsiveImages[0].url, /f_auto,q_auto,c_limit,w_480,dpr_auto/);
  assert.equal(media.altText, "A creative portrait");
});

test("YouTube normalization accepts supported URL forms and rejects arbitrary embeds", () => {
  assert.deepEqual(normalizeYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), {
    originalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoId: "dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  });
  assert.equal(normalizeYouTubeUrl("https://youtu.be/dQw4w9WgXcQ").videoId, "dQw4w9WgXcQ");
  assert.equal(normalizeYouTubeUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ").videoId, "dQw4w9WgXcQ");
  assert.deepEqual(getSafeVideoSource("https://youtu.be/dQw4w9WgXcQ"), {
    type: "youtube",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoId: "dQw4w9WgXcQ",
  });
  assert.throws(() => normalizeYouTubeUrl("https://evil.example/embed/dQw4w9WgXcQ"));
  assert.throws(() => normalizeYouTubeUrl("<iframe src='https://youtube.com'></iframe>"));
});

test("about adapter restores the exact section arrays consumed by About components", () => {
  const content = toAboutContent([
    { slug: "mission-vision", body: { cards: [{ id: "mission" }] } },
    { slug: "impact-metrics", body: { metrics: [{ id: "impact" }] } },
    { slug: "moments-features", body: { features: [{ id: "moments" }] } },
    { slug: "gallery", body: { columns: [[{ id: "gallery-1" }]] } },
  ]);

  assert.deepEqual(content.whyChooseUs.cards.map((card) => ({ ...card, icon: undefined })), [{ id: "mission", icon: undefined }]);
  assert.equal(typeof content.whyChooseUs.cards[0].icon, "function", "iconKey is resolved to the frontend icon component");
  assert.deepEqual(content.whyChooseUs.metrics, [{ id: "impact" }]);
  assert.deepEqual(content.moments.features, [{ id: "moments" }]);
  assert.deepEqual(content.gallery.columns, [[{ id: "gallery-1" }]]);
});

test("media adapters format display views and preserve baselines", () => {
  assert.equal(parseBaselineViews("440K views"), 440000);
  assert.equal(parseBaselineViews("12.4k"), 12400);
  assert.equal(parseBaselineViews("1.5M views"), 1500000);
  assert.equal(parseBaselineViews("42"), 42);
  assert.equal(parseBaselineViews(""), 0);

  assert.equal(formatDisplayViews(0), "0 views");
  assert.equal(formatDisplayViews(1), "1 view");
  assert.equal(formatDisplayViews(42), "42 views");
  assert.equal(formatDisplayViews(1200), "1.2K views");
  assert.equal(formatDisplayViews(20000), "20K views");
  assert.equal(formatDisplayViews(1500000), "1.5M views");

  const videoWithViewCount = toMediaVideo({
    id: "vid-1",
    slug: "live-session",
    title: "Live Session",
    body: { view_count: 1200, views: "1.2K views" },
  });
  assert.equal(videoWithViewCount.views, "1.2K views");
  assert.equal(videoWithViewCount.viewCount, 1200);

  const trackWithLegacyViews = toMediaTrack({
    id: "track-1",
    slug: "golden-hour",
    title: "Golden Hour",
    body: { views: "440K views" },
  });
  assert.equal(trackWithLegacyViews.views, "440K views");
  assert.equal(trackWithLegacyViews.viewCount, 440000);
});

