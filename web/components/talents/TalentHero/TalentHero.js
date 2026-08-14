import Image from "next/image";
import { SearchBar } from "./SearchBar";
import styles from "./TalentHero.module.css";

/**
 * TalentHero section introducing the talent hub directory.
 */
export function TalentHero({ onSearch }) {
  return (
    <section className={styles.hero} aria-label="Talent Hub Hero">
      {/* Background Image */}
      <div className={styles.bgImageWrapper}>
        <Image
          src="/assets/img/talent-hero.jpg"
          alt="African creative artist performing"
          fill
          priority
          sizes="100vw"
          className={styles.bgImage}
        />
      </div>

      {/* Atmospheric Overlays */}
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.bottomFade} aria-hidden="true" />

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Welcome Pill Badge */}
          <div className={styles.badge}>Welcome to Royz Houz</div>

          {/* Bold Headline */}
          <h1 className={styles.headline}>
            Building Africa’s Next Generation of
            <span className={styles.accentText}>
              Creatives, Leaders & Innovators
            </span>
          </h1>

          {/* Subtitle */}
          <p className={styles.subtitle}>
            We discover. We develop. We empower. Together, we are a legacy that
            transforms lives and communities.
          </p>

          {/* Search Input Bar */}
          <SearchBar onSearch={onSearch} />
        </div>
      </div>
    </section>
  );
}

export default TalentHero;
