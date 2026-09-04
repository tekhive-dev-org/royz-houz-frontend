import Image from "next/image";
import { MOMENTS_FEATURES } from "@/constants/about";
import { MOMENTS_CONTENT } from "@/constants/aboutContent";
import { FeatureItem } from "./FeatureItem";
import { RatingStars } from "./Icons";
import styles from "./Moments.module.css";

/**
 * Moments That Matters ("Who We Are") feature section component.
 */
export function Moments({
  content = MOMENTS_CONTENT,
  features = MOMENTS_FEATURES,
} = {}) {
  const sectionContent = { ...MOMENTS_CONTENT, ...(content || {}) };
  const momentsFeatures = Array.isArray(features) ? features : MOMENTS_FEATURES;

  return (
    <section className={styles.section} id="moments-that-matters">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.badgeRow}>
            <span className={styles.badgeLine} aria-hidden="true" />
            <span>{sectionContent.badge}</span>
            <span className={styles.badgeLine} aria-hidden="true" />
          </div>

          <h2 className={styles.headline}>{sectionContent.headline}</h2>

          <p className={styles.subtitle}>
            {sectionContent.subtitle}
          </p>
        </div>

        {/* 2-Column Main Content */}
        <div className={styles.mainGrid}>
          {/* Left Column: Feature List & Reviews Footer */}
          <div className={styles.leftCol}>
            <div className={styles.featuresList}>
              {momentsFeatures.map((feature, index) => (
                <FeatureItem key={feature?.id || index} item={feature} />
              ))}
            </div>

            {/* Social Proof */}
            <div className={styles.proofFooter}>
              <h4 className={styles.proofTitle}>{sectionContent.proofTitle}</h4>
              <div className={styles.ratingRow}>
                <span className={styles.ratingScore}>{sectionContent.ratingScore}</span>
                <RatingStars aria-label={sectionContent.ratingLabel} />
                <span className={styles.reviewsCount}>{sectionContent.reviewsCount}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Showcase Image */}
          <div className={styles.rightCol}>
            <div className={styles.imageWrapper}>
              <Image
                src={sectionContent.image}
                alt={sectionContent.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 550px"
                className={styles.showcaseImage}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Moments;
