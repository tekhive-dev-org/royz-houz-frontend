import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HOMEPAGE_MEDIA_HIGHLIGHT_CONTENT } from "@/constants/homepageContent";
import { FeaturedMediaCard } from "./FeaturedMediaCard";
import { MediaCard } from "./MediaCard";
import styles from "./MediaHighlight.module.css";

/**
 * MediaHighlight section component displaying featured documentary banner and 3 media highlight cards.
 */
export function MediaHighlight({ content }) {
  const sectionContent = { ...HOMEPAGE_MEDIA_HIGHLIGHT_CONTENT, ...content };
  const mediaHighlights = Array.isArray(sectionContent.mediaHighlights)
    ? sectionContent.mediaHighlights
    : HOMEPAGE_MEDIA_HIGHLIGHT_CONTENT.mediaHighlights;
  const viewAllHref =
    sectionContent.viewAllHref && sectionContent.viewAllHref !== "/events"
      ? sectionContent.viewAllHref
      : "/media";
  const viewAllLabel =
    sectionContent.viewAllLabel && sectionContent.viewAllLabel !== "View all events"
      ? sectionContent.viewAllLabel
      : "View all media";

  return (
    <section className={styles.section} id="media-highlight">
      <div className={styles.container}>
        
        {/* Section Header */}
        <div className={styles.headerRow}>
          <div className={styles.titleGroup}>
            <span className={styles.titleBar} aria-hidden="true" />
            <h2 className={styles.title}>{sectionContent.title}</h2>
          </div>

          <Link href={viewAllHref} className={styles.viewAllLink}>
            <span>{viewAllLabel}</span>
            <ChevronRight className={styles.viewAllIcon} />
          </Link>
        </div>

        {/* Top Main Featured Media Banner */}
        <FeaturedMediaCard item={sectionContent.featuredMedia} />

        {/* Bottom 3-Card Grid */}
        <div className={styles.grid}>
          {mediaHighlights.map((media, index) => (
            <MediaCard key={media?.id || index} item={media} />
          ))}
        </div>

      </div>
    </section>
  );
}

export default MediaHighlight;
