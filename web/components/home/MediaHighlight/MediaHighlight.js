import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FEATURED_MEDIA, MEDIA_HIGHLIGHTS } from "@/constants/media";
import { FeaturedMediaCard } from "./FeaturedMediaCard";
import { MediaCard } from "./MediaCard";
import styles from "./MediaHighlight.module.css";

/**
 * MediaHighlight section component displaying featured documentary banner and 3 media highlight cards.
 */
export function MediaHighlight() {
  return (
    <section className={styles.section} id="media-highlight">
      <div className={styles.container}>
        
        {/* Section Header */}
        <div className={styles.headerRow}>
          <div className={styles.titleGroup}>
            <span className={styles.titleBar} aria-hidden="true" />
            <h2 className={styles.title}>Media Highlight</h2>
          </div>

          <Link href="/events" className={styles.viewAllLink}>
            <span>View all events</span>
            <ChevronRight className={styles.viewAllIcon} />
          </Link>
        </div>

        {/* Top Main Featured Media Banner */}
        <FeaturedMediaCard item={FEATURED_MEDIA} />

        {/* Bottom 3-Card Grid */}
        <div className={styles.grid}>
          {MEDIA_HIGHLIGHTS.map((media) => (
            <MediaCard key={media.id} item={media} />
          ))}
        </div>

      </div>
    </section>
  );
}

export default MediaHighlight;
