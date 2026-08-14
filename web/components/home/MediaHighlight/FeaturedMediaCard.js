import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import styles from "./MediaHighlight.module.css";

/**
 * Top large featured media card (Documentary / Highlight Banner).
 */
export function FeaturedMediaCard({ item }) {
  return (
    <article className={`${styles.featuredCard} group`}>
      {/* Background Image */}
      <Image
        src={item.image}
        alt={item.title}
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
        <span className={styles.badge}>{item.category}</span>

        {/* Title */}
        <h3 className={styles.featuredTitle}>{item.title}</h3>

        {/* Metadata Row */}
        <div className={styles.metaRow}>
          <span>{item.duration}</span>
          <span>•</span>
          <span>{item.views}</span>
          <span>•</span>
          <div className={styles.metaAuthor}>
            <div className={styles.authorAvatar}>
              <Image
                src={item.author.avatar}
                alt={item.author.name}
                fill
                className="object-cover"
              />
            </div>
            <span>{item.author.name}</span>
          </div>
        </div>

        {/* Watch CTA Button */}
        <Link href={item.watchLink} className={styles.watchBtn}>
          <Play className={styles.playIcon} />
          <span>Watch Now</span>
        </Link>
      </div>
    </article>
  );
}
