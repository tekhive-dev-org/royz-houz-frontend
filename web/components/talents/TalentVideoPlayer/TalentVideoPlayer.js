import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { VideoPlayerHero } from "./VideoPlayerHero";
import { VideoPlayerMeta } from "./VideoPlayerMeta";
import { ProductionCredits } from "./ProductionCredits";
import { TalentMiniProfile } from "./TalentMiniProfile";
import { UpNextVideos } from "./UpNextVideos";
import { MoreTalents } from "./MoreTalents";
import { ShareModal } from "../TalentProfile/ShareModal";
import { ReportModal } from "@/components/common";
import styles from "./TalentVideoPlayer.module.css";

function parseDurationToSeconds(str) {
  if (!str) return 214;
  const clean = String(str).trim();
  if (clean.includes(":")) {
    const parts = clean.split(":");
    return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
  }
  if (clean.includes("min")) {
    return (parseInt(clean, 10) || 4) * 60;
  }
  return 214;
}

/**
 * TalentVideoPlayer root orchestrator layout for video player pages.
 */
export function TalentVideoPlayer({
  talent = {
    name: "Julius Ayomide",
    category: "Music Producer",
    followers: "98K",
    bio: "Julius Ayomide is a creative music producer and beatmaker specializing in Afrobeats, Hip-Hop, and contemporary African sounds.",
    image: "/assets/img/talents/julius.jpg",
    coverImage: "/assets/img/talents/amara.jpg",
    slug: "julius-ayomide",
  },
  video = {
    id: "prod-reel",
    title: "The Sound Architect",
    thumbnail: "/assets/img/talents/producer-hero.jpg",
  },
  breadcrumbRoot = { label: "Talent Hub", href: "/talents" },
}) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Get portfolio items list from talent data
  const portfolioItems =
    talent.videoReel?.portfolioItems ||
    talent.musicTracks || [];

  // Default active track is either the item marked isActive or index 0
  const initialTrack =
    portfolioItems.find((item) => item.isActive) ||
    portfolioItems[0] ||
    null;

  const [activeTrack, setActiveTrack] = useState(initialTrack);

  // Synchronize current video on the main player with the active track
  const currentVideo = {
    ...video,
    id: activeTrack?.id || video.id,
    title: activeTrack?.title || video.title,
    thumbnail:
      activeTrack?.thumbnail ||
      talent.videoReel?.thumbnail ||
      video.thumbnail,
    duration:
      parseDurationToSeconds(activeTrack?.duration || activeTrack?.readTime) ||
      video.duration ||
      214,
  };

  const [activeMobileTab, setActiveMobileTab] = useState("playlist");

  // Determine category-specific playlist tab label for mobile
  const categoryUpper = (talent.category || "").toUpperCase();
  const getMobileTabLabel = () => {
    if (categoryUpper === "MUSICIAN") return "Playlist";
    if (categoryUpper === "ACTOR") return "Filmography";
    if (categoryUpper === "DANCER") return "Reel";
    if (categoryUpper === "INFLUENCER") return "Portfolio";
    if (categoryUpper === "WRITER") return "Portfolio";
    return "Credits";
  };

  const handleSelectTrack = (track) => {
    setActiveTrack(track);
  };

  const handleSelectUpNext = (upNextItem) => {
    // Check if there is a matching track in portfolioItems
    const matchingTrack = portfolioItems.find(
      (item) =>
        item.id === upNextItem.id ||
        item.title?.toLowerCase() === upNextItem.title?.toLowerCase()
    );

    if (matchingTrack) {
      setActiveTrack(matchingTrack);
    } else {
      setActiveTrack({
        id: upNextItem.id,
        title: upNextItem.title,
        thumbnail: upNextItem.thumbnail,
        duration: upNextItem.duration,
        subtitle: upNextItem.artist,
      });
    }

    if (typeof window !== "undefined" && window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.innerContainer}>
        {/* Top Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href={breadcrumbRoot.href || "/talents"} className={styles.breadcrumbLink}>
            <span className="inline-flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              {breadcrumbRoot.label || "Talent Hub"}
            </span>
          </Link>
          <span>/</span>
          <Link
            href={`/talents/${talent.slug || talent.id}`}
            className={styles.breadcrumbLink}
          >
            {talent.name}
          </Link>
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>
            {currentVideo.title}
          </span>
        </nav>

        {/* Main 2-Column Layout Grid */}
        <div className={styles.layoutGrid}>
          {/* Left Column: Video Player, Meta & Tabbed Content on Mobile */}
          <div className={styles.mainColumn}>
            <VideoPlayerHero video={currentVideo} />
            <VideoPlayerMeta
              title={currentVideo.title}
              talent={talent}
              onShareClick={() => setIsShareModalOpen(true)}
              onReportClick={() => setIsReportModalOpen(true)}
            />

            {/* Mobile Tab Navigation (< lg screens) */}
            <div
              className={styles.mobileTabNav}
              role="tablist"
              aria-label="Video Player Mobile Views"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeMobileTab === "playlist"}
                onClick={() => setActiveMobileTab("playlist")}
                className={`${styles.mobileTabBtn} ${
                  activeMobileTab === "playlist" ? styles.mobileTabBtnActive : ""
                }`}
              >
                <span>{getMobileTabLabel()}</span>
                <span
                  className={`${styles.mobileTabBadge} ${
                    activeMobileTab === "playlist" ? styles.mobileTabBadgeActive : ""
                  }`}
                >
                  {portfolioItems.length}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeMobileTab === "profile"}
                onClick={() => setActiveMobileTab("profile")}
                className={`${styles.mobileTabBtn} ${
                  activeMobileTab === "profile" ? styles.mobileTabBtnActive : ""
                }`}
              >
                <span>About & Up Next</span>
                <span
                  className={`${styles.mobileTabBadge} ${
                    activeMobileTab === "profile" ? styles.mobileTabBadgeActive : ""
                  }`}
                >
                  {(talent.videoReel?.upNextVideos || []).length}
                </span>
              </button>
            </div>

            {/* Desktop View: Always Show ProductionCredits in Left Column */}
            <div className="hidden lg:block">
              <ProductionCredits
                talent={talent}
                activeTrackId={activeTrack?.id}
                onSelectTrack={handleSelectTrack}
              />
            </div>

            {/* Mobile View: Conditionally Render Active Tab Content */}
            {activeMobileTab === "playlist" ? (
              <div className="block lg:hidden">
                <ProductionCredits
                  talent={talent}
                  activeTrackId={activeTrack?.id}
                  onSelectTrack={handleSelectTrack}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-6 lg:hidden">
                <TalentMiniProfile talent={talent} />
                <UpNextVideos
                  videos={talent.videoReel?.upNextVideos}
                  activeVideoId={currentVideo.id}
                  onSelectVideo={handleSelectUpNext}
                />
                <MoreTalents
                  talent={talent}
                  title={talent.relatedCategoryTitle}
                  talents={talent.relatedCreatives}
                />
              </div>
            )}
          </div>

          {/* Right Column: Desktop Sidebar (Hidden on Mobile) */}
          <div className={styles.sidebarColumn}>
            <TalentMiniProfile talent={talent} />
            <UpNextVideos
              videos={talent.videoReel?.upNextVideos}
              activeVideoId={currentVideo.id}
              onSelectVideo={handleSelectUpNext}
            />
            <MoreTalents
              talent={talent}
              title={talent.relatedCategoryTitle}
              talents={talent.relatedCreatives}
            />
          </div>
        </div>
      </div>

      {/* Video Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        talent={talent}
        video={currentVideo}
        shareType="video"
      />

      {/* Report Content Modal Dialog */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetTitle={currentVideo.title}
      />
    </div>
  );
}

export default TalentVideoPlayer;
