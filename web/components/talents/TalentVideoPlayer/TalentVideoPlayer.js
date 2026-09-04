import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronLeft } from "lucide-react";
import { VideoPlayerHero } from "./VideoPlayerHero";
import { VideoPlayerMeta } from "./VideoPlayerMeta";
import { TalentProductions } from "./TalentProductions";
import { TalentMiniProfile } from "./TalentMiniProfile";
import { UpNextVideos } from "./UpNextVideos";
import { MoreTalents } from "./MoreTalents";
import { ShareModal } from "../TalentProfile/ShareModal";
import { ReportModal } from "@/components/common";
import { submitContentReportRequest } from "@/services/contentReportApi";
import styles from "./TalentVideoPlayer.module.css";
import {
  buildTalentMediaQueue,
  getTalentMediaPath,
  parseMediaDurationToSeconds,
} from "./talentVideoUtils";
import { useMediaViewTracker } from "./useMediaViewTracker";

/**
 * TalentVideoPlayer root orchestrator for the unified productions media player.
 * Plays both published videos (video) and published music (audio) in one queue.
 */
export function TalentVideoPlayer({
  talent,
  media,
  breadcrumbRoot = { label: "Talent Hub", href: "/talents" },
}) {
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [activeMedia, setActiveMedia] = useState(null);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [detectedDuration, setDetectedDuration] = useState(null);

  useEffect(() => {
    setActiveMedia(null);
    setShouldAutoPlay(false);
    setDetectedDuration(null);
  }, [media?.id, media?.slug]);

  const handleDurationDetected = useCallback((durationSecs) => {
    if (durationSecs && Number.isFinite(durationSecs) && durationSecs > 0) {
      setDetectedDuration((prev) => {
        if (prev && Math.abs(prev - durationSecs) < 0.5) return prev;
        return durationSecs;
      });
    }
  }, []);

  const currentMedia = activeMedia
    ? {
        ...media,
        ...activeMedia,
        thumbnail:
          activeMedia.thumbnail || media.thumbnail || talent.coverImage || talent.image || "",
        videoUrl: activeMedia.videoUrl || "",
        trackUrl: activeMedia.trackUrl || "",
        mediaType: activeMedia.mediaType || "video",
        duration:
          detectedDuration ||
          parseMediaDurationToSeconds(activeMedia.duration || activeMedia.readTime) ||
          parseMediaDurationToSeconds(media.duration) ||
          0,
        displayDuration:
          activeMedia.displayDuration ||
          media.displayDuration ||
          "",
      }
    : {
        ...media,
        thumbnail: media.thumbnail || talent.coverImage || talent.image || "",
        mediaType: media.mediaType || "video",
        duration:
          detectedDuration ||
          parseMediaDurationToSeconds(media.duration || media.readTime) ||
          0,
        displayDuration:
          media.displayDuration ||
          "",
      };

  const { views: liveViews, recordPlaybackView } = useMediaViewTracker(currentMedia);

  const isMediaWatch = breadcrumbRoot?.href === "/media" || talent?.slug === "media";
  const resolveMediaPath = (item) => {
    if (!item) return null;
    const mediaSlug = item.slug || item.id;
    if (isMediaWatch) {
      return `/media/watch/${encodeURIComponent(mediaSlug)}`;
    }
    return getTalentMediaPath(talent, item);
  };

  const mediaQueue = buildTalentMediaQueue(talent, currentMedia).map((item) => ({
    ...item,
    href: resolveMediaPath(item) || "#",
  }));
  const videoItems = mediaQueue.filter((item) => item.mediaType !== "music");
  const musicItems = mediaQueue.filter((item) => item.mediaType === "music");

  const [activeMobileTab, setActiveMobileTab] = useState("playlist");

  const handleSelectMedia = (item) => {
    setActiveMedia(item);
    setShouldAutoPlay(true);
    const targetPath = resolveMediaPath(item);
    if (targetPath && targetPath !== "#") {
      void router.replace(targetPath, undefined, { shallow: true, scroll: false });
    }
  };

  const handleSelectUpNext = (upNextItem) => {
    setActiveMedia(upNextItem);
    setShouldAutoPlay(true);
    const mediaPath = resolveMediaPath(upNextItem);
    if (mediaPath && mediaPath !== "#") {
      void router.replace(mediaPath, undefined, { shallow: true, scroll: false });
    }

    if (typeof window !== "undefined" && window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmitReport = (report) =>
    submitContentReportRequest({
      ...report,
      targetType: currentMedia.databaseId ? "media_asset" : "talent_media",
      targetId: currentMedia.databaseId || talent.id,
      talentId: talent.id,
      targetKey: currentMedia.slug,
      targetTitle: currentMedia.title,
    });

  const handlePlaybackEnded = () => {
    const currentIndex = mediaQueue.findIndex(
      (item) => String(item.id) === String(currentMedia.id)
    );
    const nextItem =
      currentIndex >= 0 && mediaQueue.length > 1
        ? mediaQueue[(currentIndex + 1) % mediaQueue.length]
        : null;
    if (!nextItem || String(nextItem.id) === String(currentMedia.id)) return;

    setActiveMedia(nextItem);
    setShouldAutoPlay(true);
    const mediaPath = resolveMediaPath(nextItem);
    if (mediaPath && mediaPath !== "#") {
      void router.replace(mediaPath, undefined, { shallow: true, scroll: false });
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
            {currentMedia.title}
          </span>
        </nav>

        {/* Main 2-Column Layout Grid */}
        <div className={styles.layoutGrid}>
          {/* Left Column: Media Player, Meta & Tabbed Content on Mobile */}
          <div className={styles.mainColumn}>
            <VideoPlayerHero
              media={currentMedia}
              autoPlay={shouldAutoPlay}
              onEnded={handlePlaybackEnded}
              onDurationDetected={handleDurationDetected}
              onPlaybackStart={recordPlaybackView}
            />
            <VideoPlayerMeta
              title={currentMedia.title}
              talent={talent}
              media={{ ...currentMedia, views: liveViews || currentMedia.views }}
              onShareClick={() => setIsShareModalOpen(true)}
              onReportClick={() => setIsReportModalOpen(true)}
            />

            {/* Mobile Tab Navigation (< lg screens) */}
            <div
              className={styles.mobileTabNav}
              role="tablist"
              aria-label="Productions Player Mobile Views"
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
                <span>Productions</span>
                <span
                  className={`${styles.mobileTabBadge} ${
                    activeMobileTab === "playlist" ? styles.mobileTabBadgeActive : ""
                  }`}
                >
                  {mediaQueue.length}
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
                  {mediaQueue.length}
                </span>
              </button>
            </div>

            {/* Desktop View: Published productions */}
            <div className="hidden lg:block">
              <TalentProductions
                talent={talent}
                videos={videoItems}
                music={musicItems}
                activeMediaId={currentMedia.id}
                onSelectMedia={handleSelectMedia}
              />
            </div>

            {/* Mobile View: Conditionally Render Active Tab Content */}
            {activeMobileTab === "playlist" ? (
              <div className="block lg:hidden">
                <TalentProductions
                  talent={talent}
                  videos={videoItems}
                  music={musicItems}
                  activeMediaId={currentMedia.id}
                  onSelectMedia={handleSelectMedia}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-6 lg:hidden">
                <TalentMiniProfile talent={talent} />
                <UpNextVideos
                  videos={mediaQueue}
                  activeVideoId={currentMedia.id}
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
              videos={mediaQueue}
              activeVideoId={currentMedia.id}
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

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        talent={talent}
        video={currentMedia}
        shareType={currentMedia.mediaType === "music" ? "music" : "video"}
      />

      {/* Report Content Modal Dialog */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetTitle={currentMedia.title}
        onSubmit={handleSubmitReport}
      />
    </div>
  );
}

export default TalentVideoPlayer;
