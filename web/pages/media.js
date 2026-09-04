import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  MediaHero,
  MediaFilters,
  MediaVideos,
  MediaPodcasts,
  MediaMusic,
  MediaGallery,
  MediaCta,
} from "@/components/media";
import {
  FEATURED_HERO_MEDIA,
  MEDIA_VIDEOS,
  MEDIA_PODCASTS,
  MEDIA_MUSIC_SPOTLIGHT,
  MEDIA_GALLERY_PHOTOS,
} from "@/constants/media";
import { listMedia } from "@/services/content/mediaService";
import { getMediaPageSettings } from "@/services/content/mediaPageService";
import { DEFAULT_MEDIA_PAGE_CONTENT } from "@/constants/mediaPage";

function isPodcast(item) {
  return String(item.category || item.section || "").toLowerCase().includes("podcast");
}

function getMediaContent(records) {
  const videos = records.videos.filter((item) => !isPodcast(item));
  const podcasts = records.videos.filter(isPodcast);
  const musicTracks = records.music;
  const explicitlyFeatured = records.videos.find((item) => item.featured) || null;

  return {
    featured: explicitlyFeatured,
    videos,
    podcasts,
    musicTracks,
    photos: records.photos,
  };
}

const FALLBACK_MEDIA_CONTENT = {
  featured: FEATURED_HERO_MEDIA,
  videos: MEDIA_VIDEOS,
  podcasts: MEDIA_PODCASTS,
  musicTracks: [MEDIA_MUSIC_SPOTLIGHT.featuredTrack, ...MEDIA_MUSIC_SPOTLIGHT.tracks],
  photos: MEDIA_GALLERY_PHOTOS,
};

/**
 * Media Page route (/media) orchestrating featured hero, interactive media filters,
 * video showcases, podcast episodes, music spotlight, and visual gallery.
 * Synchronizes active tab with query parameters (e.g. /media?tab=videos).
 */
export default function MediaPage({ mediaContent, pageContent }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const content = mediaContent || FALLBACK_MEDIA_CONTENT;
  const page = Object.keys(DEFAULT_MEDIA_PAGE_CONTENT).reduce((result, section) => ({
    ...result,
    [section]: typeof DEFAULT_MEDIA_PAGE_CONTENT[section] === "object"
      ? { ...DEFAULT_MEDIA_PAGE_CONTENT[section], ...(pageContent?.[section] || {}) }
      : pageContent?.[section] ?? DEFAULT_MEDIA_PAGE_CONTENT[section],
  }), {});

  // If a featured media asset is present, it takes precedence.
  // The media page settings hero acts as the fallback if no featured hero is present.
  const hasFeaturedHero = Boolean(
    content.featured &&
    content.featured.id !== "featured-home" &&
    (content.featured.title || content.featured.slug)
  );

  const featuredHero = hasFeaturedHero
    ? {
        ...page.hero,
        ...content.featured,
        badge: content.featured.category || content.featured.badge || page.hero?.badge || "FEATURED NOW",
        title: content.featured.title,
        highlightTitle: "",
        description: content.featured.description || content.featured.subtitle || page.hero?.description || "",
        bgImage: content.featured.thumbnail || content.featured.bgImage || content.featured.image || page.hero?.bgImage,
        duration: content.featured.duration || page.hero?.duration,
        views: content.featured.views || page.hero?.views,
        author: {
          name: content.featured.author?.name || page.hero?.authorName || "Royz Houz",
          avatar: content.featured.author?.avatar || page.hero?.authorAvatar || "/assets/img/talents/david.jpg",
        },
      }
    : {
        ...content.featured,
        ...page.hero,
        author: {
          name: page.hero?.authorName || content.featured?.author?.name || "Royz Houz",
          avatar: page.hero?.authorAvatar || content.featured?.author?.avatar || "/assets/img/talents/david.jpg",
        },
      };

  useEffect(() => {
    if (router.isReady) {
      const tabParam = router.query.tab;
      setActiveTab(tabParam && typeof tabParam === "string" ? tabParam : "all");
    }
  }, [router.isReady, router.query.tab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    router.push(
      { pathname: "/media", query: newTab === "all" ? {} : { tab: newTab } },
      undefined,
      { shallow: true }
    );
  };

  const handleOpenVideo = (media) => {
    const targetId = media?.slug || media?.id;
    if (targetId) router.push(`/media/watch/${encodeURIComponent(targetId)}`);
  };

  const filteredVideos = useMemo(() => filterMedia(content.videos, searchQuery), [content.videos, searchQuery]);
  const filteredPodcasts = useMemo(() => filterMedia(content.podcasts, searchQuery), [content.podcasts, searchQuery]);
  const filteredPhotos = useMemo(() => filterMedia(content.photos, searchQuery), [content.photos, searchQuery]);
  const filteredMusic = useMemo(() => filterMedia(content.musicTracks, searchQuery), [content.musicTracks, searchQuery]);
  const musicData = useMemo(
    () => ({ featuredTrack: filteredMusic[0] || null, tracks: filteredMusic.slice(1, 7) }),
    [filteredMusic]
  );

  const isAllTab = activeTab === "all";
  const showVideos = isAllTab || activeTab === "videos";
  const showPodcasts = isAllTab || activeTab === "podcasts";
  const showMusic = isAllTab || activeTab === "music";
  const showGallery = isAllTab || activeTab === "gallery";

  return (
    <>
      <Head>
        <title>{page.seo?.title || "Media & Highlights | Royz House"}</title>
        <meta name="description" content={page.seo?.description || "Explore inspiring videos, podcast conversations, original music tracks, and photo galleries from Royz House."} />
      </Head>

      <main className="bg-white min-h-screen">
        <MediaHero featured={featuredHero} onWatchNow={handleOpenVideo} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4">
          <MediaFilters
            activeTab={activeTab}
            onTabChange={handleTabChange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            pageContent={page.filters}
          />

          {showVideos && <MediaVideos videos={filteredVideos} pageContent={page.videos} onVideoClick={handleOpenVideo} onViewAll={handleTabChange} isFullView={activeTab === "videos"} />}
          {showPodcasts && <MediaPodcasts podcasts={filteredPodcasts} spotlightPodcasts={filteredPodcasts} pageContent={page.podcasts} onPodcastClick={handleOpenVideo} onViewAll={handleTabChange} isFullView={activeTab === "podcasts"} />}
          {showMusic && <MediaMusic musicData={musicData} musicTracks={filteredMusic} discoverTracks={filteredMusic.slice(0, 3)} pageContent={page.music} onMusicClick={handleOpenVideo} onViewAll={handleTabChange} isFullView={activeTab === "music"} />}
          {showGallery && <MediaGallery photos={filteredPhotos} pageContent={page.gallery} onViewAll={handleTabChange} isFullView={activeTab === "gallery"} />}
          <MediaCta pageContent={page.cta} />
        </div>
      </main>
    </>
  );
}

function filterMedia(items, searchQuery) {
  if (!searchQuery.trim()) return items;
  const query = searchQuery.toLowerCase();
  return items.filter((item) =>
    [item.title, item.subtitle, item.description, item.category, item.genre, item.artist, item.host, item.author?.name]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))
  );
}

export async function getStaticProps() {
  const [videos, music, photos, pageSettings] = await Promise.all([
    listMedia({ type: "video" }),
    listMedia({ type: "audio" }),
    listMedia({ type: "image" }),
    getMediaPageSettings(),
  ]);

  const isDatabaseUnavailable = !videos.success || !music.success || !photos.success;
  const records = { videos: videos.data || [], music: music.data || [], photos: photos.data || [] };
  const isDatabaseEmpty = !records.videos.length && !records.music.length && !records.photos.length;

  return {
    props: {
      mediaContent: isDatabaseUnavailable || isDatabaseEmpty ? FALLBACK_MEDIA_CONTENT : getMediaContent(records),
      pageContent: pageSettings.success ? pageSettings.data : DEFAULT_MEDIA_PAGE_CONTENT,
    },
    revalidate: 60,
  };
}
