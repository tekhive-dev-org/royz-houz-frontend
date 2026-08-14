import Link from "next/link";
import Image from "next/image";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  const stats = [
    { value: "500+", label: "Verified Talents" },
    { value: "50+", label: "Projects Delivered" },
    { value: "4.7/5", label: "Platform Rating" },
    { value: "100K+", label: "Lives Impacted" },
  ];

  return (
    <section className={styles.heroSection}>
      {/* Background Image with Dark Vignette & Gradient Overlay */}
      <div className={styles.bgContainer}>
        <Image
          src="/assets/img/home-hero.png"
          alt="African Creatives Concert Background"
          fill
          priority
          className={styles.bgImage}
        />
        {/* Gradients for readability */}
        <div className={styles.overlayGradient} />
      </div>

      {/* Main Hero Content */}
      <div className={styles.contentWrapper}>
        <div className={styles.textContent}>
          
          {/* Badge */}
          <div className={styles.badge}>
            <span className={styles.badgeText}>Welcome to Royz Houz</span>
          </div>

          {/* Headline */}
          <h1 className={styles.headline}>
            BUILDING AFRICA’S<br />
            NEXT GENERATION OF<br />
            <span className={styles.headlineHighlight}>
              CREATIVES, LEADERS<br />
              &amp; INNOVATORS
            </span>
          </h1>

          {/* Subtitle */}
          <p className={styles.subtitle}>
            We discover. We develop. We empower. Together, we are a legacy that transforms lives and communities.
          </p>

          {/* Action CTA Buttons */}
          <div className={styles.actionsRow}>
            <Link href="/talents" className={styles.primaryCta}>
              Explore Talents
            </Link>

            <Link href="/about" className={styles.secondaryCta}>
              <span>Support Our Mission</span>
            </Link>
          </div>

          {/* Hero Stats Row */}
          <div className={styles.statsContainer}>
            {stats.map((stat, idx) => (
              <div key={idx} className={styles.statItem}>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroSection;
