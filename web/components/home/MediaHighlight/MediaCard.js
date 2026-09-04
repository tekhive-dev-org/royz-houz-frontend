import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { HOMEPAGE_MEDIA_HIGHLIGHT_CONTENT } from "@/constants/homepageContent";
import styles from "./MediaHighlight.module.css";

/**
 * Individual media highlight card for the bottom 3-card grid.
 * Displays thumbnail, duration badge, author, title and hover play overlay.
 */
export function MediaCard({ item }) {
  const media = { ...HOMEPAGE_MEDIA_HIGHLIGHT_CONTENT.mediaHighlights[0], ...item };
  const targetId =
    media.slug ||
    (media.id && !String(media.id).startsWith("highlight-") ? media.id : null);
  const cardLink =
    media.link && media.link !== "/media"
      ? media.link
      : media.watchLink && media.watchLink !== "/media"
      ? media.watchLink
      : targetId
      ? `/media/watch/${encodeURIComponent(targetId)}`
      : "/media/watch/video-1";

  const authorName =
    typeof media.author === "object" && media.author !== null
      ? media.author.name || "Royz Houz"
      : media.author || "Royz Houz";

  return (
    <Link href={cardLink} className={styles.mediaCard}>
      {/* Thumbnail Container */}
      <div className={styles.thumbnailWrapper}>
        <Image
          src={media.image}
          alt={media.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={styles.thumbnail}
        />

        {/* Play Button Overlay (visible only on hover) */}
        <div className={styles.playOverlay}>
          <div className={styles.playCircle}>
            <Play className={styles.playIconCircle} />
          </div>
        </div>

        {/* Duration Badge */}
        <span className={styles.durationBadge}>{media.duration}</span>
      </div>

      {/* Card Information */}
      <div className={styles.cardBody}>
        <h4 className={styles.cardTitle}>{media.title}</h4>
        <span className={styles.cardAuthor}>{authorName}</span>
      </div>
    </Link>
  );
}
