import Image from "next/image";
import Link from "next/link";
import styles from "./MerchHero.module.css";

/**
 * 4-Point Geometric Sparkle Star matching the design specification
 */
function SparkleStar({ className = "", size = 48 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
    </svg>
  );
}

/**
 * MerchHero Component
 * - Desktop (≥1024px): Full-height background model spanning top-to-bottom of the 663px hero.
 * - Mobile (<1024px): Clean stacked layout with model visual and stats row preventing any text collision.
 */
export function MerchHero({ onShopNowClick }) {
  return (
    <section className={styles.heroSection} aria-label="Merchandise Hero">
      {/* Desktop Full-Height Background Model Layer (Desktop ONLY) */}
      <div className={styles.desktopBgLayer} aria-hidden="true">
        {/* Top Right Black Sparkle Star */}
        <SparkleStar className={styles.desktopStarTopRight} size={52} />

        {/* Middle Left Black Sparkle Star */}
        <SparkleStar className={styles.desktopStarMiddleLeft} size={38} />

        {/* Full-Height Model Image Touching Top & Bottom Edge */}
        <div className={styles.desktopModelWrapper}>
          <Image
            src="/assets/img/merchandise/hero-model-exact-cutout.png"
            alt=""
            width={554}
            height={471}
            priority
            className={styles.desktopModelImg}
          />
        </div>
      </div>

      {/* Main Foreground Container */}
      <div className={styles.container}>
        <div className={styles.mainGrid}>
          {/* Left Column: Hero Content & Desktop Stats */}
          <div className={styles.leftCol}>
            {/* Outline Badge */}
            <div className={styles.badgeWrapper}>
              <span className={styles.badge}>
                Welcome to Royz Houz Collections
              </span>
            </div>

            {/* Main Dual-Tone Headline */}
            <h1 className={styles.title}>
              Discover Your New <br />
              New <span className={styles.highlightText}>Body-Care</span> <br />
              <span className={styles.highlightText}>Must Haves</span>
            </h1>

            {/* Subtitle */}
            <p className={styles.description}>
              Explore our top body enhancers that not just only make you stand out
              but redefines your entire look as well as giving you the best
              confidence you could imagine.
            </p>

            {/* CTA Buttons */}
            <div className={styles.ctaGroup}>
              <button
                type="button"
                onClick={onShopNowClick}
                className={styles.primaryBtn}
              >
                Shop Now
              </button>

              <Link href="/donate" className={styles.secondaryBtn}>
                Support Our Mission
              </Link>
            </div>

            {/* Key Statistics Row (Desktop: inside left column) */}
            <div className={styles.desktopStatsRow}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>200+</span>
                <span className={styles.statLabel}>International Brands</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statNumber}>2,000+</span>
                <span className={styles.statLabel}>High-Quality Products</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statNumber}>30,000+</span>
                <span className={styles.statLabel}>Happy Customers</span>
              </div>
            </div>
          </div>

          {/* Right Column for Mobile/Tablet ONLY (Inline on < lg) */}
          <div className={styles.mobileRightCol}>
            <div className={styles.mobileModelContainer}>
              <SparkleStar className={styles.mobileStarTopRight} size={44} />
              <SparkleStar className={styles.mobileStarMiddleLeft} size={32} />

              <div className={styles.mobileModelImageWrapper}>
                <Image
                  src="/assets/img/merchandise/hero-model-exact-cutout.png"
                  alt="Royz House Merchandise Collection Model"
                  width={554}
                  height={471}
                  priority
                  className={styles.mobileModelImg}
                />
              </div>
            </div>
          </div>

          {/* Mobile Statistics Row (Mobile/Tablet ONLY) */}
          <div className={styles.mobileStatsRow}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>200+</span>
              <span className={styles.statLabel}>International Brands</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>2,000+</span>
              <span className={styles.statLabel}>High-Quality Products</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>30,000+</span>
              <span className={styles.statLabel}>Happy Customers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MerchHero;




