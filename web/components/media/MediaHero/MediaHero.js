import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import styles from "./MediaHero.module.css";

/**
 * MediaHero component rendering featured video showcase with atmospheric background and play trigger.
 */
export function MediaHero({ featured, onWatchNow }) {
  if (!featured) return null;

  return (
    <section className={styles.heroSection} aria-label="Featured Media Highlight">
      {/* Atmospheric Background Image & Overlays */}
      <div className={styles.bgWrapper}>
        <Image
          src={featured.bgImage || "/assets/img/talent-hero.jpg"}
          alt="Featured Spotlight"
          fill
          priority
          sizes="100vw"
          className={styles.bgImage}
        />
        <div className={styles.darkGradientOverlay} />
      </div>

      {/* Hero Content Container */}
      <div className={styles.contentWrapper}>
        <div className={styles.contentContainer}>
          {/* Featured Video Badge */}
          <div className={styles.badgeWrapper}>
            <span className={styles.featuredBadge}>
              {featured.badge || "FEATURED NOW"}
            </span>
          </div>

          {/* Dynamic Headline */}
          <h1 className={styles.heroHeading}>
            {featured.title && (
              <span className={styles.whiteTitle}>{featured.title}</span>
            )}
            {featured.highlightTitle && (
              <span className={styles.amberHighlight}>
                {featured.highlightTitle}
              </span>
            )}
          </h1>

          {/* Dynamic Subtitle */}
          {featured.description && (
            <p className={styles.heroDescription}>{featured.description}</p>
          )}

          {/* Meta Row: Author, Duration, Views */}
          <div className={styles.metaRow}>
            {featured.author && (
              <div className={styles.authorGroup}>
                <div className={styles.authorAvatarWrapper}>
                  <Image
                    src={featured.author.avatar || "/assets/img/talents/david.jpg"}
                    alt={featured.author.name}
                    fill
                    sizes="32px"
                    className={styles.authorAvatar}
                  />
                </div>
                <span className={styles.authorName}>{featured.author.name}</span>
              </div>
            )}

            <span className={styles.metaStat}>{featured.duration}</span>
            <span className={styles.metaStat}>{featured.views}</span>
          </div>

          {/* Primary CTA */}
          <div className={styles.ctaWrapper}>
            <button
              type="button"
              onClick={() => onWatchNow?.(featured)}
              className={styles.watchNowBtn}
            >
              <Play className="w-3.5 h-3.5 fill-white text-white" />
              <span>Watch Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb Bottom Bar */}
      <div className={styles.breadcrumbBar}>
        <div className={styles.breadcrumbContainer}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSlash}>/</span>
          <span className={styles.breadcrumbActive}>Media</span>
        </div>
      </div>
    </section>
  );
}

export default MediaHero;
