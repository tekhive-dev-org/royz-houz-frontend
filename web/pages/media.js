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

/**
 * Media Page route (/media) orchestrating featured hero, interactive media filters,
 * video showcases, podcast episodes, music spotlight, and visual gallery.
 * Synchronizes active tab with query parameters (e.g. /media?tab=videos).
 */
export default function MediaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  // Synchronize state with router query parameter
  useEffect(() => {
    if (router.isReady) {
      const tabParam = router.query.tab;
      if (tabParam && typeof tabParam === "string") {
        setActiveTab(tabParam);
      } else {
        setActiveTab("all");
      }
    }
  }, [router.isReady, router.query.tab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    router.push(
      {
        pathname: "/media",
        query: newTab === "all" ? {} : { tab: newTab },
      },
      undefined,
      { shallow: true }
    );
  };

  // Navigate to dedicated media player page
  const handleOpenVideo = (video) => {
    const targetId = video?.id || "the-beat-behind-the-hit";
    router.push(`/media/watch/${encodeURIComponent(targetId)}`);
  };

  // Filtered datasets based on search input
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return MEDIA_VIDEOS;
    const q = searchQuery.toLowerCase();
    return MEDIA_VIDEOS.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.subtitle.toLowerCase().includes(q) ||
        v.author.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredPodcasts = useMemo(() => {
    if (!searchQuery.trim()) return MEDIA_PODCASTS;
    const q = searchQuery.toLowerCase();
    return MEDIA_PODCASTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.host.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) return MEDIA_GALLERY_PHOTOS;
    const q = searchQuery.toLowerCase();
    return MEDIA_GALLERY_PHOTOS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const isAllTab = activeTab === "all";
  const showVideos = isAllTab || activeTab === "videos";
  const showPodcasts = isAllTab || activeTab === "podcasts";
  const showMusic = isAllTab || activeTab === "music";
  const showGallery = isAllTab || activeTab === "gallery";

  return (
    <>
      <Head>
        <title>
          {activeTab === "videos"
            ? "Videos | Royz House"
            : "Media & Highlights | Royz House"}
        </title>
        <meta
          name="description"
          content="Explore inspiring videos, podcast conversations, original music tracks, and photo galleries from Royz House."
        />
      </Head>

      <main className="bg-white min-h-screen">
        {/* 1. Atmospheric Hero Spotlight (Consistent for all tabs) */}
        <MediaHero
          featured={FEATURED_HERO_MEDIA}
          onWatchNow={handleOpenVideo}
        />

        {/* 2. Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4">
          {/* Filter Tabs & Search Controls */}
          <MediaFilters
            activeTab={activeTab}
            onTabChange={handleTabChange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Section: Videos (Full catalog view when activeTab === "videos") */}
          {showVideos && (
            <MediaVideos
              videos={filteredVideos}
              onVideoClick={handleOpenVideo}
              onViewAll={handleTabChange}
              isFullView={activeTab === "videos"}
            />
          )}

          {/* Section: Podcasts (Full catalog view when activeTab === "podcasts") */}
          {showPodcasts && (
            <MediaPodcasts
              podcasts={filteredPodcasts}
              onPodcastClick={(p) =>
                handleOpenVideo({
                  title: p.title,
                  subtitle: p.description || p.host,
                  videoUrl: p.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ",
                })
              }
              onViewAll={handleTabChange}
              isFullView={activeTab === "podcasts"}
            />
          )}

          {/* Section: Music Spotlight (Full catalog view when activeTab === "music") */}
          {showMusic && (
            <MediaMusic
              musicData={MEDIA_MUSIC_SPOTLIGHT}
              onMusicClick={(track) => {
                handleOpenVideo({
                  id: track.id,
                  title: track.title,
                  subtitle: track.artist || track.genre,
                  thumbnail: track.coverImage,
                });
              }}
              onViewAll={handleTabChange}
              isFullView={activeTab === "music"}
            />
          )}

          {/* Section: Through The Lens (Gallery - Full view when activeTab === "gallery") */}
          {showGallery && (
            <MediaGallery
              photos={filteredPhotos}
              onViewAll={handleTabChange}
              isFullView={activeTab === "gallery"}
            />
          )}

          {/* Talent Call to Action */}
          <MediaCta />
        </div>
      </main>
    </>
  );
}
