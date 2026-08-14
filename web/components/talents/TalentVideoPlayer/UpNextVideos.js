import Image from "next/image";
import Link from "next/link";
import styles from "./TalentVideoPlayer.module.css";

/**
 * UpNextVideos sidebar widget rendering video queue with interactive playback selection.
 */
export function UpNextVideos({
  videos = [
    {
      id: "golden-hour",
      title: "Golden Hour",
      artist: "Amaka Nwosu",
      duration: "4 : 01",
      thumbnail: "/assets/img/talents/upnext-golden-hour.jpg",
      href: "/talents/julius-ayomide/video/golden-hour",
    },
    {
      id: "beautiful-chaos",
      title: "Beautiful Chaos",
      artist: "Tee Brown",
      duration: "3 : 28",
      thumbnail: "/assets/img/talents/upnext-beautiful-chaos.jpg",
      href: "/talents/julius-ayomide/video/beautiful-chaos",
    },
    {
      id: "new-beginnings",
      title: "New Beginnings",
      artist: "Ayo Kalu",
      duration: "4 : 18",
      thumbnail: "/assets/img/talents/upnext-new-beginnings.jpg",
      href: "/talents/julius-ayomide/video/new-beginnings",
    },
  ],
  activeVideoId,
  onSelectVideo,
}) {
  const videoList = videos || [];

  return (
    <div className={styles.upNextCard} aria-label="Up Next Videos">
      <h3 className={styles.widgetHeading}>Up Next</h3>

      <div className={styles.upNextList}>
        {videoList.map((vid) => {
          const isActive =
            activeVideoId &&
            (activeVideoId === vid.id ||
              String(activeVideoId).toLowerCase() === String(vid.title).toLowerCase());

          return (
            <Link
              key={vid.id}
              href={vid.href || "#"}
              onClick={(e) => {
                if (onSelectVideo) {
                  e.preventDefault();
                  onSelectVideo(vid);
                }
              }}
              className={`${styles.upNextItem} ${
                isActive ? "bg-amber-500/10 border-l-2 border-l-[#C8781A]" : ""
              }`}
            >
              <div className={styles.upNextLeft}>
                <div className={styles.upNextThumb}>
                  <Image
                    src={vid.thumbnail || "/assets/img/talents/upnext-golden-hour.jpg"}
                    alt={vid.title}
                    fill
                    sizes="48px"
                    className="object-cover object-center"
                  />
                </div>

                <div className={styles.upNextDetails}>
                  <span
                    className={`${styles.upNextTitle} ${
                      isActive ? "text-[#B46A2C] font-bold" : ""
                    }`}
                  >
                    {vid.title}
                  </span>
                  <span className={styles.upNextArtist}>{vid.artist}</span>
                </div>
              </div>

              <span className={styles.upNextDuration}>{vid.duration}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default UpNextVideos;
