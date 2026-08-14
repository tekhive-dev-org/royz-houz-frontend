import Image from "next/image";
import { MOMENTS_FEATURES } from "@/constants/about";
import { FeatureItem } from "./FeatureItem";
import { RatingStars } from "./Icons";
import styles from "./Moments.module.css";

/**
 * Moments That Matters ("Who We Are") feature section component.
 */
export function Moments() {
  return (
    <section className={styles.section} id="moments-that-matters">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.badgeRow}>
            <span className={styles.badgeLine} aria-hidden="true" />
            <span>WHO WE ARE</span>
            <span className={styles.badgeLine} aria-hidden="true" />
          </div>

          <h2 className={styles.headline}>Moments That Matters</h2>

          <p className={styles.subtitle}>
            A visual journey celebrating the people, stories and unforgettable
            moments that continue to shape Royz Houz.
          </p>
        </div>

        {/* 2-Column Main Content */}
        <div className={styles.mainGrid}>
          {/* Left Column: Feature List & Reviews Footer */}
          <div className={styles.leftCol}>
            <div className={styles.featuresList}>
              {MOMENTS_FEATURES.map((feature) => (
                <FeatureItem key={feature.id} item={feature} />
              ))}
            </div>

            {/* Social Proof */}
            <div className={styles.proofFooter}>
              <h4 className={styles.proofTitle}>Trusted By 1500+ Clients</h4>
              <div className={styles.ratingRow}>
                <span className={styles.ratingScore}>4.8/5</span>
                <RatingStars aria-label="4.8 out of 5 stars" />
                <span className={styles.reviewsCount}>975 Reviews</span>
              </div>
            </div>
          </div>

          {/* Right Column: Showcase Image */}
          <div className={styles.rightCol}>
            <div className={styles.imageWrapper}>
              <Image
                src="/assets/img/about/moments.jpg"
                alt="Creative moments shaping Royz Houz"
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
