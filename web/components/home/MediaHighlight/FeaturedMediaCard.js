import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { HOMEPAGE_MEDIA_HIGHLIGHT_CONTENT } from "@/constants/homepageContent";
import { formatBannerDuration } from "@/adapters/mediaAdapter";
import styles from "./MediaHighlight.module.css";

/**
 * Top large featured media card (Documentary / Highlight Banner).
 */
export function FeaturedMediaCard({ item }) {
  const authorObj =
    typeof item?.author === "object" && item?.author !== null
      ? item.author
      : typeof item?.author === "string" && item.author
      ? { name: item.author, avatar: "" }
      : {};

  const featuredMedia = {
    ...HOMEPAGE_MEDIA_HIGHLIGHT_CONTENT.featuredMedia,
    ...item,
    author: {
      ...HOMEPAGE_MEDIA_HIGHLIGHT_CONTENT.featuredMedia.author,
      ...authorObj,
    },
  };

  const targetId =
    featuredMedia.slug ||
    (featuredMedia.id && featuredMedia.id !== "featured-home" ? featuredMedia.id : null);
  const watchLink =
    featuredMedia.watchLink && featuredMedia.watchLink !== "/media"
      ? featuredMedia.watchLink
      : targetId
      ? `/media/watch/${encodeURIComponent(targetId)}`
      : "/media/watch/beyond-the-stage";

  return (
    <article className={`${styles.featuredCard} group`}>
      {/* Background Image */}
      <Image
        src={featuredMedia.image}
        alt={featuredMedia.title}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 1200px"
        className={styles.featuredImage}
      />

      {/* Overlay Gradient */}
      <div className={styles.featuredOverlay} />

      {/* Card Content */}
      <div className={styles.featuredContent}>
        {/* Category Pill */}
        <span className={styles.badge}>{featuredMedia.category}</span>

        {/* Title */}
        <h3 className={styles.featuredTitle}>{featuredMedia.title}</h3>

        {/* Metadata Row */}
        <div className={styles.metaRow}>
          <span>{formatBannerDuration(featuredMedia.duration)}</span>
          <span>•</span>
          <span>{featuredMedia.views}</span>
          <span>•</span>
          <div className={styles.metaAuthor}>
            <div className={styles.authorAvatar}>
              <Image
                src={featuredMedia.author.avatar}
                alt={featuredMedia.author.name}
                fill
                className="object-cover"
              />
            </div>
            <span>{featuredMedia.author.name}</span>
          </div>
        </div>

        {/* Watch CTA Button */}
        <Link href={watchLink} className={styles.watchBtn}>
          <Play className={styles.playIcon} />
          <span>Watch Now</span>
        </Link>
      </div>
    </article>
  );
}
