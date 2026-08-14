import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import styles from "./MediaHighlight.module.css";

/**
 * Individual media highlight card for the bottom 3-card grid.
 * Displays thumbnail, duration badge, author, title and hover play overlay.
 */
export function MediaCard({ item }) {
  return (
    <Link href={item.link} className={styles.mediaCard}>
      {/* Thumbnail Container */}
      <div className={styles.thumbnailWrapper}>
        <Image
          src={item.image}
          alt={item.title}
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
        <span className={styles.durationBadge}>{item.duration}</span>
      </div>

      {/* Card Information */}
      <div className={styles.cardBody}>
        <h4 className={styles.cardTitle}>{item.title}</h4>
        <span className={styles.cardAuthor}>{item.author}</span>
      </div>
    </Link>
  );
}
